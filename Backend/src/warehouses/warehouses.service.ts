import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class WarehousesService {
    constructor(
        @InjectModel(Warehouse.name)
        private readonly warehouseModel: Model<WarehouseDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }

    // Create warehouse
    async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
        try {

            const existingWarehouse = await this.warehouseModel.findOne({
                code: createWarehouseDto.code,
            });

            if (existingWarehouse) {
                throw new ConflictException(
                    `Warehouse with code ${createWarehouseDto.code} already exists`,
                );
            }

            let managerId: any = null;

            if (createWarehouseDto.managerId) {

                if (!Types.ObjectId.isValid(createWarehouseDto.managerId)) {
                    throw new BadRequestException('Invalid manager ID');
                }

                const manager = await this.userModel.findById(createWarehouseDto.managerId);

                if (!manager) {
                    throw new NotFoundException('Manager not found');
                }

                if (manager.role !== UserRole.MANAGER) {
                    throw new BadRequestException('User is not a manager');
                }

                managerId = new Types.ObjectId(createWarehouseDto.managerId);
            }

            const createdWarehouse = new this.warehouseModel({
                ...createWarehouseDto,
                managerId,
            });

            return await createdWarehouse.save();

        } catch (error) {

            if (
                error instanceof ConflictException ||
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to create warehouse');
        }
    }

    // Get all warehouses
    async findAll(): Promise<Warehouse[]> {
        try {
            return await this.warehouseModel
                .find()
                .populate('managerId', '-password')
                .lean()
                .exec();
        } catch {
            throw new InternalServerErrorException('Failed to fetch warehouses');
        }
    }

    // Get warehouse by id
    async findOne(id: string): Promise<Warehouse> {

        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid warehouse ID');
        }

        const warehouse = await this.warehouseModel
            .findById(id)
            .populate('managerId', '-password')
            .lean()
            .exec();

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }

        return warehouse;
    }

    // Update warehouse
    async update(id: string, updateWarehouseDto: any): Promise<Warehouse> {

        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid warehouse ID');
        }

        try {

            const updateData: any = { ...updateWarehouseDto };

            if (updateWarehouseDto.managerId) {

                if (!Types.ObjectId.isValid(updateWarehouseDto.managerId)) {
                    throw new BadRequestException('Invalid manager ID');
                }

                const manager = await this.userModel.findById(updateWarehouseDto.managerId);

                if (!manager) {
                    throw new NotFoundException('Manager not found');
                }

                if (manager.role !== UserRole.MANAGER) {
                    throw new BadRequestException('User is not a manager');
                }

                updateData.managerId = new Types.ObjectId(updateWarehouseDto.managerId);
            }

            const warehouse = await this.warehouseModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .populate('managerId', '-password')
                .lean()
                .exec();

            if (!warehouse) {
                throw new NotFoundException(`Warehouse with ID ${id} not found`);
            }

            return warehouse;

        } catch (error) {

            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to update warehouse');
        }
    }

    // Find warehouse by manager
    async findByManager(managerId: string): Promise<Warehouse> {

        if (!Types.ObjectId.isValid(managerId)) {
            throw new BadRequestException('Invalid manager ID');
        }

        const warehouse = await this.warehouseModel
            .findOne({ managerId: new Types.ObjectId(managerId) })
            .populate('managerId', '-password')
            .lean()
            .exec();

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found for this manager');
        }

        return warehouse;
    }

    // Delete warehouse
    async remove(id: string): Promise<{ message: string }> {

        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid warehouse ID');
        }

        const result = await this.warehouseModel.findByIdAndDelete(id);

        if (!result) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }

        return { message: 'Warehouse deleted successfully' };
    }

    // Set default warehouse
    async setDefault(id: string): Promise<Warehouse> {

        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid warehouse ID');
        }

        await this.warehouseModel.updateMany({}, { isDefaultWarehouse: false });

        const warehouse = await this.warehouseModel
            .findByIdAndUpdate(
                id,
                { isDefaultWarehouse: true },
                { new: true },
            )
            .populate('managerId', '-password')
            .lean()
            .exec();

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }

        return warehouse;
    }
}