import nodemailer from 'nodemailer'
import { User } from '../models/User'
import { Goal } from '../models/Goal'

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    })
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const mailOptions = {
        from: `"Planejador Financeiro" <${process.env.SMTP_USER || 'noreply@planejadorfinanceiro.com'}>`,
        to,
        subject,
        html
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email enviado com sucesso:', result.messageId)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return { success: false, error: error.message }
    }
  }

  async sendGoalReminder(userId: string, goalId: string) {
    try {
      const user = await User.findById(userId)
      const goal = await Goal.findById(goalId)

      if (!user || !goal) {
        throw new Error('Usuário ou meta não encontrados')
      }

      const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
      const monthsRemaining = Math.max(Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)), 0)
      
      const html = this.getGoalReminderTemplate({
        userName: user.name,
        goalTitle: goal.title,
        goalTarget: goal.targetAmount,
        goalCurrent: goal.currentAmount,
        monthlyContribution: goal.monthlyContribution,
        progress: progress,
        monthsRemaining: monthsRemaining,
        targetDate: goal.targetDate
      })

      return await this.sendEmail(
        user.email,
        `🎯 Lembrete: Aporte para sua meta "${goal.title}"`,
        html
      )
    } catch (error) {
      console.error('Erro ao enviar lembrete de meta:', error)
      return { success: false, error: error.message }
    }
  }

  async sendWeeklyReport(userId: string) {
    try {
      const user = await User.findById(userId)
      const goals = await Goal.find({ userId, status: 'active' })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
      const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
      const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

      const html = this.getWeeklyReportTemplate({
        userName: user.name,
        totalGoals: goals.length,
        totalTarget,
        totalCurrent,
        totalProgress,
        goals: goals.map(goal => ({
          title: goal.title,
          progress: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100),
          current: goal.currentAmount,
          target: goal.targetAmount
        }))
      })

      return await this.sendEmail(
        user.email,
        '📊 Relatório Semanal - Suas Metas Financeiras',
        html
      )
    } catch (error) {
      console.error('Erro ao enviar relatório semanal:', error)
      return { success: false, error: error.message }
    }
  }

  async sendWelcomeEmail(userId: string) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      const html = this.getWelcomeTemplate(user.name)

      return await this.sendEmail(
        user.email,
        '🚀 Bem-vindo ao Planejador Financeiro!',
        html
      )
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error)
      return { success: false, error: error.message }
    }
  }

  private getGoalReminderTemplate(data: any) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #1e293b; margin-bottom: 20px;">🎯 Lembrete de Aporte</h1>
        
        <p style="color: #64748b; font-size: 16px;">Olá, <strong>${data.userName}</strong>!</p>
        
        <p style="color: #64748b; font-size: 16px;">Este é um lembrete amigável para contribuir com sua meta financeira:</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0;">${data.goalTitle}</h3>
          <div style="margin-bottom: 10px;">
            <span style="color: #64748b;">Progresso atual:</span>
            <strong style="color: #059669;">R$ ${data.goalCurrent.toLocaleString('pt-BR')} / R$ ${data.goalTarget.toLocaleString('pt-BR')} (${data.progress.toFixed(1)}%)</strong>
          </div>
          <div style="background-color: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background-color: #059669; height: 100%; width: ${Math.min(data.progress, 100)}%; transition: width 0.3s ease;"></div>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <p style="color: #64748b; margin: 5px 0;"><strong>Aporte mensal sugerido:</strong> R$ ${data.monthlyContribution.toLocaleString('pt-BR')}</p>
          <p style="color: #64748b; margin: 5px 0;"><strong>Prazo restante:</strong> ${data.monthsRemaining} meses</p>
          <p style="color: #64748b; margin: 5px 0;"><strong>Data objetivo:</strong> ${new Date(data.targetDate).toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/goals" 
             style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver Minhas Metas
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 30px;">
          Consistência é a chave do sucesso financeiro! 💪
        </p>
      </div>
    </div>
    `
  }

  private getWeeklyReportTemplate(data: any) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #1e293b; margin-bottom: 20px;">📊 Relatório Semanal</h1>
        
        <p style="color: #64748b; font-size: 16px;">Olá, <strong>${data.userName}</strong>!</p>
        
        <p style="color: #64748b; font-size: 16px;">Aqui está o resumo das suas metas financeiras desta semana:</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0;">Resumo Geral</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">Total de metas ativas:</span>
            <strong style="color: #1e293b;">${data.totalGoals}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">Patrimônio atual:</span>
            <strong style="color: #059669;">R$ ${data.totalCurrent.toLocaleString('pt-BR')}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #64748b;">Progresso geral:</span>
            <strong style="color: #059669;">${data.totalProgress.toFixed(1)}%</strong>
          </div>
          <div style="background-color: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background-color: #059669; height: 100%; width: ${Math.min(data.totalProgress, 100)}%;"></div>
          </div>
        </div>
        
        ${data.goals.map((goal: any) => `
          <div style="border-left: 4px solid #3b82f6; padding-left: 15px; margin: 15px 0;">
            <h4 style="color: #1e293b; margin: 0 0 8px 0;">${goal.title}</h4>
            <div style="color: #64748b; font-size: 14px;">
              R$ ${goal.current.toLocaleString('pt-BR')} / R$ ${goal.target.toLocaleString('pt-BR')} (${goal.progress.toFixed(1)}%)
            </div>
          </div>
        `).join('')}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app" 
             style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver Dashboard
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 30px;">
          Continue assim! Você está no caminho certo para alcançar seus objetivos! 🎯
        </p>
      </div>
    </div>
    `
  }

  private getWelcomeTemplate(userName: string) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #1e293b; margin-bottom: 20px;">🚀 Bem-vindo ao Planejador Financeiro!</h1>
        
        <p style="color: #64748b; font-size: 16px;">Olá, <strong>${userName}</strong>!</p>
        
        <p style="color: #64748b; font-size: 16px;">
          Parabéns por dar o primeiro passo rumo à sua independência financeira! 
          Estamos muito felizes em tê-lo conosco.
        </p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0;">O que você pode fazer:</h3>
          <ul style="color: #64748b; margin: 0; padding-left: 20px;">
            <li>Definir suas metas financeiras</li>
            <li>Simular cenários de investimento</li>
            <li>Acompanhar seu progresso em tempo real</li>
            <li>Receber lembretes para aportes</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/profile" 
             style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Completar Perfil
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 30px;">
          Sua jornada financeira começa agora! 💰
        </p>
      </div>
    </div>
    `
  }

  async testEmailConnection() {
    try {
      await this.transporter.verify()
      console.log('Conexão com servidor de email OK')
      return { success: true }
    } catch (error) {
      console.error('Erro na conexão com servidor de email:', error)
      return { success: false, error: error.message }
    }
  }
}

export const emailService = new EmailService()