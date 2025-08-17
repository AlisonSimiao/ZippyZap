import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Aqui você faria a chamada para sua API backend
    // const response = await fetch('http://localhost:3001/plans')
    // const plans = await response.json()
    
    // Por enquanto, retornando dados mock baseados no schema Prisma
    const plans = [
      {
        id: 1,
        name: "Básico",
        dailyLimit: "1000",
        monthlyLimit: "30000", 
        price: "29.00",
        features: [
          "Perfeito para pequenos projetos e testes",
          "Webhooks básicos",
          "Suporte por email",
          "SSL gratuito"
        ],
        isActive: true
      },
      {
        id: 2,
        name: "Pro",
        dailyLimit: "10000",
        monthlyLimit: "300000",
        price: "99.00", 
        features: [
          "Ideal para empresas em crescimento",
          "Webhooks avançados",
          "Suporte prioritário",
          "Analytics detalhado",
          "SSL gratuito"
        ],
        isActive: true
      },
      {
        id: 3,
        name: "Enterprise", 
        dailyLimit: "100000",
        monthlyLimit: "3000000",
        price: "299.00",
        features: [
          "Para grandes volumes e necessidades customizadas",
          "Webhooks customizados",
          "Suporte 24/7",
          "SLA garantido", 
          "Gerente dedicado",
          "SSL gratuito"
        ],
        isActive: true
      }
    ]

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json(
      { error: 'Falha ao carregar planos' },
      { status: 500 }
    )
  }
}