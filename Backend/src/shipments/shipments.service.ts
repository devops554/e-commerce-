import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Shipment,
  ShipmentDocument,
  ShipmentStatus,
} from './schemas/shipment.schema';
import {
  TrackingHistory,
  TrackingHistoryDocument,
} from './schemas/tracking-history.schema';
import {
  AssignShipmentDto,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
  UpdateTrackingLocationDto,
} from './dto/shipment.dto';
import { Order, OrderStatus } from '../orders/schemas/order.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import {
  DeliveryPartner,
  DeliveryPartnerDocument,
} from '../delivery-partners/schemas/delivery-partner.schema';
import { InventoryService } from '../warehouses/inventory.service';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  constructor(
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
    @InjectModel(TrackingHistory.name)
    private trackingHistoryModel: Model<TrackingHistoryDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(DeliveryPartner.name)
    private deliveryPartnerModel: Model<DeliveryPartnerDocument>,
    private notificationsService: NotificationsService,
    private inventoryService: InventoryService,
  ) { }

  private generateTrackingNumber(): string {
    return (
      'TRK' +
      Date.now().toString() +
      Math.random().toString(36).substring(2, 7).toUpperCase()
    );
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async create(dto: CreateShipmentDto): Promise<ShipmentDocument> {
    // Check if an active shipment already exists for this order from this warehouse
    const activeShipment = await this.shipmentModel.findOne({
      orderId: new Types.ObjectId(dto.orderId),
      warehouseId: new Types.ObjectId(dto.warehouseId),
      status: {
        $not: {
          $in: [
            ShipmentStatus.CANCELLED,
            ShipmentStatus.DELIVERED,
            ShipmentStatus.RETURNED,
          ],
        },
      },
    });

    if (activeShipment) {
      throw new BadRequestException(
        'An active shipment already exists for this order chunk',
      );
    }

    const shipment = new this.shipmentModel({
      ...dto,
      trackingNumber: this.generateTrackingNumber(),
      status: ShipmentStatus.ORDER_PLACED,
    });

    // If deliveryPartnerId is provided during creation, set status to ASSIGNED
    if (dto.deliveryPartnerId) {
      shipment.status = ShipmentStatus.ASSIGNED_TO_DELIVERY;
      shipment.assignedAt = new Date();
    }

    const savedShipment = await shipment.save();

    // Update order items status to 'shipped' if assigned
    if (dto.deliveryPartnerId) {
      await this.syncWithOrder(savedShipment);

      // Notify delivery partner
      await this.notificationsService.create({
        title: 'New Delivery Assignment',
        message: `You have been assigned to deliver order chunk from warehouse.`,
        type: NotificationType.SHIPMENT,
        recipientRole: 'delivery_partner',
        recipientId: dto.deliveryPartnerId,
        link: `/delivery/shipments/${savedShipment._id}`,
        metadata: {
          shipmentId: savedShipment._id,
          orderId: savedShipment.orderId,
        },
      });
    }

    return savedShipment;
  }

  async assignPartner(
    shipmentId: string,
    dto: AssignShipmentDto,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Only allow assignment if status is ORDER_PLACED or CANCELLED
    if (
      shipment.status !== ShipmentStatus.ORDER_PLACED &&
      shipment.status !== ShipmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot assign partner to a shipment with status ${shipment.status}`,
      );
    }

    shipment.deliveryPartnerId = new Types.ObjectId(dto.deliveryPartnerId);
    shipment.status = ShipmentStatus.ASSIGNED_TO_DELIVERY;
    shipment.assignedAt = new Date();

    const updatedShipment = await shipment.save();
    await this.syncWithOrder(updatedShipment);

    // Notify delivery partner
    await this.notificationsService.create({
      title: 'New Delivery Assignment',
      message: `You have been assigned to a new delivery (Tracking: ${updatedShipment.trackingNumber}).`,
      type: NotificationType.SHIPMENT,
      recipientRole: 'delivery_partner',
      recipientId: dto.deliveryPartnerId,
      link: `/delivery/shipments/${updatedShipment._id}`,
      metadata: {
        shipmentId: updatedShipment._id,
        orderId: updatedShipment.orderId,
      },
    });

    return updatedShipment;
  }

  async acceptShipment(
    shipmentId: string,
    partnerId: string,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.deliveryPartnerId?.toString() !== partnerId) {
      throw new BadRequestException('Shipment is not assigned to you');
    }

    if (shipment.status !== ShipmentStatus.ASSIGNED_TO_DELIVERY) {
      throw new BadRequestException(
        `Cannot accept shipment with status ${shipment.status}`,
      );
    }

    shipment.status = ShipmentStatus.ACCEPTED;
    shipment.acceptedAt = new Date();

    const updatedShipment = await shipment.save();
    await this.syncWithOrder(updatedShipment);
    return updatedShipment;
  }

  async rejectShipment(
    shipmentId: string,
    partnerId: string,
    reason?: string,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.deliveryPartnerId?.toString() !== partnerId) {
      throw new BadRequestException('Shipment is not assigned to you');
    }

    // Mark current partner as 'REJECTED' or simply clear it and auto-reassign
    shipment.deliveryPartnerId = null as any;
    shipment.status = ShipmentStatus.ORDER_PLACED;

    const updatedShipment = await shipment.save();
    await this.syncWithOrder(updatedShipment);

    // Trigger auto-reassignment logic
    this.autoReassignPartner(shipmentId).catch((err) =>
      this.logger.error(
        `Auto-reassign failed for ${shipmentId}: ${err.message}`,
      ),
    );

    return updatedShipment;
  }

  async pickupShipment(shipmentId: string): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.status !== ShipmentStatus.ACCEPTED) {
      throw new BadRequestException('Shipment must be ACCEPTED before pickup');
    }

    shipment.status = ShipmentStatus.PICKED_UP;
    shipment.pickedAt = new Date();

    const updatedShipment = await shipment.save();

    // TRIGGER PHYSICAL STOCK REDUCTION
    // We find the order to get the quantities for items from this warehouse
    const order = await this.orderModel.findById(shipment.orderId);
    if (order) {
      for (const item of order.items) {
        if (
          item.warehouse?.toString() === shipment.warehouseId.toString() &&
          item.status !== OrderStatus.CANCELLED
        ) {
          try {
            await this.inventoryService.confirmDispatch(
              item.variant.toString(),
              shipment.warehouseId.toString(),
              item.quantity,
            );
            this.logger.log(
              `Stock dispatched for variant ${item.variant} from warehouse ${shipment.warehouseId}`,
            );
          } catch (error) {
            this.logger.error(
              `Stock dispatch failed for variant ${item.variant}: ${error.message}`,
            );
            // Note: We don't throw here to avoid blocking the pickup flow if stock records are inconsistent,
            // but we log the error for manual reconciliation.
          }
        }
      }
    }

    await this.syncWithOrder(updatedShipment);
    return updatedShipment;
  }

  async requestPickupOtp(shipmentId: string): Promise<{ message: string }> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.status !== ShipmentStatus.ACCEPTED) {
      throw new BadRequestException(
        'Shipment must be ACCEPTED before requesting pickup OTP',
      );
    }

    const otp = this.generateOtp();
    shipment.pickupOtp = otp;
    shipment.pickupOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await shipment.save();

    // Notify Delivery Partner
    if (shipment.deliveryPartnerId) {
      await this.notificationsService.create({
        title: 'Pickup OTP',
        message: `Your OTP for order pickup (Tracking: ${shipment.trackingNumber}) is ${otp}. Valid for 15 minutes.`,
        type: NotificationType.SHIPMENT,
        recipientRole: 'delivery_partner',
        recipientId: shipment.deliveryPartnerId.toString(),
        metadata: { shipmentId: shipment._id, otp },
      });
    }

    return { message: 'OTP sent to delivery partner' };
  }

  async verifyPickupOtp(
    shipmentId: string,
    otp: string,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.pickupOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (
      shipment.pickupOtpExpires &&
      new Date() > new Date(shipment.pickupOtpExpires)
    ) {
      throw new BadRequestException('OTP expired');
    }

    shipment.status = ShipmentStatus.PICKED_UP;
    shipment.pickedAt = new Date();
    shipment.pickupOtp = undefined;
    shipment.pickupOtpExpires = undefined;

    const updatedShipment = await shipment.save();

    // Trigger stock reduction
    const order = await this.orderModel.findById(shipment.orderId);
    if (order) {
      for (const item of order.items) {
        if (
          item.warehouse?.toString() === shipment.warehouseId.toString() &&
          item.status !== OrderStatus.CANCELLED
        ) {
          try {
            await this.inventoryService.confirmDispatch(
              item.variant.toString(),
              shipment.warehouseId.toString(),
              item.quantity,
            );
          } catch (error) {
            this.logger.error(`Stock dispatch failed: ${error.message}`);
          }
        }
      }
    }

    await this.syncWithOrder(updatedShipment);
    return updatedShipment;
  }

  async requestDeliveryOtp(shipmentId: string): Promise<{ message: string }> {
    const shipment = await this.shipmentModel
      .findById(shipmentId)
      .populate('orderId');
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        'Shipment must be OUT_FOR_DELIVERY before requesting delivery OTP',
      );
    }

    const otp = this.generateOtp();
    shipment.deliveryOtp = otp;
    shipment.deliveryOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await shipment.save();

    // Notify Customer (Order User)
    const order = shipment.orderId as any;
    if (order && order.user) {
      await this.notificationsService.create({
        title: 'Delivery OTP',
        message: `Your OTP for order delivery (Tracking: ${shipment.trackingNumber}) is ${otp}. Please share this with the delivery partner.`,
        type: NotificationType.SHIPMENT,
        recipientRole: 'customer',
        recipientId: order.user.toString(),
        metadata: { shipmentId: shipment._id, otp },
      });
    }

    return { message: 'OTP sent to customer' };
  }

  async verifyDeliveryOtp(
    shipmentId: string,
    otp: string,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.deliveryOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (
      shipment.deliveryOtpExpires &&
      new Date() > new Date(shipment.deliveryOtpExpires)
    ) {
      throw new BadRequestException('OTP expired');
    }

    shipment.status = ShipmentStatus.DELIVERED;
    shipment.deliveredAt = new Date();
    shipment.deliveryOtp = undefined;
    shipment.deliveryOtpExpires = undefined;

    const updatedShipment = await shipment.save();
    await this.syncWithOrder(updatedShipment);
    return updatedShipment;
  }

  async startDelivery(shipmentId: string): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.status !== ShipmentStatus.PICKED_UP) {
      throw new BadRequestException(
        'Shipment must be PICKED_UP before starting delivery',
      );
    }

    shipment.status = ShipmentStatus.OUT_FOR_DELIVERY;
    shipment.outForDeliveryAt = new Date();

    const updatedShipment = await shipment.save();
    await this.syncWithOrder(updatedShipment);
    return updatedShipment;
  }

  async completeDelivery(shipmentId: string): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        'Shipment must be OUT_FOR_DELIVERY before completion',
      );
    }

    shipment.status = ShipmentStatus.DELIVERED;
    shipment.deliveredAt = new Date();

    const updatedShipment = await shipment.save();
    await this.syncWithOrder(updatedShipment);

    // TODO: Trigger Commission Calculation logic here
    this.logger.log(
      `Delivery completed for shipment ${shipment.trackingNumber}. Triggering commission calculation...`,
    );

    return updatedShipment;
  }

  private async autoReassignPartner(shipmentId: string) {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) return;

    // Logic to find next available partner in the same warehouse
    const availablePartner = await this.deliveryPartnerModel.findOne({
      warehouseIds: shipment.warehouseId,
      availabilityStatus: 'ONLINE',
      accountStatus: 'ACTIVE',
      // We could also exclude partners who previously rejected this shipment if we had a history
    });

    if (availablePartner) {
      await this.assignPartner(shipmentId, {
        deliveryPartnerId: availablePartner._id.toString(),
      });
      this.logger.log(
        `Successfully auto-reassigned shipment ${shipmentId} to partner ${availablePartner.name}`,
      );
    } else {
      this.logger.warn(
        `No available partners found for auto-reassignment of shipment ${shipmentId}`,
      );
      // Notify manager that manual intervention is needed
      await this.notificationsService.create({
        title: 'Auto-Reassignment Failed',
        message: `No available partners to reassign shipment ${shipment.trackingNumber}.`,
        type: NotificationType.SHIPMENT,
        recipientRole: 'manager',
        recipientId: (shipment as any).warehouseId?.managerId?.toString(), // Assuming populated or reachable
      });
    }
  }

  async cancelShipment(
    shipmentId: string,
    reason?: string,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (shipment.status === ShipmentStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered shipment');
    }

    shipment.status = ShipmentStatus.CANCELLED;
    const updatedShipment = await shipment.save();

    // Update order items back to 'packed' so they can be reassigned
    await this.syncWithOrder(updatedShipment);

    // Notify delivery partner if assigned
    if (shipment.deliveryPartnerId) {
      await this.notificationsService.create({
        title: 'Delivery Cancelled',
        message: `Your assigned delivery (Tracking: ${shipment.trackingNumber}) has been cancelled.`,
        type: NotificationType.SHIPMENT,
        recipientRole: 'delivery_partner',
        recipientId: shipment.deliveryPartnerId.toString(),
        link: `/delivery/shipments`,
        metadata: { shipmentId: shipment._id },
      });
    }

    return updatedShipment;
  }

  async updateStatus(
    shipmentId: string,
    dto: UpdateShipmentStatusDto,
  ): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.status = dto.status;

    if (dto.status === ShipmentStatus.OUT_FOR_DELIVERY && !shipment.pickedAt) {
      shipment.pickedAt = new Date();
    } else if (dto.status === ShipmentStatus.DELIVERED) {
      shipment.deliveredAt = new Date();
    }

    const updatedShipment = await shipment.save();
    await this.syncWithOrder(updatedShipment);

    // Notify delivery partner about status updates initiated by manager
    // (If partner is the one updating, they obviously know, but often managers update it)
    if (shipment.deliveryPartnerId) {
      const statusDisplay = dto.status.replace(/_/g, ' ').toLowerCase();
      await this.notificationsService.create({
        title: `Shipment ${dto.status}`,
        message: `Shipment status updated to ${statusDisplay} (Tracking: ${shipment.trackingNumber}).`,
        type: NotificationType.SHIPMENT,
        recipientRole: 'delivery_partner',
        recipientId: shipment.deliveryPartnerId.toString(),
        link: `/delivery/shipments/${shipment._id}`,
        metadata: { shipmentId: shipment._id, status: dto.status },
      });
    }

    return updatedShipment;
  }

  private async syncWithOrder(shipment: ShipmentDocument) {
    const order = await this.orderModel.findById(shipment.orderId);
    if (!order) return;

    let targetItemStatus: OrderStatus;
    let targetOrderStatus: OrderStatus | null = null;

    switch (shipment.status) {
      case ShipmentStatus.ASSIGNED_TO_DELIVERY:
      case ShipmentStatus.ACCEPTED:
      case ShipmentStatus.PICKED_UP:
        targetItemStatus = OrderStatus.SHIPPED;
        break;
      case ShipmentStatus.OUT_FOR_DELIVERY:
        targetItemStatus = OrderStatus.OUT_FOR_DELIVERY;
        targetOrderStatus = OrderStatus.OUT_FOR_DELIVERY;
        break;
      case ShipmentStatus.DELIVERED:
        targetItemStatus = OrderStatus.DELIVERED;
        // Check if ALL items in the order are delivered to update main order status
        const allItemsDelivered = order.items.every(
          (item) =>
            item.status === OrderStatus.DELIVERED ||
            (item.warehouse?.toString() === shipment.warehouseId.toString() &&
              targetItemStatus === OrderStatus.DELIVERED),
        );
        if (allItemsDelivered) targetOrderStatus = OrderStatus.DELIVERED;
        break;
      case ShipmentStatus.CANCELLED:
        targetItemStatus = OrderStatus.PACKED; // Revert to packed for reassignment
        break;
      case ShipmentStatus.FAILED_DELIVERY:
        targetItemStatus = OrderStatus.FAILED_DELIVERY;
        break;
      default:
        return;
    }

    // Update only items belonging to this warehouse that are not cancelled or pending reassignment
    order.items.forEach((item) => {
      if (
        item.warehouse?.toString() === shipment.warehouseId.toString() &&
        item.status !== OrderStatus.CANCELLED &&
        item.status !== OrderStatus.PENDING_REASSIGNMENT
      ) {
        item.status = targetItemStatus;
      }
    });

    if (targetOrderStatus) {
      order.orderStatus = targetOrderStatus;
    }

    await order.save();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    warehouseId?: string;
    deliveryPartnerId?: string;
    orderId?: string;
    status?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      warehouseId,
      deliveryPartnerId,
      orderId,
      status,
    } = query;
    const filter: any = {};
    if (warehouseId) filter.warehouseId = warehouseId;
    if (deliveryPartnerId) filter.deliveryPartnerId = deliveryPartnerId;
    if (orderId) filter.orderId = orderId;
    if (status) filter.status = status;

    const [shipments, total] = await Promise.all([
      this.shipmentModel
        .find(filter)
        .populate('deliveryPartnerId', 'name phone vehicleType')
        .populate('warehouseId', 'name location')
        .populate({
          path: 'orderId',
          populate: [
            { path: 'user', select: 'name phone email' },
            { path: 'items.product', select: 'title images' },
            { path: 'items.variant', select: 'sku images' },
          ],
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.shipmentModel.countDocuments(filter),
    ]);

    return {
      data: shipments,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ShipmentDocument> {
    const shipment = await this.shipmentModel
      .findById(id)
      .populate('deliveryPartnerId', 'name phone vehicleType')
      .populate('warehouseId', 'name location')
      .populate({
        path: 'orderId',
        populate: [
          { path: 'user', select: 'name phone email' },
          { path: 'items.product', select: 'title images' },
          { path: 'items.variant', select: 'sku images' },
        ],
      })
      .lean()
      .exec();

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
  }

  async addTrackingLocation(
    shipmentId: string,
    dto: UpdateTrackingLocationDto,
  ): Promise<TrackingHistoryDocument> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const history = new this.trackingHistoryModel({
      shipmentId: shipment._id,
      status: dto.status,
      location: {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return history.save();
  }

  async getTrackingHistory(
    shipmentId: string,
  ): Promise<TrackingHistoryDocument[]> {
    return this.trackingHistoryModel
      .find({ shipmentId })
      .sort({ timestamp: -1 })
      .exec();
  }
}
