import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryPartnerDocument = DeliveryPartner & Document;

@Schema({ timestamps: true })
export class DeliveryPartner {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    phone: string;

    @Prop({ unique: true, sparse: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({
        enum: ["BIKE", "SCOOTER", "CAR", "VAN"],
        default: "BIKE"
    })
    vehicleType: string;

    @Prop()
    vehicleNumber: string;

    @Prop()
    licenseNumber: string;

    @Prop({
        type: Types.ObjectId,
        ref: "Warehouse"
    })
    warehouseId: Types.ObjectId;

    @Prop({
        enum: ["ONLINE", "OFFLINE", "BUSY"],
        default: "OFFLINE"
    })
    availabilityStatus: string;

    @Prop({
        enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
        default: "ACTIVE"
    })
    accountStatus: string;

    @Prop({
        type: {
            latitude: Number,
            longitude: Number,
            lastUpdated: Date
        }
    })
    currentLocation: {
        latitude: number;
        longitude: number;
        lastUpdated: Date;
    };

    @Prop({ default: 0 })
    totalDeliveries: number;

    @Prop({ default: 0 })
    rating: number;

    @Prop({
        type: {
            aadhaarNumber: String,
            aadhaarImage: String,
            panNumber: String,
            panImage: String,
            drivingLicenseImage: String
        }
    })
    documents: {
        aadhaarNumber: string;
        aadhaarImage: string;
        panNumber: string;
        panImage: string;
        drivingLicenseImage: string;
    };

}

export const DeliveryPartnerSchema = SchemaFactory.createForClass(DeliveryPartner);
