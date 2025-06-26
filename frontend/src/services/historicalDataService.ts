import axios from 'axios'

interface HistoricalAssetData {
  symbol: string
  name: string
  startPrice: number
  endPrice: number
  return: number
  volatility: number
  maxDrawdown: number
}

interface HistoricalPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  duration: string
  description: string
  context: string
  assets: Record<string, HistoricalAssetData>
  isLoading?: boolean
}

class HistoricalDataService {
  private readonly API_BASE = 'http://localhost:3001'
  
  // Períodos pré-definidos com contexto
  private readonly predefinedPeriods = [
    {
      id: 'covid-2020',
      name: 'Pandemia COVID-19',
      startDate: '2020-03-01',
      endDate: '2020-12-31',
      context: 'crash-recovery',
      description: 'Crash inicial seguido de recuperação histórica com estímulos monetários massivos'
    },
    {
      id: 'crypto-winter-2022',
      name: 'Crypto Winter 2022',
      startDate: '2022-01-01',
      endDate: '2022-12-31',
      context: 'bear-market',
      description: 'Colapso do ecossistema cripto: Terra Luna, FTX, alta de juros'
    },
    {
      id: 'bull-run-2021',
      name: 'Bull Run 2021',
      startDate: '2021-01-01',
      endDate: '2021-12-31',
      context: 'euphoria',
      description: 'Máxima histórica do Bitcoin, NFTs, DeFi e mania especulativa'
    },
    {
      id: 'post-election-2023',
      name: 'Pós-Eleições 2023',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      context: 'political-uncertainty',
      description: 'Ano político turbulento no Brasil com polarização e incertezas'
    },
    {
      id: 'recent-2024',
      name: 'Período Recente 2024',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      context: 'current-cycle',
      description: 'Ciclo atual com IA, Bitcoin ETF aprovado e mercados em alta'
    }
  ]

