import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

@Injectable()
export class DeliveryPartnersService {
  private readonly logger = new Logger(DeliveryPartnersService.name);

  constructor(
    @InjectModel(DeliveryPartner.name)
    private partnerModel: Model<DeliveryPartnerDocument>,
    private jwtService: JwtService,
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
  }) {
    const { page = 1, limit = 10, warehouseId } = query;
    const filter: any = {};
    if (warehouseId) filter.warehouseIds = warehouseId;

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

    return {
      data: partners.map((p) => this.decryptPartner(p)),
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
        { new: true },
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
