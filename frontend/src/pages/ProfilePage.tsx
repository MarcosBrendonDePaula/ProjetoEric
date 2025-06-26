import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/lib/api'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { User, Save, AlertCircle } from 'lucide-react'

interface ProfileFormData {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizon: number
  currentAssets: number
  monthlyIncome: number
  monthlyExpenses: number
  investmentExperience: 'beginner' | 'intermediate' | 'advanced'
  objectives: string[]
  age: number
}

const objectiveOptions = [
  { value: 'retirement', label: 'Aposentadoria' },
  { value: 'emergency_fund', label: 'Reserva de Emergência' },
  { value: 'house', label: 'Casa Própria' },
  { value: 'education', label: 'Educação' },
  { value: 'travel', label: 'Viagem' },
  { value: 'investment_growth', label: 'Crescimento Patrimonial' },
  { value: 'other', label: 'Outros' },
]

export function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    riskTolerance: 'moderate',
    investmentHorizon: 10,
    currentAssets: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    investmentExperience: 'beginner',
    objectives: [],
    age: 25
  })
  const [hasProfile, setHasProfile] = useState(false)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
    retry: false
  })

  const createProfileMutation = useMutation({
    mutationFn: profileApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setHasProfile(true)
      toast({
        title: "Perfil criado com sucesso!",
        description: "Suas informações foram salvas. Agora você pode criar suas metas financeiras.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar perfil",
        description: error.response?.data?.error || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.response?.data?.error || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    }
  })

  useEffect(() => {
    if (profileData?.data?.profile) {
      const profile = profileData.data.profile
      setFormData({
        riskTolerance: profile.riskTolerance,
        investmentHorizon: profile.investmentHorizon,
        currentAssets: profile.currentAssets,
        monthlyIncome: profile.monthlyIncome,
        monthlyExpenses: profile.monthlyExpenses,
        investmentExperience: profile.investmentExperience,
        objectives: profile.objectives,
        age: profile.age
      })
      setHasProfile(true)
    }
  }, [profileData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (hasProfile) {
        await updateProfileMutation.mutateAsync(formData)
      } else {
        await createProfileMutation.mutateAsync(formData)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleObjectiveChange = (objective: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, objective]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.filter(obj => obj !== objective)
      }))
    }
  }

  const availableForInvestment = formData.monthlyIncome - formData.monthlyExpenses

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil de Investidor</h1>
          <p className="text-gray-600">
            {hasProfile ? 'Atualize suas informações' : 'Complete seu perfil para começar a usar o planejador'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Dados básicos para personalizar sua experiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Idade</label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experiência com Investimentos</label>
                  <Select 
                    value={formData.investmentExperience} 
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                      setFormData(prev => ({ ...prev, investmentExperience: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Situação Financeira */}
          <Card>
            <CardHeader>
              <CardTitle>Situação Financeira</CardTitle>
              <CardDescription>
                Informações sobre sua renda e patrimônio atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Renda Mensal (R$)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gastos Mensais (R$)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyExpenses: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Patrimônio Atual (R$)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentAssets}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAssets: Number(e.target.value) }))}
                  required
                />
              </div>

              {availableForInvestment > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    💰 Você tem R$ {availableForInvestment.toLocaleString('pt-BR')} disponível para investir mensalmente
                  </p>
                </div>
              )}

              {availableForInvestment < 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Seus gastos estão maiores que sua renda. Considere revisar seu orçamento antes de investir.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Perfil de Investimento */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Investimento</CardTitle>
              <CardDescription>
                Como você se comporta em relação a riscos e prazos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tolerância a Risco</label>
                  <Select 
                    value={formData.riskTolerance} 
                    onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
                      setFormData(prev => ({ ...prev, riskTolerance: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservador - Prefiro segurança</SelectItem>
                      <SelectItem value="moderate">Moderado - Aceito alguns riscos</SelectItem>
                      <SelectItem value="aggressive">Agressivo - Busco maiores retornos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Horizonte de Investimento (anos)</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.investmentHorizon}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentHorizon: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Objetivos</CardTitle>
              <CardDescription>
                Quais são seus principais objetivos financeiros? (Selecione todos que se aplicam)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectiveOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.objectives.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleObjectiveChange(option.value, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <LoadingButton 
              type="submit" 
              loading={createProfileMutation.isPending || updateProfileMutation.isPending}
              loadingText="Salvando..."
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>
                {hasProfile ? 'Atualizar Perfil' : 'Salvar Perfil'}
              </span>
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  )
}