  // Assets que vamos rastrear
  private readonly trackedAssets = [
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
    { symbol: '^GSPC', name: 'S&P 500', type: 'stock' },
    { symbol: '^BVSP', name: 'Ibovespa', type: 'stock' },
    { symbol: 'CDI', name: 'CDI', type: 'fixed-income' },
    { symbol: 'USDT-USD', name: 'Tether', type: 'stablecoin' },
    { symbol: 'BNB-USD', name: 'Binance Coin', type: 'crypto' },
    { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto' }
  ]

  async getHistoricalPeriods(): Promise<HistoricalPeriod[]> {
    try {
      // Buscar dados históricos do backend
      const response = await axios.get(`${this.API_BASE}/market/historical-periods`)
      
      if (response.data?.periods) {
        return this.sortPeriodsByDate(response.data.periods)
      }
      
      // Fallback: gerar períodos baseados nos dados atuais
      return this.generatePeriodsFromCurrentData()
      
    } catch (error) {
      console.warn('Erro ao buscar dados históricos do backend, usando dados simulados:', error)
      return this.generateSimulatedPeriods()
    }
  }

  async getAssetHistoricalData(symbol: string, startDate: string, endDate: string): Promise<HistoricalAssetData | null> {
    try {
      const response = await axios.get(`${this.API_BASE}/market/historical-data`, {
        params: { symbol, startDate, endDate }
      })
      
      return response.data
    } catch (error) {
      console.warn(`Erro ao buscar dados para ${symbol}:`, error)
      return this.getSimulatedAssetData(symbol, startDate, endDate)
    }
  }

  private async generatePeriodsFromCurrentData(): Promise<HistoricalPeriod[]> {
    const periods: HistoricalPeriod[] = []
    
    for (const period of this.predefinedPeriods) {
      const assets: Record<string, HistoricalAssetData> = {}
      
      for (const asset of this.trackedAssets) {
        const data = await this.getAssetHistoricalData(asset.symbol, period.startDate, period.endDate)
        if (data) {
          assets[asset.symbol] = {
            ...data,
            name: asset.name
          }
        }
      }
      
      periods.push({
        ...period,
        duration: this.calculateDuration(period.startDate, period.endDate),
        assets
      })
    }
    
    return this.sortPeriodsByDate(periods)
  }

  private generateSimulatedPeriods(): HistoricalPeriod[] {
    // Dados simulados mais realistas baseados em dados reais
    const simulatedPeriods: HistoricalPeriod[] = [
      {
        id: 'recent-2024',
        name: 'Ciclo Atual 2024',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        duration: '6 meses',
        description: 'Bitcoin ETF aprovado, boom da IA, mercados otimistas',
        context: 'bull-market',
        assets: {
          'BTC-USD': { symbol: 'BTC-USD', name: 'Bitcoin', startPrice: 42000, endPrice: 67000, return: 59.5, volatility: 45.2, maxDrawdown: -15.3 },
          'ETH-USD': { symbol: 'ETH-USD', name: 'Ethereum', startPrice: 2400, endPrice: 3500, return: 45.8, volatility: 52.1, maxDrawdown: -22.1 },
          '^GSPC': { symbol: '^GSPC', name: 'S&P 500', startPrice: 4700, endPrice: 5400, return: 14.9, volatility: 12.3, maxDrawdown: -8.2 },
          '^BVSP': { symbol: '^BVSP', name: 'Ibovespa', startPrice: 132000, endPrice: 125000, return: -5.3, volatility: 18.7, maxDrawdown: -12.8 },
          'CDI': { symbol: 'CDI', name: 'CDI', startPrice: 100, endPrice: 105.5, return: 11.0, volatility: 0.1, maxDrawdown: 0 }
        }
      },
      {
        id: 'election-2023',
        name: 'Pós-Eleições 2023',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        duration: '1 ano',
        description: 'Mercados reagindo ao novo governo, políticas econômicas',
        context: 'political-transition',
        assets: {
          'BTC-USD': { symbol: 'BTC-USD', name: 'Bitcoin', startPrice: 16500, endPrice: 42000, return: 154.5, volatility: 67.8, maxDrawdown: -25.4 },
          'ETH-USD': { symbol: 'ETH-USD', name: 'Ethereum', startPrice: 1200, endPrice: 2400, return: 100.0, volatility: 72.3, maxDrawdown: -28.9 },
          '^GSPC': { symbol: '^GSPC', name: 'S&P 500', startPrice: 3850, endPrice: 4700, return: 22.1, volatility: 16.8, maxDrawdown: -9.8 },
          '^BVSP': { symbol: '^BVSP', name: 'Ibovespa', startPrice: 109000, endPrice: 132000, return: 21.1, volatility: 22.4, maxDrawdown: -11.2 },
          'CDI': { symbol: 'CDI', name: 'CDI', startPrice: 100, endPrice: 113.6, return: 13.6, volatility: 0.2, maxDrawdown: 0 }
        }
      },
      {
        id: 'crypto-winter-2022',
        name: 'Crypto Winter 2022',
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        duration: '1 ano',
        description: 'Terra Luna, FTX, alta de juros devastam criptomoedas',
        context: 'bear-market',
        assets: {
          'BTC-USD': { symbol: 'BTC-USD', name: 'Bitcoin', startPrice: 46200, endPrice: 16500, return: -64.3, volatility: 79.2, maxDrawdown: -76.8 },
          'ETH-USD': { symbol: 'ETH-USD', name: 'Ethereum', startPrice: 3700, endPrice: 1200, return: -67.6, volatility: 88.7, maxDrawdown: -82.1 },
          '^GSPC': { symbol: '^GSPC', name: 'S&P 500', startPrice: 4766, endPrice: 3850, return: -19.2, volatility: 25.4, maxDrawdown: -25.4 },
          '^BVSP': { symbol: '^BVSP', name: 'Ibovespa', startPrice: 104000, endPrice: 109000, return: 4.8, volatility: 28.9, maxDrawdown: -17.3 },
          'CDI': { symbol: 'CDI', name: 'CDI', startPrice: 100, endPrice: 111.25, return: 11.25, volatility: 0.2, maxDrawdown: 0 }
        }
      },
      {
        id: 'bull-run-2021',
        name: 'Bull Run 2021',
        startDate: '2021-01-01',
        endDate: '2021-12-31',
        duration: '1 ano',
        description: 'ATH do Bitcoin, NFTs explodindo, DeFi em alta',
        context: 'euphoria',
        assets: {
          'BTC-USD': { symbol: 'BTC-USD', name: 'Bitcoin', startPrice: 29000, endPrice: 46200, return: 59.3, volatility: 87.6, maxDrawdown: -53.2 },
          'ETH-USD': { symbol: 'ETH-USD', name: 'Ethereum', startPrice: 730, endPrice: 3700, return: 406.8, volatility: 95.4, maxDrawdown: -55.8 },
          '^GSPC': { symbol: '^GSPC', name: 'S&P 500', startPrice: 3756, endPrice: 4766, return: 26.9, volatility: 17.2, maxDrawdown: -5.9 },
          '^BVSP': { symbol: '^BVSP', name: 'Ibovespa', startPrice: 119000, endPrice: 104000, return: -12.6, volatility: 24.1, maxDrawdown: -18.9 },
          'CDI': { symbol: 'CDI', name: 'CDI', startPrice: 100, endPrice: 102.75, return: 2.75, volatility: 0.1, maxDrawdown: 0 }
        }
      },
      {
        id: 'covid-2020',
        name: 'Pandemia COVID-19',
        startDate: '2020-03-01',
        endDate: '2020-12-31',
        duration: '10 meses',
        description: 'Crash histórico seguido de recuperação em V',
        context: 'crash-recovery',
        assets: {
          'BTC-USD': { symbol: 'BTC-USD', name: 'Bitcoin', startPrice: 8500, endPrice: 29000, return: 241.2, volatility: 89.3, maxDrawdown: -62.8 },
          'ETH-USD': { symbol: 'ETH-USD', name: 'Ethereum', startPrice: 130, endPrice: 730, return: 461.5, volatility: 112.3, maxDrawdown: -78.2 },
          '^GSPC': { symbol: '^GSPC', name: 'S&P 500', startPrice: 2900, endPrice: 3756, return: 29.5, volatility: 34.2, maxDrawdown: -35.4 },
          '^BVSP': { symbol: '^BVSP', name: 'Ibovespa', startPrice: 85000, endPrice: 119000, return: 40.0, volatility: 42.1, maxDrawdown: -43.2 },
          'CDI': { symbol: 'CDI', name: 'CDI', startPrice: 100, endPrice: 102.0, return: 2.0, volatility: 0.1, maxDrawdown: 0 }
        }
      }
    ]

    return this.sortPeriodsByDate(simulatedPeriods)
  }

  private getSimulatedAssetData(symbol: string, startDate: string, endDate: string): HistoricalAssetData {
    // Gerar dados simulados baseados no símbolo e período
    const isRecent = new Date(endDate) > new Date('2023-01-01')
    const duration = this.calculateDurationInDays(startDate, endDate)
    
    let baseReturn = 0
    let volatility = 20
    
    if (symbol.includes('BTC')) {
      baseReturn = isRecent ? 50 : Math.random() * 200 - 50
      volatility = 70
    } else if (symbol.includes('ETH')) {
      baseReturn = isRecent ? 40 : Math.random() * 300 - 60
      volatility = 80
    } else if (symbol.includes('GSPC')) {
      baseReturn = Math.random() * 25 - 5
      volatility = 15
    } else if (symbol.includes('BVSP')) {
      baseReturn = Math.random() * 30 - 10
      volatility = 25
    } else if (symbol === 'CDI') {
      baseReturn = Math.random() * 8 + 2
      volatility = 0.1
    }

    // Ajustar para duração
    const annualizedReturn = (baseReturn * duration) / 365

    return {
      symbol,
      name: symbol,
      startPrice: 100,
      endPrice: 100 * (1 + annualizedReturn / 100),
      return: annualizedReturn,
      volatility,
      maxDrawdown: -(Math.random() * volatility * 0.8)
    }
  }

  private sortPeriodsByDate(periods: HistoricalPeriod[]): HistoricalPeriod[] {
    return periods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  private calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.round(diffDays / 30)
    const diffYears = Math.round(diffDays / 365)
    
    if (diffDays < 60) return `${diffDays} dias`
    if (diffMonths < 12) return `${diffMonths} meses`
    if (diffYears === 1) return '1 ano'
    return `${diffYears} anos`
  }

  private calculateDurationInDays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Método para buscar dados mais recentes
  async getLatestPeriods(): Promise<HistoricalPeriod[]> {
    const periods = await this.getHistoricalPeriods()
    
    // Filtrar apenas períodos dos últimos 5 anos
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    
    return periods.filter(period => 
      new Date(period.startDate) >= fiveYearsAgo
    )
  }
}

export const historicalDataService = new HistoricalDataService()
export type { HistoricalPeriod, HistoricalAssetData }