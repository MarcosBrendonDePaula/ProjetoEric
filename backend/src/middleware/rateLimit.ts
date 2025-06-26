import { Elysia } from 'elysia'

// Rate limiting em memória simples (em produção usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutos
const MAX_REQUESTS = 100 // máximo de requests por janela

export const rateLimit = new Elysia()
  .derive(({ request, set }) => {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const now = Date.now()
    const clientData = requestCounts.get(clientIP)
    
    if (!clientData || now > clientData.resetTime) {
      // Reset ou primeira requisição
      requestCounts.set(clientIP, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      })
      return {}
    }
    
    if (clientData.count >= MAX_REQUESTS) {
      set.status = 429
      set.headers['Retry-After'] = Math.ceil((clientData.resetTime - now) / 1000).toString()
      throw new Error('Rate limit exceeded')
    }
    
    clientData.count++
    return {}
  })