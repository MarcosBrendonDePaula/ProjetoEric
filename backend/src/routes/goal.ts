import { Elysia, t } from 'elysia'
import { authMiddleware } from '../middleware/auth'
import { Goal } from '../models/Goal'

export const goalRoutes = new Elysia({ prefix: '/goals' })
  .use(authMiddleware)
  .get('/', async ({ user, set }) => {
    try {
      const goals = await Goal.find({ userId: user.id }).sort({ createdAt: -1 })
      return { goals }
    } catch (error) {
      console.error('Get goals error:', error)
      set.status = 500
      return { error: 'Failed to get goals' }
    }
  })
  .get('/:id', async ({ user, params, set }) => {
    try {
      const goal = await Goal.findOne({ _id: params.id, userId: user.id })
      
      if (!goal) {
        set.status = 404
        return { error: 'Goal not found' }
      }

      return { goal }
    } catch (error) {
      console.error('Get goal error:', error)
      set.status = 500
      return { error: 'Failed to get goal' }
    }
  })
  .post('/', async ({ user, body, set }) => {
    try {
      const goal = new Goal({
        userId: user.id,
        ...body
      })

      await goal.save()

      return {
        message: 'Goal created successfully',
        goal
      }
    } catch (error) {
      console.error('Create goal error:', error)
      set.status = 500
      return { error: 'Failed to create goal' }
    }
  }, {
    body: t.Object({
      title: t.String({ minLength: 1, maxLength: 100 }),
      description: t.Optional(t.String({ maxLength: 500 })),
      targetAmount: t.Number({ minimum: 1 }),
      currentAmount: t.Optional(t.Number({ minimum: 0 })),
      targetDate: t.String(), // ISO date string
      monthlyContribution: t.Number({ minimum: 0 }),
      expectedReturn: t.Number({ minimum: 0, maximum: 30 }),
      riskLevel: t.Union([
        t.Literal('low'),
        t.Literal('medium'),
        t.Literal('high')
      ]),
      category: t.Union([
        t.Literal('retirement'),
        t.Literal('emergency_fund'),
        t.Literal('house'),
        t.Literal('education'),
        t.Literal('travel'),
        t.Literal('investment_growth'),
        t.Literal('other')
      ])
    })
  })
  .put('/:id', async ({ user, params, body, set }) => {
    try {
      const goal = await Goal.findOneAndUpdate(
        { _id: params.id, userId: user.id },
        body,
        { new: true, runValidators: true }
      )

      if (!goal) {
        set.status = 404
        return { error: 'Goal not found' }
      }

      return {
        message: 'Goal updated successfully',
        goal
      }
    } catch (error) {
      console.error('Update goal error:', error)
      set.status = 500
      return { error: 'Failed to update goal' }
    }
  })
  .delete('/:id', async ({ user, params, set }) => {
    try {
      const goal = await Goal.findOneAndDelete({ _id: params.id, userId: user.id })

      if (!goal) {
        set.status = 404
        return { error: 'Goal not found' }
      }

      return { message: 'Goal deleted successfully' }
    } catch (error) {
      console.error('Delete goal error:', error)
      set.status = 500
      return { error: 'Failed to delete goal' }
    }
  })
  .post('/:id/contribution', async ({ user, params, body, set }) => {
    try {
      const { amount } = body
      
      const goal = await Goal.findOne({ _id: params.id, userId: user.id })
      if (!goal) {
        set.status = 404
        return { error: 'Goal not found' }
      }

      goal.currentAmount += amount
      
      // Verificar se a meta foi atingida
      if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
        goal.status = 'completed'
      }

      await goal.save()

      return {
        message: 'Contribution added successfully',
        goal
      }
    } catch (error) {
      console.error('Add contribution error:', error)
      set.status = 500
      return { error: 'Failed to add contribution' }
    }
  }, {
    body: t.Object({
      amount: t.Number({ minimum: 0.01 })
    })
  })