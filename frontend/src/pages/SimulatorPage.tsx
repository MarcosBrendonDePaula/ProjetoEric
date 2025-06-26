import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, TrendingUp, BarChart3, DollarSign } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface SimulationData {
  month: number
  invested: number
  total: number
  interest: number
}

interface PortfolioComparison {
  name: string
  allocation: { asset: string; percentage: number; color: string }[]
  expectedReturn: number
  risk: number
  description: string
}

const portfolios: PortfolioComparison[] = [
  {
    name: 'Conservador',
    allocation: [
      { asset: 'Renda Fixa', percentage: 80, color: '#3B82F6' },
      { asset: 'Ações', percentage: 15, color: '#EF4444' },
      { asset: 'REITs', percentage: 5, color: '#10B981' }
    ],
    expectedReturn: 6.5,
    risk: 2.1,
    description: 'Ideal para quem busca segurança e tem baixa tolerância a risco'
  },
  {
    name: 'Moderado',
    allocation: [
      { asset: 'Renda Fixa', percentage: 50, color: '#3B82F6' },
      { asset: 'Ações', percentage: 35, color: '#EF4444' },
      { asset: 'REITs', percentage: 10, color: '#10B981' },
      { asset: 'Internacional', percentage: 5, color: '#8B5CF6' }
    ],
    expectedReturn: 9.2,
    risk: 4.8,
    description: 'Equilibrio entre risco e retorno para investidores intermediários'
  },
  {
    name: 'Agressivo',
    allocation: [
      { asset: 'Ações', percentage: 60, color: '#EF4444' },
      { asset: 'Renda Fixa', percentage: 20, color: '#3B82F6' },
      { asset: 'REITs', percentage: 10, color: '#10B981' },
      { asset: 'Internacional', percentage: 10, color: '#8B5CF6' }
    ],
    expectedReturn: 12.8,
    risk: 8.5,
    description: 'Para investidores experientes que buscam máximo crescimento'
  }
]

export function SimulatorPage() {
  const [initialAmount, setInitialAmount] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(1000)
  const [timeHorizon, setTimeHorizon] = useState(10)
  const [selectedPortfolio, setSelectedPortfolio] = useState(portfolios[1])
  const [customReturn, setCustomReturn] = useState(selectedPortfolio.expectedReturn)
  const [simulationData, setSimulationData] = useState<SimulationData[]>([])

  const calculateSimulation = () => {
    const monthlyRate = customReturn / 100 / 12
    const totalMonths = timeHorizon * 12
    const data: SimulationData[] = []

    let currentAmount = initialAmount
    let totalInvested = initialAmount

    for (let month = 0; month <= totalMonths; month++) {
      const interest = currentAmount - totalInvested
      
      data.push({
        month,
        invested: totalInvested,
        total: currentAmount,
        interest
      })

      if (month < totalMonths) {
        currentAmount = currentAmount * (1 + monthlyRate) + monthlyContribution
        totalInvested += monthlyContribution
      }
    }

    setSimulationData(data)
  }

  const finalAmount = simulationData.length > 0 ? simulationData[simulationData.length - 1].total : 0
  const totalInvested = initialAmount + (monthlyContribution * timeHorizon * 12)
  const totalInterest = finalAmount - totalInvested

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulador de Investimentos</h1>
          <p className="text-gray-600">Compare cenários e projete seus investimentos</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Parâmetros</span>
            </CardTitle>
            <CardDescription>
              Configure os valores para a simulação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Inicial (R$)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Aporte Mensal (R$)</label>
              <Input
                type="number"
                min="0"
                step="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período (anos)</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Portfolio</label>
              <Select 
                value={selectedPortfolio.name}
                onValueChange={(value) => {
                  const portfolio = portfolios.find(p => p.name === value)!
                  setSelectedPortfolio(portfolio)
                  setCustomReturn(portfolio.expectedReturn)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map(portfolio => (
                    <SelectItem key={portfolio.name} value={portfolio.name}>
                      {portfolio.name} - {portfolio.expectedReturn}% a.a.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Retorno Anual (%)</label>
              <Input
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={customReturn}
                onChange={(e) => setCustomReturn(Number(e.target.value))}
              />
            </div>

            <Button onClick={calculateSimulation} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Simular
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cards de Resultado */}
          {simulationData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Investido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalInvested)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalInterest)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Final</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(finalAmount)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gráfico de Evolução */}
          {simulationData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Evolução do Patrimônio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => `${Math.floor(value / 12)}a`}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === 'invested' ? 'Investido' : 
                          name === 'total' ? 'Total' : 'Rendimento'
                        ]}
                        labelFormatter={(label) => `Mês ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="invested" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="invested"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="total"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comparação de Portfólios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Comparação de Portfólios</span>
          </CardTitle>
          <CardDescription>
            Compare diferentes estratégias de alocação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div key={portfolio.name} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{portfolio.name}</h3>
                  <p className="text-sm text-gray-600">{portfolio.description}</p>
                </div>

                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolio.allocation}
                        dataKey="percentage"
                        nameKey="asset"
                        cx="50%"
                        cy="50%"
                        outerRadius={40}
                        label={({ percentage }) => `${percentage}%`}
                      >
                        {portfolio.allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {portfolio.allocation.map((item) => (
                    <div key={item.asset} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.asset}: {item.percentage}%</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Retorno:</span>
                    <div className="font-semibold text-green-600">
                      {portfolio.expectedReturn}% a.a.
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Risco:</span>
                    <div className="font-semibold text-red-600">
                      {portfolio.risk}%
                    </div>
                  </div>
                </div>

                <Button
                  variant={selectedPortfolio.name === portfolio.name ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setSelectedPortfolio(portfolio)
                    setCustomReturn(portfolio.expectedReturn)
                  }}
                >
                  {selectedPortfolio.name === portfolio.name ? 'Selecionado' : 'Selecionar'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}