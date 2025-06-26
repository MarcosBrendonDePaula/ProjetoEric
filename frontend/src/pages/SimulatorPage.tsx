import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider-simple'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-simple'
import { Badge } from '@/components/ui/badge-simple'
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Target,
  Zap,
  Eye,
  Settings,
  GitCompare,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Bar
} from 'recharts'

interface SimulationData {
  month: number
  year: number
  invested: number
  total: number
  interest: number
  monthlyContribution: number
}

interface PortfolioComparison {
  name: string
  allocation: { asset: string; percentage: number; color: string }[]
  expectedReturn: number
  risk: number
  description: string
  icon: string
  minInvestment: number
}

interface ScenarioComparison {
  name: string
  initialAmount: number
  monthlyContribution: number
  timeHorizon: number
  expectedReturn: number
  finalAmount: number
  totalInvested: number
  totalReturn: number
}

// Dados históricos reais para simulação (retornos anuais)
const historicalData = {
  periods: [
    {
      name: 'Bear Market 2020 (Março-Dezembro)',
      startDate: '2020-03-01',
      endDate: '2020-12-31',
      duration: '10 meses',
      description: 'Pandemia COVID-19 - Crash e recuperação espetacular',
      assets: {
        'SP500': { return: 16.26, volatility: 34.2, label: 'S&P 500' },
        'BTC': { return: 300.0, volatility: 87.6, label: 'Bitcoin' },
        'ETH': { return: 469.0, volatility: 112.3, label: 'Ethereum' },
        'IBOV': { return: 2.92, volatility: 42.1, label: 'Ibovespa' },
        'CDI': { return: 2.75, volatility: 0.1, label: 'CDI' }
      }
    },
    {
      name: 'Crypto Winter 2022',
      startDate: '2022-01-01',
      endDate: '2022-12-31',
      duration: '1 ano',
      description: 'Colapso das criptos - Terra Luna, FTX',
      assets: {
        'SP500': { return: -18.11, volatility: 25.4, label: 'S&P 500' },
        'BTC': { return: -64.2, volatility: 79.2, label: 'Bitcoin' },
        'ETH': { return: -67.6, volatility: 88.7, label: 'Ethereum' },
        'IBOV': { return: 4.69, volatility: 28.9, label: 'Ibovespa' },
        'CDI': { return: 11.25, volatility: 0.2, label: 'CDI' }
      }
    },
    {
      name: 'Bull Run 2017',
      startDate: '2017-01-01',
      endDate: '2017-12-31',
      duration: '1 ano',
      description: 'Explosão das criptomoedas',
      assets: {
        'SP500': { return: 21.83, volatility: 11.1, label: 'S&P 500' },
        'BTC': { return: 1318.0, volatility: 95.4, label: 'Bitcoin' },
        'ETH': { return: 9162.0, volatility: 156.8, label: 'Ethereum' },
        'IBOV': { return: 26.86, volatility: 18.2, label: 'Ibovespa' },
        'CDI': { return: 9.93, volatility: 0.1, label: 'CDI' }
      }
    },
    {
      name: 'Crise 2008',
      startDate: '2008-01-01',
      endDate: '2008-12-31',
      duration: '1 ano',
      description: 'Crise financeira global',
      assets: {
        'SP500': { return: -37.0, volatility: 32.7, label: 'S&P 500' },
        'BTC': { return: 0, volatility: 0, label: 'Bitcoin (não existia)' },
        'ETH': { return: 0, volatility: 0, label: 'Ethereum (não existia)' },
        'IBOV': { return: -41.22, volatility: 38.5, label: 'Ibovespa' },
        'CDI': { return: 12.4, volatility: 0.3, label: 'CDI' }
      }
    }
  ]
}

