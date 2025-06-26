import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { cookie } from '@elysiajs/cookie'
import { User } from '../models/User'
import { rateLimit } from '../middleware/rateLimit'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
  }))
  .use(cookie())
  .use(rateLimit)
  .post('/register', async ({ body, jwt, setCookie, set }) => {
    try {
      const { email, password, name } = body

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        set.status = 409
        return { error: 'User already exists' }
      }

      // Criar novo usuário
      const user = new User({
        email,
        password,
        name
      })

      await user.save()

      // Gerar JWT token
      const token = await jwt.sign({ 
        userId: user._id,
        email: user.email
      })

      // Definir cookie seguro
      setCookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 dias
      })

      return {
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      set.status = 500
      return { error: 'Internal server error' }
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
      name: t.String({ minLength: 2, maxLength: 100 })
    })
  })
  .post('/login', async ({ body, jwt, setCookie, set }) => {
    try {
      const { email, password } = body

      // Encontrar usuário e incluir password
      const user = await User.findOne({ email }).select('+password')
      if (!user) {
        set.status = 401
        return { error: 'Invalid credentials' }
      }

      // Verificar password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        set.status = 401
        return { error: 'Invalid credentials' }
      }

      // Gerar JWT token
      const token = await jwt.sign({ 
        userId: user._id,
        email: user.email
      })

      // Definir cookie seguro
      setCookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 dias
      })

      return {
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      set.status = 500
      return { error: 'Internal server error' }
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 1 })
    })
  })
  .post('/logout', ({ setCookie }) => {
    setCookie('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })
    
    return { message: 'Logout successful' }
  })
  .get('/me', async ({ jwt, cookie, set }) => {
    try {
      const token = cookie['auth-token']
      if (!token) {
        set.status = 401
        return { error: 'No token provided' }
      }

      const payload = await jwt.verify(token)
      if (!payload) {
        set.status = 401
        return { error: 'Invalid token' }
      }

      const user = await User.findById(payload.userId)
      if (!user) {
        set.status = 401
        return { error: 'User not found' }
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
      console.error('Auth verification error:', error)
      set.status = 401
      return { error: 'Invalid token' }
    }
  })