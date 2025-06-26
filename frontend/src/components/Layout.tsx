import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  Home, 
  User, 
  Target, 
  LogOut, 
  TrendingUp,
  Calculator,
  BarChart3,
  Bell,
  ChevronRight,
  HelpCircle
} from 'lucide-react'

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { toast } = useToast()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/app', 
      icon: Home,
      description: 'Visão geral das suas finanças'
    },
    { 
      name: 'Metas', 
      href: '/app/goals', 
      icon: Target,
      description: 'Defina e acompanhe seus objetivos'
    },
    { 
      name: 'Mercado', 
      href: '/app/market', 
      icon: BarChart3,
      description: 'Cotações e dados de investimentos'
    },
    { 
      name: 'Simulador', 
      href: '/app/simulator', 
      icon: Calculator,
      description: 'Simule investimentos e cenários'
    },
    { 
      name: 'Perfil', 
      href: '/app/profile', 
      icon: User,
      description: 'Seus dados pessoais e financeiros'
    },
    { 
      name: 'Notificações', 
      href: '/app/notifications', 
      icon: Bell,
      description: 'Configure lembretes e relatórios'
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso. Até logo!",
        variant: "success"
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao desconectar. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const getBreadcrumb = () => {
    const path = location.pathname
    const currentPage = navigation.find(nav => nav.href === path)
    return currentPage || { name: 'Dashboard', description: 'Visão geral das suas finanças' }
  }

  const breadcrumb = getBreadcrumb()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-gray-900">
                  Planejador Financeiro
                </span>
                <div className="text-xs text-gray-500">Seu futuro financeiro</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-3">
              <Home className="h-4 w-4 text-gray-400" />
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <span className="text-sm font-medium text-gray-900">{breadcrumb.name}</span>
              <span className="text-sm text-gray-500 ml-2">• {breadcrumb.description}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="space-y-4">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Menu Principal</h2>
                  <p className="text-sm text-gray-500">Navegue pelas funcionalidades</p>
                </div>
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-start space-x-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md transform scale-[1.02]'
                            : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${
                          isActive 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.name}</div>
                          <div className={`text-xs mt-0.5 ${
                            isActive 
                              ? 'text-primary-foreground/80' 
                              : 'text-gray-500'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </Card>
              
              {/* Quick Help Card */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Dicas R\u00e1pidas</span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Comece definindo seu perfil financeiro, depois crie suas metas e acompanhe o progresso no dashboard.
                </p>
              </Card>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border-0 min-h-[600px] p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}