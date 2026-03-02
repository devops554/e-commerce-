import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
    private readonly logger = new Logger(CartsController.name);

    constructor(private readonly cartsService: CartsService) { }

    // ─── CART OPERATIONS ───

    @Get()
    async getCart(@Req() req: any) {
        return this.cartsService.getCart(req.user._id);
    }

    @Post('items')
    async addItem(@Req() req: any, @Body() body: { productId: string; variantId: string; quantity: number; title: string; price: number; image: string }) {
        this.logger.log(`User ${req.user._id} adding item ${body.variantId} to cart`);
        return this.cartsService.addItem(req.user._id, body.productId, body.variantId, body.quantity, body.title, body.price, body.image);
    }

    @Delete('items/:variantId')
    async removeItem(@Req() req: any, @Param('variantId') variantId: string) {
        this.logger.log(`User ${req.user._id} removing item ${variantId} from cart`);
        return this.cartsService.removeItem(req.user._id, variantId);
    }

    @Delete()
    async clearCart(@Req() req: any) {
        this.logger.warn(`User ${req.user._id} clearing cart`);
        return this.cartsService.clearCart(req.user._id);
    }

    @Post('sync')
    async syncCart(@Req() req: any, @Body() body: { items: { productId: string; variantId: string; quantity: number; title: string; price: number; image: string }[] }) {
        this.logger.log(`User ${req.user._id} syncing ${body.items?.length || 0} items to cart`);
        return this.cartsService.syncCart(req.user._id, body.items);
    }
}
