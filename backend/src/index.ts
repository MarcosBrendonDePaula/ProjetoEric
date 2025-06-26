import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import { cookie } from '@elysiajs/cookie'
import { bearer } from '@elysiajs/bearer'
import mongoose from 'mongoose'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/user'
import { profileRoutes } from './routes/profile'
import { goalRoutes } from './routes/goal'
import { marketRoutes } from './routes/market'
import { notificationRoutes } from './routes/notifications'
import { cronService } from './services/cronService'

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/planejador-financeiro')
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

connectDB()

// Iniciar serviços
cronService.startMarketDataUpdates()

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
  }))
  .options('*', ({ set }) => {
    set.status = 200
    return ''
  })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
  }))
  .use(cookie())
  .use(bearer())
  .get('/', () => ({ 
    message: 'Planejador Financeiro API',
    version: '1.0.0',
    status: 'online'
  }))
  .get('/health', () => ({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  }))
  .use(authRoutes)
  .use(userRoutes)
  .use(profileRoutes)
  .use(goalRoutes)
  .use(marketRoutes)
  .use(notificationRoutes)
  .listen(process.env.PORT || 3001)

console.log(`🦊 Elysia is running at http://localhost:${process.env.PORT || 3001}`)