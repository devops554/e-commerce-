import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const host = configService.get<string>('REDIS_HOST', 'localhost');
                const port = configService.get<number>('REDIS_PORT', 6379);
                const password = configService.get<string>('REDIS_PASSWORD');
                console.log(`Connecting to Redis at ${host}:${port} (Password provided: ${!!password})`);
                return new Redis({
                    host,
                    port,
                    password,
                });
            },
        },
        RedisService,
    ],
    exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }