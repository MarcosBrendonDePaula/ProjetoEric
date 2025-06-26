import cron from 'node-cron'
import { marketDataService } from './marketDataService'

class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map()

  startMarketDataUpdates() {
    // Atualizar dados de mercado a cada 6 horas (para não exceder limites da API gratuita)
    const marketDataJob = cron.schedule('0 */6 * * *', async () => {
      console.log('Executando atualização automática de dados de mercado...')
      try {
        await marketDataService.updateAllMarketData()
        console.log('Atualização de dados de mercado concluída com sucesso')
      } catch (error) {
        console.error('Erro na atualização automática de dados de mercado:', error)
      }
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    })

    this.jobs.set('marketData', marketDataJob)
    marketDataJob.start()
    console.log('Cron job de dados de mercado iniciado - execução a cada 6 horas')

    // Atualização inicial
    setTimeout(async () => {
      console.log('Executando primeira atualização de dados de mercado...')
      try {
        await marketDataService.updateAllMarketData()
        console.log('Primeira atualização concluída')
      } catch (error) {
        console.error('Erro na primeira atualização:', error)
      }
    }, 5000) // 5 segundos após o start
  }

  stopMarketDataUpdates() {
    const job = this.jobs.get('marketData')
    if (job) {
      job.stop()
      this.jobs.delete('marketData')
      console.log('Cron job de dados de mercado interrompido')
    }
  }

  // Atualização manual para desenvolvimento/teste
  async manualMarketUpdate() {
    console.log('Iniciando atualização manual de dados de mercado...')
    try {
      const result = await marketDataService.updateAllMarketData()
      console.log('Atualização manual concluída:', result)
      return result
    } catch (error) {
      console.error('Erro na atualização manual:', error)
      throw error
    }
  }

  getJobStatus() {
    return {
      marketData: {
        running: this.jobs.has('marketData') && this.jobs.get('marketData')?.running,
        nextRun: this.jobs.get('marketData')?.nextDates()
      }
    }
  }

  stopAllJobs() {
    for (const [name, job] of this.jobs) {
      job.stop()
      console.log(`Cron job ${name} interrompido`)
    }
    this.jobs.clear()
  }
}

export const cronService = new CronService()