const portfolios: PortfolioComparison[] = [
  {
    name: 'Conservador',
    icon: '🛡️',
    allocation: [
      { asset: 'Tesouro Direto', percentage: 50, color: '#3B82F6' },
      { asset: 'CDB', percentage: 30, color: '#1E40AF' },
      { asset: 'Ações Blue Chips', percentage: 15, color: '#EF4444' },
      { asset: 'REITs', percentage: 5, color: '#10B981' }
    ],
    expectedReturn: 8.5,
    risk: 3.2,
    minInvestment: 1000,
    description: 'Ideal para iniciantes e quem prioriza segurança. Baixa volatilidade.'
  },
  {
    name: 'Moderado',
    icon: '⚖️',
    allocation: [
      { asset: 'Renda Fixa', percentage: 40, color: '#3B82F6' },
      { asset: 'Ações Nacionais', percentage: 35, color: '#EF4444' },
      { asset: 'REITs', percentage: 15, color: '#10B981' },
      { asset: 'Internacional', percentage: 10, color: '#8B5CF6' }
    ],
    expectedReturn: 11.2,
    risk: 6.1,
    minInvestment: 5000,
    description: 'Equilibrio entre segurança e crescimento. Para perfil intermediário.'
  },
  {
    name: 'Agressivo',
    icon: '🚀',
    allocation: [
      { asset: 'Ações Growth', percentage: 45, color: '#EF4444' },
      { asset: 'ETFs Internacionais', percentage: 25, color: '#8B5CF6' },
      { asset: 'REITs', percentage: 15, color: '#10B981' },
      { asset: 'Renda Fixa', percentage: 15, color: '#3B82F6' }
    ],
    expectedReturn: 15.8,
    risk: 12.3,
    minInvestment: 10000,
    description: 'Máximo potencial de crescimento. Para investidores experientes.'
  },
  {
    name: 'Cripto',
    icon: '₿',
    allocation: [
      { asset: 'Bitcoin', percentage: 40, color: '#F7931A' },
      { asset: 'Ethereum', percentage: 30, color: '#627EEA' },
      { asset: 'Altcoins', percentage: 20, color: '#8B5CF6' },
      { asset: 'Stablecoins', percentage: 10, color: '#10B981' }
    ],
    expectedReturn: 25.0,
    risk: 35.0,
    minInvestment: 500,
    description: 'Alto risco e alto retorno. Apenas para investidores experientes.'
  }
]

