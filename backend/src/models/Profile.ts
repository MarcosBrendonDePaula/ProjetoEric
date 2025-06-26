import mongoose from 'mongoose'

export interface IProfile extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizon: number // em anos
  currentAssets: number
  monthlyIncome: number
  monthlyExpenses: number
  investmentExperience: 'beginner' | 'intermediate' | 'advanced'
  objectives: string[]
  age: number
  createdAt: Date
  updatedAt: Date
}

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  riskTolerance: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    required: true
  },
  investmentHorizon: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  currentAssets: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  monthlyIncome: {
    type: Number,
    required: true,
    min: 0
  },
  monthlyExpenses: {
    type: Number,
    required: true,
    min: 0
  },
  investmentExperience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  objectives: [{
    type: String,
    enum: ['retirement', 'emergency_fund', 'house', 'education', 'travel', 'investment_growth', 'other']
  }],
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  }
}, {
  timestamps: true
})

export const Profile = mongoose.model<IProfile>('Profile', profileSchema)