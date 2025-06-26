import axios from 'axios'
import { MarketData } from '../models/MarketData'

class MarketDataService {
  private alphaVantageKey: string
  private baseUrls = {
    alphaVantage: 'https://www.alphavantage.co/query',
    coinGecko: 'https://api.coingecko.com/api/v3'
  }

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo'
  }

  // Buscar dados de ações brasileiras via Alpha Vantage
  async fetchStockData(symbols: string[] = ['PETR4.SAO', 'VALE3.SAO', 'ITUB4.SAO', 'BBDC4.SAO']) {
    const results = []
    
    for (const symbol of symbols) {
      try {
        const response = await axios.get(this.baseUrls.alphaVantage, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: this.alphaVantageKey
          },
          timeout: 10000
        })

        const quote = response.data['Global Quote']
        if (quote && quote['01. symbol']) {
          const stockData = {
            symbol: quote['01. symbol'].replace('.SAO', ''),
            name: this.getStockName(quote['01. symbol']),
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            type: 'stock' as const,
            currency: 'BRL',
            lastUpdated: new Date()
          }

          await this.updateMarketData(stockData)
          results.push(stockData)
        }

        // Rate limiting - Alpha Vantage permite 5 calls/min
        await new Promise(resolve => setTimeout(resolve, 12000))
      } catch (error) {
        console.error(`Erro ao buscar dados da ação ${symbol}:`, error)
      }
    }

    return results
  }

  // Buscar dados de criptomoedas via CoinGecko
  async fetchCryptoData() {
    try {
      const response = await axios.get(`${this.baseUrls.coinGecko}/simple/price`, {
        params: {
          ids: 'bitcoin,ethereum,binancecoin,cardano,solana',
          vs_currencies: 'usd,brl',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        },
        timeout: 10000
      })

      const cryptoMap = {
        bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
        ethereum: { symbol: 'ETH', name: 'Ethereum' },
        binancecoin: { symbol: 'BNB', name: 'BNB' },
        cardano: { symbol: 'ADA', name: 'Cardano' },
        solana: { symbol: 'SOL', name: 'Solana' }
      }

      const results = []
      for (const [id, crypto] of Object.entries(cryptoMap)) {
        const data = response.data[id]
        if (data) {
          const cryptoData = {
            symbol: crypto.symbol,
            name: crypto.name,
            price: data.usd,
            change: data.usd_24h_change || 0,
            changePercent: data.usd_24h_change || 0,
            volume: data.usd_24h_vol || 0,
            marketCap: data.usd_market_cap || 0,
            type: 'crypto' as const,
            currency: 'USD',
            lastUpdated: new Date()
          }

          await this.updateMarketData(cryptoData)
          results.push(cryptoData)
        }
      }

      return results
    } catch (error) {
      console.error('Erro ao buscar dados de cripto:', error)
      return []
    }
  }

  // Simular dados de ETFs brasileiros (dados ficcionais para demo)
  async fetchETFData() {
    const etfs = [
      { symbol: 'IVVB11', name: 'iShares Core S&P 500', basePrice: 280 },
      { symbol: 'SMAL11', name: 'iShares Small Cap', basePrice: 85 },
      { symbol: 'BOVA11', name: 'iShares Bovespa', basePrice: 95 },
      { symbol: 'HASH11', name: 'Hashdex Crypto', basePrice: 55 }
    ]

    const results = []
    for (const etf of etfs) {
      // Gerar variação aleatória para simular movimento do mercado
      const changePercent = (Math.random() - 0.5) * 4 // Variação de -2% a +2%
      const change = etf.basePrice * (changePercent / 100)
      const currentPrice = etf.basePrice + change

      const etfData = {
        symbol: etf.symbol,
        name: etf.name,
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
        type: 'etf' as const,
        currency: 'BRL',
        lastUpdated: new Date()
      }

      await this.updateMarketData(etfData)
      results.push(etfData)
    }

    return results
  }

  private async updateMarketData(data: any) {
    try {
      await MarketData.findOneAndUpdate(
        { symbol: data.symbol, type: data.type },
        data,
        { upsert: true, new: true }
      )
    } catch (error) {
      console.error('Erro ao salvar dados de mercado:', error)
    }
  }

  private getStockName(symbol: string): string {
    const stockNames: { [key: string]: string } = {
      'PETR4.SAO': 'Petrobras PN',
      'VALE3.SAO': 'Vale ON',
      'ITUB4.SAO': 'Itaú Unibanco PN',
      'BBDC4.SAO': 'Bradesco PN',
      'ABEV3.SAO': 'Ambev ON',
      'WEGE3.SAO': 'WEG ON'
    }
    return stockNames[symbol] || symbol.replace('.SAO', '')
  }

  // Buscar todos os dados de mercado
  async getAllMarketData() {
    try {
      const data = await MarketData.find({}).sort({ type: 1, symbol: 1 })
      return data
    } catch (error) {
      console.error('Erro ao buscar dados de mercado:', error)
      return []
    }
  }

  // Buscar dados por tipo
  async getMarketDataByType(type: 'stock' | 'crypto' | 'etf') {
    try {
      const data = await MarketData.find({ type }).sort({ symbol: 1 })
      return data
    } catch (error) {
      console.error(`Erro ao buscar dados de ${type}:`, error)
      return []
    }
  }

  // Atualizar todos os dados
  async updateAllMarketData() {
    console.log('Iniciando atualização de dados de mercado...')
    
    try {
      const [stocks, cryptos, etfs] = await Promise.allSettled([
        this.fetchStockData(),
        this.fetchCryptoData(),
        this.fetchETFData()
      ])

      const stocksResult = stocks.status === 'fulfilled' ? stocks.value : []
      const cryptosResult = cryptos.status === 'fulfilled' ? cryptos.value : []
      const etfsResult = etfs.status === 'fulfilled' ? etfs.value : []

      console.log(`Dados atualizados: ${stocksResult.length} ações, ${cryptosResult.length} criptos, ${etfsResult.length} ETFs`)
      
      return {
        stocks: stocksResult,
        cryptos: cryptosResult,
        etfs: etfsResult,
        total: stocksResult.length + cryptosResult.length + etfsResult.length
      }
    } catch (error) {
      console.error('Erro na atualização geral de dados:', error)
      return { stocks: [], cryptos: [], etfs: [], total: 0 }
    }
  }
}

export const marketDataService = new MarketDataService()