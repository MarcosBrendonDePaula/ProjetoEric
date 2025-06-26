import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or handle unauthorized
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
}

// Profile API calls
export const profileApi = {
  get: () => api.get('/profile'),
  
  create: (data: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    investmentHorizon: number
    currentAssets: number
    monthlyIncome: number
    monthlyExpenses: number
    investmentExperience: 'beginner' | 'intermediate' | 'advanced'
    objectives: string[]
    age: number
  }) => api.post('/profile', data),
  
  update: (data: Partial<{
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    investmentHorizon: number
    currentAssets: number
    monthlyIncome: number
    monthlyExpenses: number
    investmentExperience: 'beginner' | 'intermediate' | 'advanced'
    objectives: string[]
    age: number
  }>) => api.put('/profile', data),
}

// Goals API calls
export const goalsApi = {
  getAll: () => api.get('/goals'),
  
  getById: (id: string) => api.get(`/goals/${id}`),
  
  create: (data: {
    title: string
    description?: string
    targetAmount: number
    currentAmount?: number
    targetDate: string
    monthlyContribution: number
    expectedReturn: number
    riskLevel: 'low' | 'medium' | 'high'
    category: 'retirement' | 'emergency_fund' | 'house' | 'education' | 'travel' | 'investment_growth' | 'other'
  }) => api.post('/goals', data),
  
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  
  delete: (id: string) => api.delete(`/goals/${id}`),
  
  addContribution: (id: string, amount: number) =>
    api.post(`/goals/${id}/contribution`, { amount }),
}