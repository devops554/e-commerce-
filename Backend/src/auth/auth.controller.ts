import { Controller, Post, Body, UseGuards, Get, Req, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterSubAdminDto } from './dto/auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) { }

    // ─── AUTHENTICATION ROUTES ───

    @Post('request-otp')
    async requestOtp(@Body('email') email: string) {
        return this.authService.requestOtp(email);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        this.logger.log(`Registration request for email: ${registerDto.email}`);
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        this.logger.log(`Login attempt for email: ${loginDto.email}`);
        return this.authService.login(loginDto);
    }

    @Post('google')
    async googleLogin(@Body('idToken') idToken: string) {
        this.logger.log('Google login attempt');
        return this.authService.googleLogin(idToken);
    }

    @Post('register-subadmin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async registerSubAdmin(@Body() registerDto: RegisterSubAdminDto) {
        this.logger.log(`Sub-admin registration by admin: ${registerDto.email}`);
        return this.authService.registerSubAdmin(registerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: any) {
        if (!req.user) {
            throw new UnauthorizedException();
        }
        return req.user;
    }
}
