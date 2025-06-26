import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, BarChart3 } from 'lucide-react'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
})

export function MarketPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'stock' | 'crypto' | 'etf'>('all')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['marketData', selectedType],
    queryFn: async () => {
      const endpoint = selectedType === 'all' ? '/market/data' : `/market/data/${selectedType}`
      const response = await api.get(endpoint)
      return response.data
    },
    refetchInterval: 5 * 60 * 1000 // Atualizar a cada 5 minutos
  })

  const updateMutation = useMutation({
    mutationFn: () => api.post('/market/update'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketData'] })
      toast({
        title: "Dados atualizados!",
        description: "Os dados de mercado foram atualizados com sucesso.",
        variant: "success"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro na atualização",
        description: error.response?.data?.error || "Erro ao atualizar dados de mercado.",
        variant: "destructive"
      })
    }
  })

  const data = marketData?.data || []
  const lastUpdate = marketData?.lastUpdate

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatChange = (change: number, isPercent: boolean = false) => {
    const formatted = isPercent ? `${change.toFixed(2)}%` : change.toFixed(2)
    return change >= 0 ? `+${formatted}` : formatted
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  const typeLabels = {
    all: 'Todos',
    stock: 'Ações',
    crypto: 'Criptomoedas',
    etf: 'ETFs'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
        
        <div className="flex space-x-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
          ))}
        </div>
        
        <div className="grid gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dados de Mercado</h1>
            <p className="text-gray-600">
              Acompanhe cotações em tempo real
              {lastUpdate && (
                <span className="ml-2 text-sm">
                  • Última atualização: {new Date(lastUpdate).toLocaleString('pt-BR')}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${updateMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        {Object.entries(typeLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedType === key ? "default" : "outline"}
            onClick={() => setSelectedType(key as any)}
            size="sm"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Lista de Ativos */}
      {data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum dado disponível
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Os dados de mercado serão carregados automaticamente. 
              Clique em "Atualizar" para buscar as cotações mais recentes.
            </p>
            <Button onClick={() => updateMutation.mutate()}>
              Buscar Dados
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.map((item: any) => {
            const ChangeIcon = getChangeIcon(item.changePercent)
            const changeColor = getChangeColor(item.changePercent)
            
            return (
              <Card key={`${item.symbol}-${item.type}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">
                            {item.symbol.substring(0, 2)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.symbol}
                        </h3>
                        <p className="text-sm text-gray-600">{item.name}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'stock' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'crypto' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.type === 'stock' ? 'Ação' :
                           item.type === 'crypto' ? 'Cripto' : 'ETF'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(item.price, item.currency)}
                      </div>
                      <div className={`flex items-center space-x-1 ${changeColor}`}>
                        <ChangeIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {formatChange(item.change)} ({formatChange(item.changePercent, true)})
                        </span>
                      </div>
                      {item.volume > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Vol: {item.volume.toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Resumo por Categoria */}
      {data.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {['stock', 'crypto', 'etf'].map(type => {
            const typeData = data.filter((item: any) => item.type === type)
            if (typeData.length === 0) return null

            const avgChange = typeData.reduce((sum: number, item: any) => sum + item.changePercent, 0) / typeData.length
            const ChangeIcon = getChangeIcon(avgChange)
            const changeColor = getChangeColor(avgChange)

            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {type === 'stock' ? 'Ações' : type === 'crypto' ? 'Criptomoedas' : 'ETFs'}
                  </CardTitle>
                  <CardDescription>
                    {typeData.length} ativo{typeData.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Variação média:</div>
                    <div className={`flex items-center space-x-1 ${changeColor}`}>
                      <ChangeIcon className="h-4 w-4" />
                      <span className="font-medium">
                        {formatChange(avgChange, true)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}