import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/hooks/use-toast'
import { Bell, Mail, Save, Send } from 'lucide-react'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
})

interface NotificationSettings {
  emailNotifications: {
    goalReminders: boolean
    weeklyReports: boolean
    marketUpdates: boolean
  }
  reminderDay: number
  reminderTime: string
  timezone: string
}

export function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: {
      goalReminders: true,
      weeklyReports: true,
      marketUpdates: false
    },
    reminderDay: 5,
    reminderTime: '09:00',
    timezone: 'America/Sao_Paulo'
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const response = await api.get('/notifications/settings')
      return response.data
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: NotificationSettings) => api.put('/notifications/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
      toast({
        title: "Configurações salvas!",
        description: "Suas preferências de notificação foram atualizadas.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.response?.data?.error || "Erro ao atualizar configurações.",
        variant: "destructive"
      })
    }
  })

  const testEmailMutation = useMutation({
    mutationFn: () => api.post('/notifications/test-email'),
    onSuccess: () => {
      toast({
        title: "Email de teste enviado!",
        description: "Verifique sua caixa de entrada para confirmar o recebimento.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar email",
        description: error.response?.data?.error || "Erro ao enviar email de teste.",
        variant: "destructive"
      })
    }
  })

  const weeklyReportMutation = useMutation({
    mutationFn: () => api.post('/notifications/send-weekly-report'),
    onSuccess: () => {
      toast({
        title: "Relatório enviado!",
        description: "Seu relatório semanal foi enviado por email.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar relatório",
        description: error.response?.data?.error || "Erro ao enviar relatório semanal.",
        variant: "destructive"
      })
    }
  })

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings)
    }
  }, [settingsData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(settings)
  }

  const handleEmailNotificationChange = (key: keyof typeof settings.emailNotifications, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: checked
      }
    }))
  }

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)
  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
        </div>
        
        <div className="grid gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
                </div>
                <div className="space-y-3">
                  {[1,2,3].map(j => (
                    <div key={j} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-56"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600">Configure quando e como receber lembretes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Configurações de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Notificações por Email</span>
              </CardTitle>
              <CardDescription>
                Escolha quais tipos de notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goalReminders"
                  checked={settings.emailNotifications.goalReminders}
                  onCheckedChange={(checked) => 
                    handleEmailNotificationChange('goalReminders', checked as boolean)
                  }
                />
                <label htmlFor="goalReminders" className="text-sm font-medium leading-none">
                  Lembretes de aportes mensais
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weeklyReports"
                  checked={settings.emailNotifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    handleEmailNotificationChange('weeklyReports', checked as boolean)
                  }
                />
                <label htmlFor="weeklyReports" className="text-sm font-medium leading-none">
                  Relatórios semanais de progresso
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketUpdates"
                  checked={settings.emailNotifications.marketUpdates}
                  onCheckedChange={(checked) => 
                    handleEmailNotificationChange('marketUpdates', checked as boolean)
                  }
                />
                <label htmlFor="marketUpdates" className="text-sm font-medium leading-none">
                  Atualizações do mercado
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Horário */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Horário</CardTitle>
              <CardDescription>
                Defina quando receber os lembretes de aportes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dia do mês para lembretes</label>
                  <Select 
                    value={settings.reminderDay.toString()}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, reminderDay: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOptions.map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          Dia {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Horário</label>
                  <Select 
                    value={settings.reminderTime}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, reminderTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 Os lembretes serão enviados todo dia {settings.reminderDay} do mês às {settings.reminderTime}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Testar Notificações</CardTitle>
              <CardDescription>
                Envie emails de teste para verificar se está tudo funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <LoadingButton
                  type="button"
                  variant="outline"
                  loading={testEmailMutation.isPending}
                  onClick={() => testEmailMutation.mutate()}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Email de Teste</span>
                </LoadingButton>
                
                <LoadingButton
                  type="button"
                  variant="outline"
                  loading={weeklyReportMutation.isPending}
                  onClick={() => weeklyReportMutation.mutate()}
                  className="flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Relatório Semanal</span>
                </LoadingButton>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <LoadingButton 
              type="submit" 
              loading={updateMutation.isPending}
              loadingText="Salvando..."
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Configurações</span>
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  )
}