export function SimulatorPage() {
  const [activeTab, setActiveTab] = useState('simulator')
  const [initialAmount, setInitialAmount] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(1000)
  const [timeHorizon, setTimeHorizon] = useState(10)
  const [selectedPortfolio, setSelectedPortfolio] = useState(portfolios[1])
  const [customReturn, setCustomReturn] = useState(selectedPortfolio.expectedReturn)
  const [simulationData, setSimulationData] = useState<SimulationData[]>([])
  const [scenarios, setScenarios] = useState<ScenarioComparison[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [selectedHistoricalPeriod, setSelectedHistoricalPeriod] = useState(historicalData.periods[0])
  const [historicalInvestment, setHistoricalInvestment] = useState(10000)
  const [selectedAssets, setSelectedAssets] = useState(['BTC', 'ETH', 'SP500', 'CDI'])

  const calculateSimulation = () => {
    const monthlyRate = customReturn / 100 / 12
    const totalMonths = timeHorizon * 12
    const data: SimulationData[] = []

    let currentAmount = initialAmount
    let totalInvested = initialAmount

    for (let month = 0; month <= totalMonths; month++) {
      const interest = currentAmount - totalInvested
      const year = Math.floor(month / 12)
      
      data.push({
        month,
        year,
        invested: totalInvested,
        total: currentAmount,
        interest,
        monthlyContribution: month === 0 ? 0 : monthlyContribution
      })

      if (month < totalMonths) {
        currentAmount = currentAmount * (1 + monthlyRate) + monthlyContribution
        totalInvested += monthlyContribution
      }
    }

    setSimulationData(data)
  }

  const addScenario = () => {
    const finalAmount = simulationData.length > 0 ? simulationData[simulationData.length - 1].total : 0
    const totalInvested = initialAmount + (monthlyContribution * timeHorizon * 12)
    const totalReturn = finalAmount - totalInvested

    const newScenario: ScenarioComparison = {
      name: `${selectedPortfolio.name} - ${timeHorizon}a`,
      initialAmount,
      monthlyContribution,
      timeHorizon,
      expectedReturn: customReturn,
      finalAmount,
      totalInvested,
      totalReturn
    }

    setScenarios(prev => [...prev.slice(-2), newScenario])
  }

  useEffect(() => {
    calculateSimulation()
  }, [initialAmount, monthlyContribution, timeHorizon, customReturn])

  const finalAmount = simulationData.length > 0 ? simulationData[simulationData.length - 1].total : 0
  const totalInvested = initialAmount + (monthlyContribution * timeHorizon * 12)
  const totalInterest = finalAmount - totalInvested
  const returnMultiplier = totalInvested > 0 ? finalAmount / totalInvested : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getRiskLevel = (risk: number) => {
    if (risk < 5) return { label: 'Baixo', color: 'bg-green-100 text-green-800' }
    if (risk < 10) return { label: 'Médio', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Alto', color: 'bg-red-100 text-red-800' }
  }

  const getTimeRecommendation = () => {
    if (timeHorizon < 2) return { text: 'Muito curto para investimentos', icon: AlertTriangle, color: 'text-red-600' }
    if (timeHorizon < 5) return { text: 'Prazo adequado para metas de curto prazo', icon: CheckCircle2, color: 'text-yellow-600' }
    return { text: 'Excelente prazo para crescimento patrimonial', icon: CheckCircle2, color: 'text-green-600' }
  }

  const timeRec = getTimeRecommendation()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Simulador Inteligente</h1>
              <p className="text-gray-600 text-lg">Projete seus investimentos com precisão</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center space-x-2"
          >
            <GitCompare className="h-4 w-4" />
            <span>Comparar</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulator" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Simulador</span>
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="portfolios" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Portfólios</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center space-x-2">
            <GitCompare className="h-4 w-4" />
            <span>Comparação</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Painel de Controle */}
            <Card className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Settings className="h-5 w-5" />
                  <span>Configurações</span>
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Ajuste os parâmetros da simulação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Valor Inicial */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-blue-900">Valor Inicial</label>
                    <span className="text-sm font-bold text-blue-700">{formatCurrency(initialAmount)}</span>
                  </div>
                  <Slider
                    value={[initialAmount]}
                    onValueChange={([value]) => setInitialAmount(value)}
                    max={100000}
                    min={1000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>R$ 1.000</span>
                    <span>R$ 100.000</span>
                  </div>
                </div>

                {/* Aporte Mensal */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-blue-900">Aporte Mensal</label>
                    <span className="text-sm font-bold text-blue-700">{formatCurrency(monthlyContribution)}</span>
                  </div>
                  <Slider
                    value={[monthlyContribution]}
                    onValueChange={([value]) => setMonthlyContribution(value)}
                    max={10000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>R$ 100</span>
                    <span>R$ 10.000</span>
                  </div>
                </div>

                {/* Período */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-blue-900">Período</label>
                    <span className="text-sm font-bold text-blue-700">{timeHorizon} anos</span>
                  </div>
                  <Slider
                    value={[timeHorizon]}
                    onValueChange={([value]) => setTimeHorizon(value)}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>1 ano</span>
                    <span>30 anos</span>
                  </div>
                </div>

                {/* Recomendação de Tempo */}
                <div className="p-3 bg-white/50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <timeRec.icon className={`h-4 w-4 ${timeRec.color}`} />
                    <span className="text-xs font-medium text-blue-900">{timeRec.text}</span>
                  </div>
                </div>

                {/* Portfólio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Estratégia</label>
                  <Select 
                    value={selectedPortfolio.name}
                    onValueChange={(value) => {
                      const portfolio = portfolios.find(p => p.name === value)!
                      setSelectedPortfolio(portfolio)
                      setCustomReturn(portfolio.expectedReturn)
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios.map(portfolio => (
                        <SelectItem key={portfolio.name} value={portfolio.name}>
                          <div className="flex items-center space-x-2">
                            <span>{portfolio.icon}</span>
                            <span>{portfolio.name}</span>
                            <Badge variant="secondary">{formatPercentage(portfolio.expectedReturn)}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Retorno Customizado */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Retorno Anual (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={customReturn}
                    onChange={(e) => setCustomReturn(Number(e.target.value))}
                    className="bg-white"
                  />
                </div>

                <Button onClick={addScenario} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Salvar Cenário
                </Button>
              </CardContent>
            </Card>

            {/* Resultados */}
            <div className="lg:col-span-3 space-y-6">
              {/* Cards de Resultado */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Total Final</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(finalAmount)}</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-green-200 text-green-800">{returnMultiplier.toFixed(1)}x o investido</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total Investido</p>
                        <p className="text-xl font-bold text-blue-700">{formatCurrency(totalInvested)}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Rendimento</p>
                        <p className="text-xl font-bold text-purple-700">{formatCurrency(totalInterest)}</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-900">Retorno</p>
                        <p className="text-xl font-bold text-orange-700">{formatPercentage(customReturn)}</p>
                      </div>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge className={getRiskLevel(selectedPortfolio.risk).color}>
                        Risco {getRiskLevel(selectedPortfolio.risk).label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico Principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Evolução do Patrimônio</span>
                  </CardTitle>
                  <CardDescription>
                    Projeção de crescimento ao longo de {timeHorizon} anos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={simulationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="year" 
                          tickFormatter={(value) => `${value}a`}
                          stroke="#666"
                        />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value)}
                          stroke="#666"
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === 'invested' ? 'Total Investido' : 
                            name === 'total' ? 'Patrimônio Total' : 'Rendimentos'
                          ]}
                          labelFormatter={(label) => `Ano ${label}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="interest"
                          stackId="1"
                          stroke="#10B981"
                          fill="url(#colorInterest)"
                          name="interest"
                        />
                        <Area
                          type="monotone"
                          dataKey="invested"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="url(#colorInvested)"
                          name="invested"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#EF4444" 
                          strokeWidth={3}
                          name="total"
                          dot={false}
                        />
                        <defs>
                          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Configurações Históricas */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-900">
                  <TrendingUp className="h-5 w-5" />
                  <span>Simulação Histórica</span>
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Teste sua estratégia em cenários reais do passado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Valor do Investimento */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-purple-900">Valor Investido</label>
                    <span className="text-sm font-bold text-purple-700">{formatCurrency(historicalInvestment)}</span>
                  </div>
                  <Slider
                    value={[historicalInvestment]}
                    onValueChange={([value]) => setHistoricalInvestment(value)}
                    max={100000}
                    min={1000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-purple-600">
                    <span>R$ 1.000</span>
                    <span>R$ 100.000</span>
                  </div>
                </div>

                {/* Período Histórico */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-900">Período Histórico</label>
                  <Select 
                    value={selectedHistoricalPeriod.name}
                    onValueChange={(value) => {
                      const period = historicalData.periods.find(p => p.name === value)!
                      setSelectedHistoricalPeriod(period)
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {historicalData.periods.map(period => (
                        <SelectItem key={period.name} value={period.name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{period.name}</span>
                            <span className="text-xs text-gray-500">{period.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Info do Período */}
                <div className="p-3 bg-white/50 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-900 space-y-1">
                    <div><strong>Período:</strong> {selectedHistoricalPeriod.duration}</div>
                    <div><strong>Contexto:</strong> {selectedHistoricalPeriod.description}</div>
                  </div>
                </div>

                {/* Seleção de Ativos */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-900">Ativos para Comparar</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedHistoricalPeriod.assets).map(([key, asset]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssets(prev => [...prev, key])
                            } else {
                              setSelectedAssets(prev => prev.filter(a => a !== key))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-xs text-purple-800">{asset.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultados Históricos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cards de Resultados */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedAssets.map(assetKey => {
                  const asset = selectedHistoricalPeriod.assets[assetKey]
                  if (!asset || asset.return === 0) return null

                  const finalValue = historicalInvestment * (1 + asset.return / 100)
                  const profit = finalValue - historicalInvestment
                  const isPositive = profit >= 0

                  return (
                    <Card key={assetKey} className={`${isPositive ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">{asset.label}</div>
                          <div className={`text-lg font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(finalValue)}
                          </div>
                          <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(profit)}
                          </div>
                          <Badge className={`mt-1 ${isPositive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {formatPercentage(asset.return)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Gráfico de Comparação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Comparação de Performance - {selectedHistoricalPeriod.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Como diferentes ativos se comportaram no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={selectedAssets.map(assetKey => {
                          const asset = selectedHistoricalPeriod.assets[assetKey]
                          if (!asset || asset.return === 0) return null
                          
                          return {
                            name: asset.label,
                            inicial: historicalInvestment,
                            final: historicalInvestment * (1 + asset.return / 100),
                            retorno: asset.return,
                            volatilidade: asset.volatility
                          }
                        }).filter(Boolean)}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'retorno' ? formatPercentage(value) : formatCurrency(value),
                            name === 'inicial' ? 'Valor Inicial' : 
                            name === 'final' ? 'Valor Final' : 
                            name === 'retorno' ? 'Retorno' : 'Volatilidade'
                          ]}
                        />
                        <Bar yAxisId="left" dataKey="inicial" fill="#94A3B8" name="inicial" />
                        <Bar yAxisId="left" dataKey="final" fill="#10B981" name="final" />
                        <Line yAxisId="right" type="monotone" dataKey="retorno" stroke="#EF4444" strokeWidth={2} name="retorno" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Análise e Insights */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-900">
                    <Lightbulb className="h-5 w-5" />
                    <span>Insights do Período</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-yellow-800">
                  {selectedHistoricalPeriod.name.includes('2020') && (
                    <>
                      <p className="text-sm">🏥 <strong>COVID-19:</strong> Criptomoedas se mostraram resilientes após crash inicial.</p>
                      <p className="text-sm">📈 <strong>Recuperação V:</strong> Ativos de risco tiveram performance excepcional.</p>
                      <p className="text-sm">💡 <strong>Lição:</strong> Manter posições durante volatilidade pode ser recompensador.</p>
                    </>
                  )}
                  {selectedHistoricalPeriod.name.includes('2022') && (
                    <>
                      <p className="text-sm">❄️ <strong>Crypto Winter:</strong> Ano devastador para criptomoedas.</p>
                      <p className="text-sm">🏦 <strong>Renda Fixa:</strong> CDI performou bem com alta da Selic.</p>
                      <p className="text-sm">💡 <strong>Lição:</strong> Diversificação protege em cenários adversos.</p>
                    </>
                  )}
                  {selectedHistoricalPeriod.name.includes('2017') && (
                    <>
                      <p className="text-sm">🚀 <strong>Bull Run:</strong> Ethereum teve retorno astronômico de +9000%.</p>
                      <p className="text-sm">⚡ <strong>FOMO:</strong> Período de euforia especulativa extrema.</p>
                      <p className="text-sm">💡 <strong>Lição:</strong> Ganhos extraordinários vêm com riscos enormes.</p>
                    </>
                  )}
                  {selectedHistoricalPeriod.name.includes('2008') && (
                    <>
                      <p className="text-sm">💥 <strong>Crise Global:</strong> Ações despencaram mundialmente.</p>
                      <p className="text-sm">🏛️ <strong>Renda Fixa:</strong> CDI ofereceu proteção e retorno positivo.</p>
                      <p className="text-sm">💡 <strong>Lição:</strong> Em crises, qualidade e liquidez são fundamentais.</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolios" className="space-y-6">
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {portfolios.map((portfolio) => {
              const riskLevel = getRiskLevel(portfolio.risk)
              const isSelected = selectedPortfolio.name === portfolio.name
              
              return (
                <Card 
                  key={portfolio.name} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => {
                    setSelectedPortfolio(portfolio)
                    setCustomReturn(portfolio.expectedReturn)
                    setActiveTab('simulator')
                  }}
                >
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{portfolio.icon}</div>
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <span>{portfolio.name}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {portfolio.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Alocação */}
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={portfolio.allocation}
                            dataKey="percentage"
                            nameKey="asset"
                            cx="50%"
                            cy="50%"
                            outerRadius={45}
                            label={({ percentage }) => `${percentage}%`}
                            labelLine={false}
                          >
                            {portfolio.allocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legenda */}
                    <div className="space-y-1">
                      {portfolio.allocation.map((item) => (
                        <div key={item.asset} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate">{item.asset}</span>
                          </div>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-green-600">
                          {formatPercentage(portfolio.expectedReturn)}
                        </div>
                        <div className="text-xs text-gray-500">Retorno/ano</div>
                      </div>
                      <div className="text-center">
                        <Badge className={riskLevel.color} variant="secondary">
                          {riskLevel.label}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">Risco</div>
                      </div>
                    </div>

                    {/* Investimento mínimo */}
                    <div className="text-center text-xs text-gray-500 border-t pt-2">
                      Mín: {formatCurrency(portfolio.minInvestment)}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Dicas */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Lightbulb className="h-5 w-5" />
                <span>Dicas de Investimento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <p className="text-sm">
                  <strong>Diversificação:</strong> Distribua seus investimentos entre diferentes ativos para reduzir riscos.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <p className="text-sm">
                  <strong>Prazo:</strong> Investimentos de longo prazo tendem a ter melhor performance e menor volatilidade.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <p className="text-sm">
                  <strong>Consistência:</strong> Aportes regulares aproveitam o poder dos juros compostos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {scenarios.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <GitCompare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum cenário salvo
                </h3>
                <p className="text-gray-600 mb-6">
                  Configure diferentes cenários no simulador e salve para comparar os resultados.
                </p>
                <Button onClick={() => setActiveTab('simulator')}>
                  Criar Primeiro Cenário
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Comparação de Cenários</h3>
                  <p className="text-gray-600">Compare diferentes estratégias lado a lado</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setScenarios([])}
                  size="sm"
                >
                  Limpar Todos
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {scenarios.map((scenario, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Inicial:</span>
                          <div className="font-semibold">{formatCurrency(scenario.initialAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Mensal:</span>
                          <div className="font-semibold">{formatCurrency(scenario.monthlyContribution)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Período:</span>
                          <div className="font-semibold">{scenario.timeHorizon} anos</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Retorno:</span>
                          <div className="font-semibold">{formatPercentage(scenario.expectedReturn)}</div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(scenario.finalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">Total Final</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">
                              {formatCurrency(scenario.totalInvested)}
                            </div>
                            <div className="text-gray-500">Investido</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">
                              {formatCurrency(scenario.totalReturn)}
                            </div>
                            <div className="text-gray-500">Rendimento</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}