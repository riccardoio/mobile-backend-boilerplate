import IORedis from 'ioredis';

const isProd = process.env.NODE_ENV === 'production';

export const createRedisClient = () => {
    const config = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    };

    if (isProd && !process.env.REDIS_URL) {
        console.warn('REDIS_URL not set in production environment');
    }

    return new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', config);
};

// Export a singleton instance
export const redisClient = createRedisClient();
