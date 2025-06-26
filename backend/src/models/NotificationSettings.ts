import mongoose from 'mongoose'

export interface INotificationSettings extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  emailNotifications: {
    goalReminders: boolean
    weeklyReports: boolean
    marketUpdates: boolean
  }
  reminderDay: number // 1-31, dia do mês para lembretes
  reminderTime: string // formato HH:MM
  timezone: string
  createdAt: Date
  updatedAt: Date
}

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    goalReminders: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    marketUpdates: {
      type: Boolean,
      default: false
    }
  },
  reminderDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
    default: 5 // dia 5 de cada mês por padrão
  },
  reminderTime: {
    type: String,
    required: true,
    default: '09:00',
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  timezone: {
    type: String,
    required: true,
    default: 'America/Sao_Paulo'
  }
}, {
  timestamps: true
})

export const NotificationSettings = mongoose.model<INotificationSettings>('NotificationSettings', notificationSettingsSchema)