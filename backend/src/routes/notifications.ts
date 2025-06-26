import { Elysia, t } from 'elysia'
import { authMiddleware } from '../middleware/auth'
import { NotificationSettings } from '../models/NotificationSettings'
import { emailService } from '../services/emailService'

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .use(authMiddleware)
  .get('/settings', async ({ user, set }) => {
    try {
      let settings = await NotificationSettings.findOne({ userId: user.id })
      
      if (!settings) {
        // Criar configurações padrão se não existirem
        settings = new NotificationSettings({
          userId: user.id,
          emailNotifications: {
            goalReminders: true,
            weeklyReports: true,
            marketUpdates: false
          },
          reminderDay: 5,
          reminderTime: '09:00',
          timezone: 'America/Sao_Paulo'
        })
        await settings.save()
      }

      return { success: true, settings }
    } catch (error) {
      console.error('Get notification settings error:', error)
      set.status = 500
      return { error: 'Failed to get notification settings' }
    }
  })
  .put('/settings', async ({ user, body, set }) => {
    try {
      const settings = await NotificationSettings.findOneAndUpdate(
        { userId: user.id },
        body,
        { new: true, upsert: true, runValidators: true }
      )

      return {
        success: true,
        message: 'Notification settings updated successfully',
        settings
      }
    } catch (error) {
      console.error('Update notification settings error:', error)
      set.status = 500
      return { error: 'Failed to update notification settings' }
    }
  }, {
    body: t.Object({
      emailNotifications: t.Optional(t.Object({
        goalReminders: t.Optional(t.Boolean()),
        weeklyReports: t.Optional(t.Boolean()),
        marketUpdates: t.Optional(t.Boolean())
      })),
      reminderDay: t.Optional(t.Number({ minimum: 1, maximum: 31 })),
      reminderTime: t.Optional(t.String()),
      timezone: t.Optional(t.String())
    })
  })
  .post('/test-email', async ({ user, set }) => {
    try {
      const result = await emailService.sendWelcomeEmail(user.id)
      
      if (result.success) {
        return {
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId
        }
      } else {
        set.status = 500
        return {
          success: false,
          error: 'Failed to send test email',
          details: result.error
        }
      }
    } catch (error) {
      console.error('Test email error:', error)
      set.status = 500
      return { error: 'Failed to send test email' }
    }
  })
  .post('/send-goal-reminder/:goalId', async ({ user, params, set }) => {
    try {
      const result = await emailService.sendGoalReminder(user.id, params.goalId)
      
      if (result.success) {
        return {
          success: true,
          message: 'Goal reminder sent successfully',
          messageId: result.messageId
        }
      } else {
        set.status = 500
        return {
          success: false,
          error: 'Failed to send goal reminder',
          details: result.error
        }
      }
    } catch (error) {
      console.error('Goal reminder error:', error)
      set.status = 500
      return { error: 'Failed to send goal reminder' }
    }
  })
  .post('/send-weekly-report', async ({ user, set }) => {
    try {
      const result = await emailService.sendWeeklyReport(user.id)
      
      if (result.success) {
        return {
          success: true,
          message: 'Weekly report sent successfully',
          messageId: result.messageId
        }
      } else {
        set.status = 500
        return {
          success: false,
          error: 'Failed to send weekly report',
          details: result.error
        }
      }
    } catch (error) {
      console.error('Weekly report error:', error)
      set.status = 500
      return { error: 'Failed to send weekly report' }
    }
  })