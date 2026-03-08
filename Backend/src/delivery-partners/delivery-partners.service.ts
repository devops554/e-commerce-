import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DeliveryPartner, DeliveryPartnerDocument } from './schemas/delivery-partner.schema';
import { LoginDeliveryPartnerDto, RegisterDeliveryPartnerDto, UpdateDeliveryPartnerDto, UpdateLocationDto } from './dto/delivery-partner.dto';
import { encrypt, decrypt } from '../common/utils/crypto.util';

@Injectable()
export class DeliveryPartnersService {
    private readonly logger = new Logger(DeliveryPartnersService.name);

    constructor(
        @InjectModel(DeliveryPartner.name) private partnerModel: Model<DeliveryPartnerDocument>,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDeliveryPartnerDto): Promise<DeliveryPartnerDocument> {
        const { phone, email, password, aadhaarNumber, aadhaarImage, panNumber, panImage, drivingLicenseImage, ...rest } = dto;

        const existingPhone = await this.partnerModel.findOne({ phone });
        if (existingPhone) {
            throw new ConflictException('Delivery partner with this phone number already exists');
        }

        if (email) {
            const existingEmail = await this.partnerModel.findOne({ email });
            if (existingEmail) {
                throw new ConflictException('Delivery partner with this email already exists');
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
                aadhaarImage: encrypt(aadhaarImage || ''),
                panNumber: encrypt(panNumber || ''),
                panImage: encrypt(panImage || ''),
                drivingLicenseImage: encrypt(drivingLicenseImage || ''),
            }
        });

        const savedPartner = await partner.save();
        return this.decryptPartner(savedPartner);
    }

    private decryptPartner(partner: any): any {
        if (!partner) return partner;
        const partnerObj = partner.toObject ? partner.toObject() : partner;

        if (partnerObj.documents) {
            if (partnerObj.documents.aadhaarNumber) partnerObj.documents.aadhaarNumber = decrypt(partnerObj.documents.aadhaarNumber);
            if (partnerObj.documents.aadhaarImage) partnerObj.documents.aadhaarImage = decrypt(partnerObj.documents.aadhaarImage);
            if (partnerObj.documents.panNumber) partnerObj.documents.panNumber = decrypt(partnerObj.documents.panNumber);
            if (partnerObj.documents.panImage) partnerObj.documents.panImage = decrypt(partnerObj.documents.panImage);
            if (partnerObj.documents.drivingLicenseImage) partnerObj.documents.drivingLicenseImage = decrypt(partnerObj.documents.drivingLicenseImage);
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
            throw new UnauthorizedException('Your account has been blocked. Please contact support.');
        }

        return this.generateToken(partner);
    }

    private generateToken(partner: DeliveryPartnerDocument) {
        const payload = {
            sub: partner._id,
            phone: partner.phone,
            role: 'DELIVERY_PARTNER',
            type: 'delivery_partner'
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

    async findAll(query: { page?: number; limit?: number; warehouseId?: string }) {
        const { page = 1, limit = 10, warehouseId } = query;
        const filter: any = {};
        if (warehouseId) filter.warehouseId = warehouseId;

        const [partners, total] = await Promise.all([
            this.partnerModel.find(filter)
                .select('-password')
                .populate('warehouseId')
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.partnerModel.countDocuments(filter),
        ]);

        return {
            data: partners.map(p => this.decryptPartner(p)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string): Promise<DeliveryPartnerDocument> {
        const partner = await this.partnerModel.findById(id).select('-password').populate('warehouseId').exec();
        if (!partner) {
            throw new NotFoundException('Delivery partner not found');
        }
        return this.decryptPartner(partner);
    }

    async update(id: string, dto: UpdateDeliveryPartnerDto): Promise<DeliveryPartnerDocument> {
        const partner = await this.partnerModel.findByIdAndUpdate(id, { $set: dto }, { new: true })
            .select('-password')
            .populate('warehouseId')
            .exec();

        if (!partner) {
            throw new NotFoundException('Delivery partner not found');
        }
        return this.decryptPartner(partner);
    }

    async updateLocation(id: string, dto: UpdateLocationDto): Promise<DeliveryPartnerDocument> {
        const partner = await this.partnerModel.findByIdAndUpdate(
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
            { new: true }
        ).select('-password').populate('warehouseId').exec();

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
