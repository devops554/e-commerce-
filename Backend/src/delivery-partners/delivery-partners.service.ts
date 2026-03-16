import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  DeliveryPartner,
  DeliveryPartnerDocument,
} from './schemas/delivery-partner.schema';
import {
  LoginDeliveryPartnerDto,
  RegisterDeliveryPartnerDto,
  UpdateDeliveryPartnerDto,
  UpdateLocationDto,
} from './dto/delivery-partner.dto';
import { encrypt, decrypt } from '../common/utils/crypto.util';
import { EventsGateway } from '../events/events.gateway';
import { Shipment, ShipmentDocument, ShipmentStatus } from '../shipments/schemas/shipment.schema';

@Injectable()
export class DeliveryPartnersService {
  private readonly logger = new Logger(DeliveryPartnersService.name);

  constructor(
    @InjectModel(DeliveryPartner.name)
    private partnerModel: Model<DeliveryPartnerDocument>,
    @InjectModel(Shipment.name)
    private shipmentModel: Model<ShipmentDocument>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) { }

  async register(
    dto: RegisterDeliveryPartnerDto,
  ): Promise<DeliveryPartnerDocument> {
    const {
      phone,
      email,
      password,
      aadhaarNumber,
      aadhaarImage,
      panNumber,
      panImage,
      drivingLicenseImage,
      ...rest
    } = dto;

    const existingPhone = await this.partnerModel.findOne({ phone });
    if (existingPhone) {
      throw new ConflictException(
        'Delivery partner with this phone number already exists',
      );
    }

    if (email) {
      const existingEmail = await this.partnerModel.findOne({ email });
      if (existingEmail) {
        throw new ConflictException(
          'Delivery partner with this email already exists',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = new this.partnerModel({
      ...rest,
      phone,
      email,
      password: hashedPassword,
      documents: {
        aadhaarNumber: encrypt(aadhaarNumber || ''),
        aadhaarImage: aadhaarImage || '',
        panNumber: encrypt(panNumber || ''),
        panImage: panImage || '',
        drivingLicenseImage: drivingLicenseImage || '',
      },
    });

    const savedPartner = await partner.save();
    return this.decryptPartner(savedPartner);
  }

  private decryptPartner(partner: any): any {
    if (!partner) return partner;
    const partnerObj = partner.toObject ? partner.toObject() : partner;

    if (partnerObj.documents) {
      if (partnerObj.documents.aadhaarNumber)
        partnerObj.documents.aadhaarNumber = decrypt(
          partnerObj.documents.aadhaarNumber,
        );
      if (partnerObj.documents.panNumber)
        partnerObj.documents.panNumber = decrypt(
          partnerObj.documents.panNumber,
        );
      // Images are no longer encrypted
    }

    return partnerObj;
  }

  async login(dto: LoginDeliveryPartnerDto) {
    const { phone, password } = dto;
    const partner = await this.partnerModel.findOne({ phone });

    if (!partner) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (partner.accountStatus === 'BLOCKED') {
      throw new UnauthorizedException(
        'Your account has been blocked. Please contact support.',
      );
    }

    // Auto-set the partner to ONLINE upon successful login
    if (partner.availabilityStatus !== 'ONLINE') {
        partner.availabilityStatus = 'ONLINE';
        await partner.save();

        // Broadcast real-time websocket update
        this.eventsGateway.emitEvent('delivery-partner-status-updated', {
          partnerId: partner._id,
          status: 'ONLINE',
        });
    }

    return this.generateToken(partner);
  }

  private generateToken(partner: DeliveryPartnerDocument) {
    const payload = {
      sub: partner._id,
      phone: partner.phone,
      role: 'DELIVERY_PARTNER',
      type: 'delivery_partner',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      partner: {
        _id: partner._id.toString(),
        name: partner.name,
        phone: partner.phone,
        vehicleType: partner.vehicleType,
      },
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    warehouseId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, warehouseId, search } = query;
    const filter: any = {};
    if (warehouseId) filter.warehouseIds = warehouseId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleType: { $regex: search, $options: 'i' } },
      ];
    }

    const [partners, total] = await Promise.all([
      this.partnerModel
        .find(filter)
        .select('-password')
        .populate('warehouseIds')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.partnerModel.countDocuments(filter),
    ]);

    const ACTIVE_STATUSES = [
      ShipmentStatus.ASSIGNED_TO_DELIVERY,
      ShipmentStatus.ACCEPTED,
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.OUT_FOR_DELIVERY,
    ];

    // Fetch stats for all partners on this page in one batch
    const partnerIds = partners.map((p) => p._id);
    const warehouseIds = [...new Set(partners.flatMap((p) => 
      (p.warehouseIds || [])
        .map((w: any) => typeof w === 'object' ? w._id?.toString() : w?.toString())
        .filter((id): id is string => !!id && Types.ObjectId.isValid(id))
    ))];

    const [activeShipments, completedShipments, availableShipments] = await Promise.all([
      // Active shipments grouped by partner
      this.shipmentModel.aggregate([
        { $match: { deliveryPartnerId: { $in: partnerIds }, status: { $in: ACTIVE_STATUSES } } },
        { $group: { _id: '$deliveryPartnerId', count: { $sum: 1 } } },
      ]),
      // Completed shipments grouped by partner
      this.shipmentModel.aggregate([
        { $match: { deliveryPartnerId: { $in: partnerIds }, status: ShipmentStatus.DELIVERED } },
        { $group: { _id: '$deliveryPartnerId', count: { $sum: 1 } } },
      ]),
      // Available (unassigned) shipments by warehouse
      warehouseIds.length > 0
        ? this.shipmentModel.aggregate([
            { $match: { warehouseId: { $in: warehouseIds.map((id) => new Types.ObjectId(id)) }, status: ShipmentStatus.ORDER_PLACED, deliveryPartnerId: null } },
            { $group: { _id: '$warehouseId', count: { $sum: 1 } } },
          ])
        : Promise.resolve([]),
    ]);

    const activeMap: Record<string, number> = {};
    activeShipments.forEach((s: any) => { activeMap[s._id.toString()] = s.count; });
    const completedMap: Record<string, number> = {};
    completedShipments.forEach((s: any) => { completedMap[s._id.toString()] = s.count; });
    const availableByWarehouse: Record<string, number> = {};
    availableShipments.forEach((s: any) => { availableByWarehouse[s._id.toString()] = s.count; });

    const enrichedPartners = partners.map((p) => {
      const partnerObj = this.decryptPartner(p);
      const warehouseIdsForPartner: string[] = p.warehouseIds.map((w: any) =>
        typeof w === 'object' ? w._id.toString() : w.toString()
      );
      const availableCount = warehouseIdsForPartner.reduce<number>(
        (sum, wid) => sum + (availableByWarehouse[wid] || 0),
        0,
      );
      return {
        ...partnerObj,
        activeOrders: activeMap[p._id.toString()] || 0,
        completedOrders: completedMap[p._id.toString()] || (partnerObj.totalDeliveries || 0),
        availableOrders: availableCount,
      };
    });

    return {
      data: enrichedPartners,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<DeliveryPartnerDocument> {
    const partner = await this.partnerModel
      .findById(id)
      .select('-password')
      .populate('warehouseIds')
      .exec();
    if (!partner) {
      throw new NotFoundException('Delivery partner not found');
    }
    return this.decryptPartner(partner);
  }

  async update(
    id: string,
    dto: UpdateDeliveryPartnerDto,
  ): Promise<DeliveryPartnerDocument> {
    const updateData: any = { ...dto };

    // Handle sensitive fields encryption
    const partner = await this.partnerModel.findById(id);
    if (!partner) {
      throw new NotFoundException('Delivery partner not found');
    }

    const documents = partner.documents
      ? typeof (partner.documents as any).toObject === 'function'
        ? (partner.documents as any).toObject()
        : { ...partner.documents }
      : {};
    let hasDocUpdate = false;

    // Handle account status and block reason
    if (dto.accountStatus === 'BLOCKED' && !dto.blockReason) {
      throw new BadRequestException('Block reason is required when blocking a partner');
    }

    if (dto.accountStatus === 'ACTIVE' || dto.accountStatus === 'INACTIVE') {
      updateData.blockReason = '';
    }


    // Handle individual fields
    if (dto.aadhaarNumber) {
      documents.aadhaarNumber = encrypt(dto.aadhaarNumber);
      hasDocUpdate = true;
      delete updateData.aadhaarNumber;
    }
    if (dto.panNumber) {
      documents.panNumber = encrypt(dto.panNumber);
      hasDocUpdate = true;
      delete updateData.panNumber;
    }
    if (dto.aadhaarImage) {
      documents.aadhaarImage = dto.aadhaarImage;
      hasDocUpdate = true;
      delete updateData.aadhaarImage;
    }
    if (dto.panImage) {
      documents.panImage = dto.panImage;
      hasDocUpdate = true;
      delete updateData.panImage;
    }
    if (dto.drivingLicenseImage) {
      documents.drivingLicenseImage = dto.drivingLicenseImage;
      hasDocUpdate = true;
      delete updateData.drivingLicenseImage;
    }

    // Handle nested documents object from frontend
    if (dto.documents) {
      if (dto.documents.aadhaarNumber !== undefined)
        documents.aadhaarNumber = encrypt(dto.documents.aadhaarNumber || '');
      if (dto.documents.aadhaarImage !== undefined)
        documents.aadhaarImage = dto.documents.aadhaarImage || '';
      if (dto.documents.panNumber !== undefined)
        documents.panNumber = encrypt(dto.documents.panNumber || '');
      if (dto.documents.panImage !== undefined)
        documents.panImage = dto.documents.panImage || '';
      if (dto.documents.drivingLicenseImage !== undefined)
        documents.drivingLicenseImage = dto.documents.drivingLicenseImage || '';
      hasDocUpdate = true;
      delete updateData.documents;
    }

    if (hasDocUpdate) {
      updateData.documents = documents;
    }

    this.logger.log(
      `Updating partner ${id} with: ${JSON.stringify(updateData)}`,
    );

    const updatedPartner = await this.partnerModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: 'after' })
      .select('-password')
      .populate('warehouseIds')
      .exec();

    if (!updatedPartner) {
      throw new NotFoundException('Delivery partner not found');
    }

    // Broadcast real-time websocket update if status changed
    if (updateData.availabilityStatus) {
      this.eventsGateway.emitEvent('delivery-partner-status-updated', {
        partnerId: updatedPartner._id,
        status: updatedPartner.availabilityStatus,
      });
    }

    this.logger.log(`Partner ${id} updated successfully`);
    return this.decryptPartner(updatedPartner);
  }

  async updateLocation(
    id: string,
    dto: UpdateLocationDto,
  ): Promise<DeliveryPartnerDocument> {
    const partner = await this.partnerModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            currentLocation: {
              latitude: dto.latitude,
              longitude: dto.longitude,
              lastUpdated: new Date(),
            },
          },
        },
        { returnDocument: 'after' },
      )
      .select('-password')
      .populate('warehouseIds')
      .exec();

    if (!partner) {
      throw new NotFoundException('Delivery partner not found');
    }
    return this.decryptPartner(partner);
  }

  async remove(id: string): Promise<void> {
    const result = await this.partnerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Delivery partner not found');
    }
  }
}
