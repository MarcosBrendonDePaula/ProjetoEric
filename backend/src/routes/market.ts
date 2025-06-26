import { Elysia } from 'elysia'
import { marketDataService } from '../services/marketDataService'

export const marketRoutes = new Elysia({ prefix: '/market' })
  .get('/data', async ({ set }) => {
    try {
      const data = await marketDataService.getAllMarketData()
      return { 
        success: true,
        data,
        lastUpdate: data.length > 0 ? data[0].lastUpdated : new Date()
      }
    } catch (error) {
      console.error('Market data error:', error)
      set.status = 500
      return { error: 'Failed to fetch market data' }
    }
  })
  .get('/data/:type', async ({ params, set }) => {
    try {
      const { type } = params
      
      if (!['stock', 'crypto', 'etf'].includes(type)) {
        set.status = 400
        return { error: 'Invalid market type. Must be: stock, crypto, or etf' }
      }

      const data = await marketDataService.getMarketDataByType(type as 'stock' | 'crypto' | 'etf')
      return { 
        success: true,
        type,
        data,
        count: data.length
      }
    } catch (error) {
      console.error(`Market data error for ${params.type}:`, error)
      set.status = 500
      return { error: `Failed to fetch ${params.type} data` }
    }
  })
  .post('/update', async ({ set }) => {
    try {
      const result = await marketDataService.updateAllMarketData()
      return {
        success: true,
        message: 'Market data updated successfully',
        summary: result
      }
    } catch (error) {
      console.error('Market update error:', error)
      set.status = 500
      return { error: 'Failed to update market data' }
    }
  })
  .get('/portfolio/:type', async ({ params, set }) => {
    try {
      const { type } = params
      
      // Retornar composição de portfólios baseada nos dados atuais
      const stocks = await marketDataService.getMarketDataByType('stock')
      const etfs = await marketDataService.getMarketDataByType('etf')
      const cryptos = await marketDataService.getMarketDataByType('crypto')

      let portfolio
      switch (type) {
        case 'conservative':
          portfolio = {
            name: 'Portfólio Conservador',
            description: 'Baixo risco, foco em renda fixa e ações de grandes empresas',
            expectedReturn: 8.5,
            risk: 3.2,
            allocation: [
              { asset: 'Renda Fixa', percentage: 70, color: '#3B82F6' },
              { asset: 'Ações Blue Chips', percentage: 20, items: stocks.slice(0, 2), color: '#10B981' },
              { asset: 'ETFs', percentage: 10, items: etfs.slice(0, 1), color: '#F59E0B' }
            ]
          }
          break
        case 'moderate':
          portfolio = {
            name: 'Portfólio Moderado',
            description: 'Risco equilibrado com diversificação entre renda fixa e variável',
            expectedReturn: 11.2,
            risk: 6.1,
            allocation: [
              { asset: 'Renda Fixa', percentage: 40, color: '#3B82F6' },
              { asset: 'Ações', percentage: 35, items: stocks.slice(0, 3), color: '#10B981' },
              { asset: 'ETFs', percentage: 20, items: etfs.slice(0, 2), color: '#F59E0B' },
              { asset: 'Cripto', percentage: 5, items: cryptos.slice(0, 1), color: '#8B5CF6' }
            ]
          }
          break
        case 'aggressive':
          portfolio = {
            name: 'Portfólio Agressivo',
            description: 'Alto risco e alto retorno, foco em crescimento',
            expectedReturn: 15.8,
            risk: 12.3,
            allocation: [
              { asset: 'Ações', percentage: 50, items: stocks, color: '#10B981' },
              { asset: 'ETFs', percentage: 25, items: etfs, color: '#F59E0B' },
              { asset: 'Cripto', percentage: 15, items: cryptos.slice(0, 3), color: '#8B5CF6' },
              { asset: 'Renda Fixa', percentage: 10, color: '#3B82F6' }
            ]
          }
          break
        default:
          set.status = 400
          return { error: 'Invalid portfolio type. Must be: conservative, moderate, or aggressive' }
      }

      return {
        success: true,
        portfolio
      }
    } catch (error) {
      console.error(`Portfolio error for ${params.type}:`, error)
      set.status = 500
      return { error: `Failed to fetch ${params.type} portfolio` }
    }
  })