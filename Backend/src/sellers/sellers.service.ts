import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Seller } from './schemas/seller.schema';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import slugify from 'slugify';
import { encrypt, decrypt } from '../common/utils/crypto.util';

@Injectable()
export class SellersService {
    constructor(
        @InjectModel(Seller.name) private sellerModel: Model<Seller>,
        private usersService: UsersService,
        private notificationsService: NotificationsService,
    ) { }

    async create(userId: string, createSellerDto: CreateSellerDto): Promise<Seller> {
        const existingSeller = await this.sellerModel.findOne({
            $or: [{ user: new Types.ObjectId(userId) }, { email: createSellerDto.email }]
        });

        if (existingSeller) {
            throw new ConflictException('Seller profile already exists for this user or email');
        }

        let slug = slugify(createSellerDto.storeName, { lower: true, strict: true });

        // Ensure slug is unique
        let slugExists = await this.sellerModel.findOne({ slug });
        let counter = 1;
        while (slugExists) {
            const newSlug = `${slug}-${counter}`;
            slugExists = await this.sellerModel.findOne({ slug: newSlug });
            if (!slugExists) {
                slug = newSlug;
            }
            counter++;
        }

        // Encrypt sensitive fields
        const encryptedAadharNumber = encrypt(createSellerDto.aadharNumber);
        const encryptedDocumentPaths = createSellerDto.documentPaths ? {
            ...createSellerDto.documentPaths,
            aadhar: encrypt(createSellerDto.documentPaths.aadhar || ''),
            pan: encrypt(createSellerDto.documentPaths.pan || ''),
            license: encrypt(createSellerDto.documentPaths.license || ''),
        } : undefined;

        const createdSeller = new this.sellerModel({
            ...createSellerDto,
            aadharNumber: encryptedAadharNumber,
            documentPaths: encryptedDocumentPaths,
            user: new Types.ObjectId(userId),
            slug,
        });

        const savedSeller = await createdSeller.save();

        await this.usersService.update(userId, { role: UserRole.SELLER });

        // Notify Admin/Subadmin
        try {
            await this.notificationsService.create({
                title: 'New Seller Registration',
                message: `New seller application from ${createSellerDto.storeName} (${createSellerDto.name})`,
                type: NotificationType.SELLER,
                recipientRole: 'admin', // NotificationsService handles subadmin as well if recipientRole is admin or specifically query-able
                link: `/admin/sellers`,
                metadata: {
                    sellerId: savedSeller._id,
                    storeName: savedSeller.storeName
                }
            });
        } catch (error) {
            // Log error but don't fail registration
            console.error('Failed to create notification for new seller registration:', error);
        }

        return this.decryptSeller(savedSeller);
    }

    private decryptSeller(seller: any): Seller {
        if (!seller) return seller;
        const sellerObj = seller.toObject ? seller.toObject() : seller;

        if (sellerObj.aadharNumber) {
            sellerObj.aadharNumber = decrypt(sellerObj.aadharNumber);
        }

        if (sellerObj.documentPaths) {
            if (sellerObj.documentPaths.aadhar) sellerObj.documentPaths.aadhar = decrypt(sellerObj.documentPaths.aadhar);
            if (sellerObj.documentPaths.pan) sellerObj.documentPaths.pan = decrypt(sellerObj.documentPaths.pan);
            if (sellerObj.documentPaths.license) sellerObj.documentPaths.license = decrypt(sellerObj.documentPaths.license);
        }

        return sellerObj;
    }

    async findAll(): Promise<Seller[]> {
        const sellers = await this.sellerModel.find().populate('user', '-password').exec();
        return sellers.map(s => this.decryptSeller(s));
    }

    async findOne(id: string): Promise<Seller> {
        const seller = await this.sellerModel.findById(id).populate('user', '-password').exec();
        if (!seller) {
            throw new NotFoundException('Seller not found');
        }
        return this.decryptSeller(seller);
    }

    async findBySlug(slug: string): Promise<Seller> {
        const seller = await this.sellerModel.findOne({ slug }).populate('user', '-password').exec();
        if (!seller) {
            throw new NotFoundException('Seller not found');
        }
        return this.decryptSeller(seller);
    }

    async updateStatus(id: string, status: string): Promise<Seller> {
        const seller = await this.sellerModel.findByIdAndUpdate(
            id,
            { status },
            { new: true },
        ).exec();

        if (!seller) {
            throw new NotFoundException('Seller not found');
        }

        return seller;
    }
}
