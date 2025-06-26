import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Target, Plus, Edit, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react'

interface Goal {
  _id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  monthlyContribution: number
  expectedReturn: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  category: string
  progress: number
  monthsRemaining: number
}

interface GoalFormData {
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  monthlyContribution: number
  expectedReturn: number
  riskLevel: 'low' | 'medium' | 'high'
  category: 'retirement' | 'emergency_fund' | 'house' | 'education' | 'travel' | 'investment_growth' | 'other'
}

const categoryLabels = {
  retirement: 'Aposentadoria',
  emergency_fund: 'Reserva de Emergência',
  house: 'Casa Própria',
  education: 'Educação',
  travel: 'Viagem',
  investment_growth: 'Crescimento Patrimonial',
  other: 'Outros'
}

const riskLabels = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto'
}

export function GoalsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    monthlyContribution: 0,
    expectedReturn: 8,
    riskLevel: 'medium',
    category: 'investment_growth'
  })

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll()
  })

  const createGoalMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setIsDialogOpen(false)
      resetForm()
      toast({
        title: "Meta criada com sucesso!",
        description: "Sua nova meta financeira foi adicionada ao dashboard.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar meta",
        description: error.response?.data?.error || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    }
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => goalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setIsDialogOpen(false)
      resetForm()
      toast({
        title: "Meta atualizada!",
        description: "As informações da sua meta foram atualizadas com sucesso.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar meta",
        description: error.response?.data?.error || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    }
  })

  const deleteGoalMutation = useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast({
        title: "Meta excluída",
        description: "A meta foi removida com sucesso.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir meta",
        description: error.response?.data?.error || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    }
  })

  const addContributionMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      goalsApi.addContribution(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast({
        title: "Aporte adicionado!",
        description: "Seu aporte foi registrado com sucesso.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar aporte",
        description: error.response?.data?.error || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    }
  })

  const goals: Goal[] = goalsData?.data?.goals || []

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      monthlyContribution: 0,
      expectedReturn: 8,
      riskLevel: 'medium',
      category: 'investment_growth'
    })
    setEditingGoal(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingGoal) {
        await updateGoalMutation.mutateAsync({
          id: editingGoal._id,
          data: formData
        })
      } else {
        await createGoalMutation.mutateAsync(formData)
      }
    } catch (error) {
      console.error('Error saving goal:', error)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate.split('T')[0],
      monthlyContribution: goal.monthlyContribution,
      expectedReturn: goal.expectedReturn,
      riskLevel: goal.riskLevel,
      category: goal.category as any
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (goalId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      await deleteGoalMutation.mutateAsync(goalId)
    }
  }

  const calculateProjection = (goal: Goal) => {
    const months = goal.monthsRemaining
    if (months <= 0) return goal.currentAmount

    const monthlyRate = goal.expectedReturn / 100 / 12
    const futureValue = goal.currentAmount * Math.pow(1 + monthlyRate, months) +
      goal.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    
    return futureValue
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Metas Financeiras</h1>
            <p className="text-gray-600">Gerencie e acompanhe seus objetivos</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nova Meta</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nova Meta'}
              </DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Atualize as informações da sua meta' : 'Defina uma nova meta financeira'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Casa própria"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição opcional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor da Meta (R$)</label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor Atual (R$)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Objetivo</label>
                    <Input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aporte Mensal (R$)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monthlyContribution}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retorno Esperado (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      step="0.1"
                      value={formData.expectedReturn}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedReturn: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nível de Risco</label>
                    <Select 
                      value={formData.riskLevel} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, riskLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(riskLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                >
                  {createGoalMutation.isPending || updateGoalMutation.isPending 
                    ? 'Salvando...' 
                    : editingGoal ? 'Atualizar' : 'Criar Meta'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma meta criada ainda
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Comece definindo sua primeira meta financeira para acompanhar seu progresso
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {goals.map((goal) => (
            <Card key={goal._id}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{goal.title}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status === 'completed' ? 'Concluída' :
                         goal.status === 'paused' ? 'Pausada' : 'Ativa'}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {categoryLabels[goal.category as keyof typeof categoryLabels]} • {goal.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(goal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(goal._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Progresso</p>
                      <p className="font-semibold">
                        R$ {goal.currentAmount.toLocaleString('pt-BR')} / R$ {goal.targetAmount.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Prazo</p>
                      <p className="font-semibold">
                        {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Aporte Mensal</p>
                      <p className="font-semibold">R$ {goal.monthlyContribution.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Projeção</p>
                      <p className="font-semibold text-green-600">
                        R$ {calculateProjection(goal).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso: {goal.progress.toFixed(1)}%</span>
                    <span>{goal.monthsRemaining} meses restantes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        goal.progress >= 100 ? 'bg-green-500' :
                        goal.progress >= 75 ? 'bg-blue-500' :
                        goal.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {calculateProjection(goal) >= goal.targetAmount && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      🎉 Parabéns! Com seus aportes atuais, você deve atingir sua meta antes do prazo!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}