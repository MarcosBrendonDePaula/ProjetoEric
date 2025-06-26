import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  User, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Star,
  BookOpen
} from 'lucide-react'

interface OnboardingProps {
  hasProfile?: boolean
  hasGoals?: boolean
  onComplete?: () => void
}

export function Onboarding({ hasProfile = false, hasGoals = false, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Planejador Financeiro!',
      description: 'Vamos ajudá-lo a organizar suas finanças e alcançar seus objetivos.',
      icon: Star,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <p className="text-gray-600">
            Em poucos passos você terá um planejamento financeiro completo e personalizado.
          </p>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Configure seu Perfil',
      description: 'Primeiro, vamos conhecer sua situação financeira atual.',
      icon: User,
      completed: hasProfile,
      action: '/app/profile',
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Dados Pessoais</h4>
              <p className="text-sm text-gray-600">Nome, idade e informações básicas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">Situação Financeira</h4>
              <p className="text-sm text-gray-600">Renda, gastos e perfil de investidor</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Defina suas Metas',
      description: 'Agora vamos criar seus objetivos financeiros.',
      icon: Target,
      completed: hasGoals,
      action: '/app/goals',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl mb-1">🏠</div>
              <p className="text-xs font-medium">Casa Própria</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg text-center">
              <div className="text-2xl mb-1">🚗</div>
              <p className="text-xs font-medium">Veículo</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl mb-1">📚</div>
              <p className="text-xs font-medium">Educação</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl mb-1">✈️</div>
              <p className="text-xs font-medium">Viagem</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Escolha entre várias categorias ou crie metas personalizadas
          </p>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Tudo Pronto!',
      description: 'Agora você pode acompanhar seu progresso no dashboard.',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              🎉 Parabéns! Seu planejamento financeiro está configurado.
            </p>
            <p className="text-sm text-gray-500">
              Explore o dashboard, acompanhe dados de mercado e receba notificações personalizadas.
            </p>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <BookOpen className="h-6 w-6 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">
            Passo {currentStep + 1} de {steps.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
        <CardDescription>{currentStepData.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          {currentStepData.content}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            size="sm"
          >
            Voltar
          </Button>

          <div className="flex space-x-2">
            {currentStepData.action && !currentStepData.completed ? (
              <Button asChild size="sm">
                <Link to={currentStepData.action}>
                  Configurar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            ) : (
              <Button onClick={handleNext} size="sm">
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}