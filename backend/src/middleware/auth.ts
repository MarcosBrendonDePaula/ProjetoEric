import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { cookie } from '@elysiajs/cookie'
import { User } from '../models/User'

export const authMiddleware = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
  }))
  .use(cookie())
  .derive(async ({ jwt, cookie, set }) => {
    const token = cookie['auth-token']
    
    if (!token) {
      set.status = 401
      throw new Error('No token provided')
    }

    try {
      const payload = await jwt.verify(token)
      if (!payload) {
        set.status = 401
        throw new Error('Invalid token')
      }

      const user = await User.findById(payload.userId)
      if (!user) {
        set.status = 401
        throw new Error('User not found')
      }

      return {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified
        }
      }
    } catch (error) {
      set.status = 401
      throw new Error('Authentication failed')
    }
  })