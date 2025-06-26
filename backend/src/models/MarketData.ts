import mongoose from 'mongoose'

export interface IMarketData extends mongoose.Document {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  type: 'stock' | 'crypto' | 'etf'
  currency: string
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const marketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  change: {
    type: Number,
    required: true
  },
  changePercent: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: null
  },
  type: {
    type: String,
    enum: ['stock', 'crypto', 'etf'],
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
})

// Índice único por símbolo e tipo
marketDataSchema.index({ symbol: 1, type: 1 }, { unique: true })

export const MarketData = mongoose.model<IMarketData>('MarketData', marketDataSchema)