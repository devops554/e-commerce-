import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserStatus } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // ─── HELPER METHODS ───

  private validateObjectId(id: string, name: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${name} ID format: ${id}`);
    }
  }

  // ─── CORE OPERATIONS ───

  async create(userData: Partial<User>): Promise<User> {
    try {
      const user = new this.userModel(userData);
      const saved = await user.save();
      this.logger.log(`User created: ${saved.email} (${saved._id})`);
      return saved;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('User creation failed');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email }).select('+password').exec();
    } catch (error) {
      this.logger.error(
        `Failed to find user by email ${email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Email query failed');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      this.validateObjectId(id, 'user');
      return await this.userModel.findById(id).exec();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to find user by ID ${id}: ${error.message}`);
      throw new InternalServerErrorException('ID query failed');
    }
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      this.validateObjectId(id, 'user');
      const user = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.log(`User updated: ${id}`);
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to update user ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('User update failed');
    }
  }

  async delete(id: string): Promise<User | null> {
    try {
      this.validateObjectId(id, 'user');
      const user = await this.userModel.findByIdAndDelete(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.warn(`User deleted: ${id}`);
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to delete user ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('User delete failed');
    }
  }
  async addAddress(userId: string, addressData: any): Promise<User> {
    try {
      this.validateObjectId(userId, 'user');
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // If it's market as default, unmark others
      if (addressData.isDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
      }

      if (addressData._id) {
        // Update existing
        const index = user.addresses.findIndex(
          (a) => a._id.toString() === addressData._id,
        );
        if (index !== -1) {
          user.addresses[index] = { ...user.addresses[index], ...addressData };
        } else {
          user.addresses.push(addressData);
        }
      } else {
        // Add new
        user.addresses.push(addressData);
      }

      return await user.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to add address: ${error.message}`);
      throw new InternalServerErrorException('Address update failed');
    }
  }

  async removeAddress(userId: string, addressId: string): Promise<User> {
    try {
      this.validateObjectId(userId, 'user');
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      user.addresses = user.addresses.filter(
        (a) => a._id.toString() !== addressId,
      ) as any;
      return await user.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to remove address: ${error.message}`);
      throw new InternalServerErrorException('Address removal failed');
    }
  }
  async findAll(
    page = '1',
    limit = '10',
    role?: string,
    status?: string,
    search?: string,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const filter: any = {};

      if (role) filter.role = role;
      if (status) filter.status = status;

      if (search) {
        filter.$text = { $search: search };
      }

      const [users, total] = await Promise.all([
        this.userModel.find(filter).skip(skip).limit(limitNumber).exec(),
        this.userModel.countDocuments(filter).exec(),
      ]);

      return {
        users,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      };
    } catch (error) {
      this.logger.error(`Failed to find all users: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    try {
      this.validateObjectId(id, 'user');
      const user = await this.userModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.log(`User status updated: ${id} to ${status}`);
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to update user status ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('User status update failed');
    }
  }
}
