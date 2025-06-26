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
  Calculator
} from 'lucide-react'

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { toast } = useToast()

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Perfil', href: '/app/profile', icon: User },
    { name: 'Metas', href: '/app/goals', icon: Target },
    { name: 'Simulador', href: '/app/simulator', icon: Calculator },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Planejador Financeiro
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </Card>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}