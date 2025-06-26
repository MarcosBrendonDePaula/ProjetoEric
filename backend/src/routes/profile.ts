import { Elysia, t } from 'elysia'
import { authMiddleware } from '../middleware/auth'
import { Profile } from '../models/Profile'

export const profileRoutes = new Elysia({ prefix: '/profile' })
  .use(authMiddleware)
  .get('/', async ({ user, set }) => {
    try {
      const profile = await Profile.findOne({ userId: user.id })
      
      if (!profile) {
        set.status = 404
        return { error: 'Profile not found' }
      }

      return { profile }
    } catch (error) {
      console.error('Get profile error:', error)
      set.status = 500
      return { error: 'Failed to get profile' }
    }
  })
  .post('/', async ({ user, body, set }) => {
    try {
      // Verificar se já existe um perfil
      const existingProfile = await Profile.findOne({ userId: user.id })
      if (existingProfile) {
        set.status = 409
        return { error: 'Profile already exists' }
      }

      const profile = new Profile({
        userId: user.id,
        ...body
      })

      await profile.save()

      return {
        message: 'Profile created successfully',
        profile
      }
    } catch (error) {
      console.error('Create profile error:', error)
      set.status = 500
      return { error: 'Failed to create profile' }
    }
  }, {
    body: t.Object({
      riskTolerance: t.Union([
        t.Literal('conservative'),
        t.Literal('moderate'),
        t.Literal('aggressive')
      ]),
      investmentHorizon: t.Number({ minimum: 1, maximum: 50 }),
      currentAssets: t.Number({ minimum: 0 }),
      monthlyIncome: t.Number({ minimum: 0 }),
      monthlyExpenses: t.Number({ minimum: 0 }),
      investmentExperience: t.Union([
        t.Literal('beginner'),
        t.Literal('intermediate'),
        t.Literal('advanced')
      ]),
      objectives: t.Array(t.Union([
        t.Literal('retirement'),
        t.Literal('emergency_fund'),
        t.Literal('house'),
        t.Literal('education'),
        t.Literal('travel'),
        t.Literal('investment_growth'),
        t.Literal('other')
      ])),
      age: t.Number({ minimum: 18, maximum: 100 })
    })
  })
  .put('/', async ({ user, body, set }) => {
    try {
      const profile = await Profile.findOneAndUpdate(
        { userId: user.id },
        body,
        { new: true, runValidators: true }
      )

      if (!profile) {
        set.status = 404
        return { error: 'Profile not found' }
      }

      return {
        message: 'Profile updated successfully',
        profile
      }
    } catch (error) {
      console.error('Update profile error:', error)
      set.status = 500
      return { error: 'Failed to update profile' }
    }
  }, {
    body: t.Object({
      riskTolerance: t.Optional(t.Union([
        t.Literal('conservative'),
        t.Literal('moderate'),
        t.Literal('aggressive')
      ])),
      investmentHorizon: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
      currentAssets: t.Optional(t.Number({ minimum: 0 })),
      monthlyIncome: t.Optional(t.Number({ minimum: 0 })),
      monthlyExpenses: t.Optional(t.Number({ minimum: 0 })),
      investmentExperience: t.Optional(t.Union([
        t.Literal('beginner'),
        t.Literal('intermediate'),
        t.Literal('advanced')
      ])),
      objectives: t.Optional(t.Array(t.Union([
        t.Literal('retirement'),
        t.Literal('emergency_fund'),
        t.Literal('house'),
        t.Literal('education'),
        t.Literal('travel'),
        t.Literal('investment_growth'),
        t.Literal('other')
      ]))),
      age: t.Optional(t.Number({ minimum: 18, maximum: 100 }))
    })
  })