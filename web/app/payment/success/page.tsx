"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"

function PaymentSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const paymentId = searchParams.get("payment_id")
    const externalReference = searchParams.get("external_reference")

    const [status, setStatus] = useState<string>("pending")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        let retryCount = 0
        const maxRetries = 10

        async function checkPaymentStatus() {
            try {
                const accessToken = localStorage.getItem("accessToken")

                if (!accessToken) {
                    router.push("/login")
                    return
                }

                if (!paymentId) {
                    setError("ID de pagamento não encontrado")
                    setLoading(false)
                    return
                }

                // Fazer polling do status do pagamento com retry logic
                const checkStatus = async () => {
                    try {
                        const data = await api.getPaymentStatus(accessToken, paymentId)
                        
                        if (data?.status) {
                            setStatus(data.status)
                            setLoading(false)
                            clearInterval(interval)
                        } else if (retryCount < maxRetries) {
                            retryCount++
                        } else {
                            // Após 50 segundos sem resposta, mostrar erro
                            setError("Não foi possível confirmar o status do pagamento. Por favor, verifique seu email.")
                            setLoading(false)
                            clearInterval(interval)
                        }
                    } catch (err) {
                        console.error("Erro ao verificar status:", err)
                        if (retryCount >= maxRetries) {
                            setError("Erro ao verificar status do pagamento")
                            setLoading(false)
                            clearInterval(interval)
                        }
                        retryCount++
                    }
                }

                // Primeira verificação após 2 segundos
                setTimeout(checkStatus, 2000)

                // Polling a cada 5 segundos
                interval = setInterval(checkStatus, 5000)

            } catch (err) {
                setError("Erro ao verificar pagamento")
                setLoading(false)
            }
        }

        checkPaymentStatus()

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [paymentId, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="w-16 h-16 animate-spin text-[#FFD700] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[#333333] mb-2">
                            Verificando seu pagamento...
                        </h3>
                        <p className="text-[#333333]/70">
                            Aguarde enquanto confirmamos sua transação
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-200">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-600">Erro</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/#pricing">
                            <Button variant="outline" className="w-full">
                                Voltar para Planos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-[#25D366]">
                <CardHeader className="text-center pb-6">
                    <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-[#25D366]" />
                    </div>
                    <CardTitle className="text-3xl text-[#333333] mb-2">
                        Pagamento Aprovado!
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Sua assinatura foi ativada com sucesso
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-[#F5F5F5] rounded-lg p-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#25D366]" />
                            <span className="text-[#333333]">Pagamento confirmado</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#25D366]" />
                            <span className="text-[#333333]">Assinatura ativada</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#25D366]" />
                            <span className="text-[#333333]">API pronta para uso</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Próximos passos:</strong> Acesse seu dashboard para obter sua API key e começar a enviar mensagens.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link href="/dashboard">
                            <Button className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                                Ir para Dashboard
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button variant="outline" className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white">
                                Ver Documentação
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="w-16 h-16 animate-spin text-[#FFD700] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[#333333] mb-2">
                            Carregando...
                        </h3>
                    </CardContent>
                </Card>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
