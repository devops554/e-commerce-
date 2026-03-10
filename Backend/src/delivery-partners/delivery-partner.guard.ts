import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DeliveryPartnersService } from './delivery-partners.service';

@Injectable()
export class DeliveryPartnerJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private deliveryService: DeliveryPartnersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Ensure this is a delivery partner token
      if (payload.type !== 'delivery_partner') {
        throw new UnauthorizedException(
          'Invalid token type for delivery partner',
        );
      }

      const partner = await this.deliveryService.findById(payload.sub);
      if (!partner || partner.accountStatus === 'BLOCKED') {
        throw new UnauthorizedException(
          'Delivery partner account is inactive or not found',
        );
      }

      // Inject partner document into request
      request['deliveryPartner'] = partner;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
