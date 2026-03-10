import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Helper to safely execute Redis operations without crashing the main request.
   * Cache failures should be logged but never block the user.
   */
  private async safeExecute<T>(op: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await op();
    } catch (error) {
      this.logger.error(
        `Redis operation failed: ${error.message}`,
        error.stack,
      );
      return fallback;
    }
  }

  // ─── BASIC STRING OPERATIONS ───

  async get(key: string): Promise<any | null> {
    return this.safeExecute(async () => {
      const data = await this.redis.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }, null);
  }

  async set(key: string, value: any, ttlInSeconds?: number): Promise<void> {
    await this.safeExecute(async () => {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlInSeconds) {
        await this.redis.set(key, data, 'EX', ttlInSeconds);
      } else {
        await this.redis.set(key, data);
      }
    }, undefined);
  }

  async del(key: string | string[]): Promise<void> {
    await this.safeExecute(async () => {
      if (Array.isArray(key)) {
        if (key.length > 0) await this.redis.del(...key);
      } else {
        await this.redis.del(key);
      }
    }, undefined);
  }

  // ─── HASH OPERATIONS ───

  async hget(key: string, field: string): Promise<any | null> {
    return this.safeExecute(async () => {
      const data = await this.redis.hget(key, field);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }, null);
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    return this.safeExecute(async () => {
      const data = await this.redis.hgetall(key);
      const result: Record<string, any> = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      return result;
    }, {});
  }

  async hset(key: string, field: string, value: any): Promise<void> {
    await this.safeExecute(async () => {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.hset(key, field, data);
    }, undefined);
  }

  async hdel(key: string, field: string | string[]): Promise<void> {
    await this.safeExecute(async () => {
      if (Array.isArray(field)) {
        if (field.length > 0) await this.redis.hdel(key, ...field);
      } else {
        await this.redis.hdel(key, field);
      }
    }, undefined);
  }

  // ─── COUNTER OPERATIONS ───

  async incr(key: string): Promise<number> {
    return this.safeExecute(async () => {
      return await this.redis.incr(key);
    }, 0);
  }

  // ─── SORTED SET OPERATIONS ───

  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.safeExecute(async () => {
      await this.redis.zadd(key, score, member);
    }, undefined);
  }

  async zrangebylex(
    key: string,
    start: string,
    stop: string,
  ): Promise<string[]> {
    return this.safeExecute(async () => {
      return await this.redis.zrangebylex(key, start, stop);
    }, []);
  }

  // ─── UTILITY OPERATIONS ───

  async delByPattern(pattern: string): Promise<void> {
    await this.safeExecute(async () => {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }, undefined);
  }
}
