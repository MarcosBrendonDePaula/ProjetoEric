import mongoose from 'mongoose'

export interface IGoal extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  monthlyContribution: number
  expectedReturn: number // taxa anual esperada
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  category: 'retirement' | 'emergency_fund' | 'house' | 'education' | 'travel' | 'investment_growth' | 'other'
  createdAt: Date
  updatedAt: Date
}

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value: Date) {
        return value > new Date()
      },
      message: 'Target date must be in the future'
    }
  },
  monthlyContribution: {
    type: Number,
    required: true,
    min: 0
  },
  expectedReturn: {
    type: Number,
    required: true,
    min: 0,
    max: 30 // máximo 30% ao ano
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  category: {
    type: String,
    enum: ['retirement', 'emergency_fund', 'house', 'education', 'travel', 'investment_growth', 'other'],
    required: true
  }
}, {
  timestamps: true
})

// Calcular progresso da meta
goalSchema.virtual('progress').get(function() {
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100)
})

// Calcular meses restantes
goalSchema.virtual('monthsRemaining').get(function() {
  const now = new Date()
  const target = new Date(this.targetDate)
  const diffTime = target.getTime() - now.getTime()
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
  return Math.max(diffMonths, 0)
})

goalSchema.set('toJSON', { virtuals: true })
goalSchema.set('toObject', { virtuals: true })

export const Goal = mongoose.model<IGoal>('Goal', goalSchema)