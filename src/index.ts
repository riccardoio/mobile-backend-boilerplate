import dotenv from 'dotenv';
import path from 'path';

// Load environment variables first, before any other imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import "reflect-metadata"
import { Database } from "@/config/database"
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import connectRedis from 'connect-redis';
import { redisClient } from '@/config/redis';
import userRoutes from './routes/userRoutes';

import * as FirebaseAdmin from 'firebase-admin';

if (!FirebaseAdmin.apps.length) {
    FirebaseAdmin.initializeApp({
        credential: FirebaseAdmin.credential.applicationDefault(),
        projectId: 'espresso-8a785'
    });
}

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet()); // Adds various HTTP security headers
app.use(express.json());
app.use(cors());

const RedisStore = connectRedis(session);

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// Health check endpoint that verifies database connection
app.get('/health', async (req, res) => {
    try {
        // Verify database connection
        const isConnected = Database.isInitialized;
        if (!isConnected) {
            throw new Error('Database not initialized');
        }
        
        res.json({ 
            status: 'healthy',
            database: 'connected',
            imports: 'working'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'unhealthy',
            error: error.message 
        });
    }
});

app.use('/api/users', userRoutes);

const startServer = async () => {
    try {
        // Debug: list entities before init
        // eslint-disable-next-line no-console
        console.log('[server] Entities:', (Database.options.entities as any[]).map((e: any) => e && e.name))
        await Database.initialize()
        
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.log(error)
    }
}

startServer()