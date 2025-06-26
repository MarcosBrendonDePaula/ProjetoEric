import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { goalsApi, profileApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Target, TrendingUp, PlusCircle, DollarSign, Calendar, Star, AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import { Onboarding } from '@/components/Onboarding'
import { LoadingPage } from '@/components/ui/loading'

export function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll()
  })

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get()
  })

  const goals = goalsData?.data?.goals || []
  const profile = profileData?.data?.profile

  const totalGoalsValue = goals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0)
  const totalCurrentValue = goals.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0)
  const totalProgress = totalGoalsValue > 0 ? (totalCurrentValue / totalGoalsValue) * 100 : 0

  const activeGoals = goals.filter((goal: any) => goal.status === 'active')
  const completedGoals = goals.filter((goal: any) => goal.status === 'completed')

  // Dados para gráficos
  const categoryData = goals.reduce((acc: any, goal: any) => {
    const category = goal.category
    const categoryLabels: any = {
      retirement: 'Aposentadoria',
      emergency_fund: 'Reserva',
      house: 'Casa Própria',
      education: 'Educação',
      travel: 'Viagem',
      investment_growth: 'Investimentos',
      other: 'Outros'
    }
    
    const existing = acc.find((item: any) => item.name === categoryLabels[category])
    if (existing) {
      existing.value += goal.targetAmount
      existing.current += goal.currentAmount
    } else {
      acc.push({
        name: categoryLabels[category] || 'Outros',
        value: goal.targetAmount,
        current: goal.currentAmount,
        color: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16'][acc.length % 7]
      })
    }
    return acc
  }, [])

  const monthlyData = activeGoals.map((goal: any) => ({
    name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
    aporte: goal.monthlyContribution,
    progresso: goal.progress
  }))

  const projectionData = activeGoals.slice(0, 3).map((goal: any) => {
    const monthsRemaining = goal.monthsRemaining || 0
    const currentAmount = goal.currentAmount
    const monthlyContribution = goal.monthlyContribution
    const expectedReturn = goal.expectedReturn / 100 / 12
    
    const projectedAmount = monthsRemaining > 0 
      ? currentAmount * Math.pow(1 + expectedReturn, monthsRemaining) +
        monthlyContribution * ((Math.pow(1 + expectedReturn, monthsRemaining) - 1) / expectedReturn)
      : currentAmount

    return {
      name: goal.title.length > 10 ? goal.title.substring(0, 10) + '...' : goal.title,
      atual: currentAmount,
      projecao: projectedAmount,
      meta: goal.targetAmount
    }
  })

  // Verificar se precisa mostrar onboarding
  const isNewUser = !profile || goals.length === 0
  
  if (profileLoading || goalsLoading) {
    return <LoadingPage text="Carregando seu dashboard..." />
  }

  if (showOnboarding || isNewUser) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Onboarding 
          hasProfile={!!profile}
          hasGoals={goals.length > 0}
          onComplete={() => setShowOnboarding(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {profile?.name?.split(' ')[0] || 'Usuário'}! 👋
            </h1>
            {totalProgress > 0 && (
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" />
                <span>{totalProgress.toFixed(0)}% das metas</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-lg">
            {activeGoals.length > 0 
              ? `Você tem ${activeGoals.length} meta${activeGoals.length > 1 ? 's' : ''} ativa${activeGoals.length > 1 ? 's' : ''}. Continue assim!`
              : 'Que tal criar sua primeira meta financeira?'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowOnboarding(true)}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Tour</span>
          </Button>
          <Link to="/app/goals">
            <Button className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Nova Meta</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Metas Ativas</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{activeGoals.length}</div>
            <p className="text-sm text-blue-700 mt-1">
              {completedGoals.length > 0 ? `${completedGoals.length} concluída${completedGoals.length > 1 ? 's' : ''}` : 'Comece criando uma meta'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Valor Total das Metas</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              R$ {totalGoalsValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-green-700 mt-1">
              Objetivo total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Valor Atual</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              R$ {totalCurrentValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-purple-700 mt-1">
              Acumulado até agora
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Progresso Geral</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{totalProgress.toFixed(1)}%</div>
            <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(totalProgress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Das suas metas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Metas Ativas</span>
            </CardTitle>
            <CardDescription>
              Suas metas em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma meta ativa</p>
                <Link to="/app/goals">
                  <Button variant="outline" className="mt-4">
                    Criar primeira meta
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeGoals.slice(0, 3).map((goal: any) => (
                  <div key={goal._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-600">
                        R$ {goal.currentAmount.toLocaleString('pt-BR')} de R$ {goal.targetAmount.toLocaleString('pt-BR')}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="text-sm font-medium">
                        {(goal.progress || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
                {activeGoals.length > 3 && (
                  <Link to="/app/goals">
                    <Button variant="outline" className="w-full">
                      Ver todas as metas
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seu Perfil</CardTitle>
            <CardDescription>
              Resumo do seu perfil de investidor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Perfil de Risco:</span>
              <span className="font-medium capitalize">
                {profile.riskTolerance === 'conservative' ? 'Conservador' :
                 profile.riskTolerance === 'moderate' ? 'Moderado' : 'Agressivo'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Horizonte:</span>
              <span className="font-medium">{profile.investmentHorizon} anos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Experiência:</span>
              <span className="font-medium capitalize">
                {profile.investmentExperience === 'beginner' ? 'Iniciante' :
                 profile.investmentExperience === 'intermediate' ? 'Intermediário' : 'Avançado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Renda Mensal:</span>
              <span className="font-medium">
                R$ {profile.monthlyIncome.toLocaleString('pt-BR')}
              </span>
            </div>
            <Link to="/app/profile">
              <Button variant="outline" className="w-full mt-4">
                Editar Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      {goals.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Distribuição por Categoria */}
          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Distribuição por Categoria</span>
                </CardTitle>
                <CardDescription>
                  Como suas metas estão distribuídas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString('pt-BR')}`, 
                          'Valor da Meta'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aportes Mensais */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Aportes Mensais</span>
                </CardTitle>
                <CardDescription>
                  Quanto você está investindo por meta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString('pt-BR')}`, 
                          'Aporte Mensal'
                        ]}
                      />
                      <Bar dataKey="aporte" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projeção vs Meta */}
          {projectionData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Projeção vs Meta</span>
                </CardTitle>
                <CardDescription>
                  Compare o valor atual, projeção e meta das suas principais metas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `R$ ${value.toLocaleString('pt-BR')}`, 
                          name === 'atual' ? 'Valor Atual' :
                          name === 'projecao' ? 'Projeção' : 'Meta'
                        ]}
                      />
                      <Bar dataKey="atual" fill="#EF4444" name="atual" />
                      <Bar dataKey="projecao" fill="#10B981" name="projecao" />
                      <Bar dataKey="meta" fill="#3B82F6" name="meta" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Valor Atual</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Projeção</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Meta</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}