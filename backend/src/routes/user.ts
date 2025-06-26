import { Elysia, t } from 'elysia'
import { authMiddleware } from '../middleware/auth'
import { User } from '../models/User'

export const userRoutes = new Elysia({ prefix: '/user' })
  .use(authMiddleware)
  .get('/profile', async ({ user }) => {
    try {
      const userData = await User.findById(user.id)
      if (!userData) {
        return { error: 'User not found' }
      }

      return {
        user: {
          id: userData._id,
          email: userData.email,
          name: userData.name,
          isVerified: userData.isVerified,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        }
      }
    } catch (error) {
      console.error('Get profile error:', error)
      return { error: 'Failed to get profile' }
    }
  })
  .put('/profile', async ({ user, body, set }) => {
    try {
      const { name } = body

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { name },
        { new: true, runValidators: true }
      )

      if (!updatedUser) {
        set.status = 404
        return { error: 'User not found' }
      }

      return {
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          isVerified: updatedUser.isVerified
        }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      set.status = 500
      return { error: 'Failed to update profile' }
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 2, maxLength: 100 })
    })
  })