import { Injectable, UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, RegisterSubAdminDto } from './dto/auth.dto';
import { EmailService } from './email.service';
import { GoogleOAuthService } from './google-oauth.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly googleOAuthService: GoogleOAuthService,
        private readonly redisService: RedisService,
    ) { }

    // ─── OTP FLOW ───

    async requestOtp(email: string) {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Store OTP in Redis with 10 minutes expiry
            await this.redisService.set(`otp:${email}`, otp, 600);

            await this.emailService.sendOtp(email, otp);
            this.logger.log(`OTP requested for ${email}`);
            return { message: 'OTP sent to email' };
        } catch (error) {
            this.logger.error(`OTP request failed for ${email}: ${error.message}`);
            throw new InternalServerErrorException('Failed to send OTP');
        }
    }

    async verifyOtp(email: string, otp: string) {
        try {
            const cachedOtp = await this.redisService.get(`otp:${email}`);

            if (!cachedOtp || cachedOtp !== otp) {
                this.logger.warn(`Invalid OTP attempt for ${email}`);
                throw new BadRequestException('Invalid or expired OTP');
            }

            // Clear OTP after successful verification
            await this.redisService.del(`otp:${email}`);
            return true;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`OTP verification error for ${email}: ${error.message}`);
            throw new InternalServerErrorException('OTP verification failed');
        }
    }

    // ─── USER REGISTRATION & LOGIN ───

    async register(registerDto: RegisterDto) {
        try {
            const { email, password, name, phone, otp } = registerDto;

            if (otp) {
                await this.verifyOtp(email, otp);
            } else {
                throw new BadRequestException('OTP is required for registration');
            }

            const existingUser = await this.usersService.findByEmail(email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await this.usersService.create({
                email,
                password: hashedPassword,
                name,
                phone,
            });

            this.logger.log(`New user registered: ${email}`);
            return this.generateToken(user);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Registration failed for ${registerDto.email}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Registration failed');
        }
    }

    async registerSubAdmin(registerDto: RegisterSubAdminDto) {
        try {
            const { email, password, name, phone } = registerDto;

            const existingUser = await this.usersService.findByEmail(email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await this.usersService.create({
                email,
                password: hashedPassword,
                name,
                phone,
                role: require('../users/schemas/user.schema').UserRole.SUB_ADMIN,
            });

            this.logger.log(`New sub-admin registered: ${email}`);
            return {
                message: 'Sub-admin registered successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Sub-admin registration failed for ${registerDto.email}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Sub-admin registration failed');
        }
    }

    async login(loginDto: LoginDto) {
        try {
            const { email, password } = loginDto;
            const user = await this.usersService.findByEmail(email);

            if (!user) {
                this.logger.warn(`Login attempt for non-existent user: ${email}`);
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`Invalid password for user: ${email}`);
                throw new UnauthorizedException('Invalid credentials');
            }

            this.logger.log(`User logged in: ${email}`);
            return this.generateToken(user);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Login error for ${loginDto.email}: ${error.message}`);
            throw new InternalServerErrorException('Authentication failed');
        }
    }

    // ─── GOOGLE OAUTH ───

    async googleLogin(idToken: string) {
        try {
            const googleUser = await this.googleOAuthService.verifyIdToken(idToken);
            let user = await this.usersService.findByEmail(googleUser.email);

            if (!user) {
                this.logger.log(`Creating new user via Google: ${googleUser.email}`);
                // Create user if not exists
                user = await this.usersService.create({
                    email: googleUser.email,
                    name: `${googleUser.given_name} ${googleUser.family_name}`,
                    avatar: googleUser.picture,
                    password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for google users
                });
            }

            this.logger.log(`Google login success: ${googleUser.email}`);
            return this.generateToken(user);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Google login failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Google authentication failed');
        }
    }

    // ─── TOKEN GENERATION ───

    private generateToken(user: any) {
        const payload = { sub: user._id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
        };
    }
}
