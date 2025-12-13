"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentPendingPage() {
    const router = useRouter()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Simular verificação de status
        const timer = setTimeout(() => {
            setChecking(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (checking) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="w-16 h-16 animate-spin text-[#FFD700] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[#333333] mb-2">
                            Verificando pagamento...
                        </h3>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-yellow-200">
                <CardHeader className="text-center pb-6">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-12 h-12 text-yellow-600" />
                    </div>
                    <CardTitle className="text-3xl text-[#333333] mb-2">
                        Pagamento Pendente
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Aguardando confirmação do pagamento
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 mb-3">
                            <strong>Seu pagamento está sendo processado.</strong>
                        </p>
                        <p className="text-sm text-yellow-800">
                            Isso pode acontecer quando você escolhe métodos de pagamento como:
                        </p>
                        <ul className="text-sm text-yellow-800 mt-2 ml-4 list-disc space-y-1">
                            <li>Boleto bancário</li>
                            <li>PIX (aguardando confirmação)</li>
                            <li>Transferência bancária</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-blue-800">
                            <strong>Próximos passos:</strong>
                        </p>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <span className="text-sm text-blue-800">
                                Complete o pagamento seguindo as instruções recebidas
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <span className="text-sm text-blue-800">
                                Você receberá um email assim que o pagamento for confirmado
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <span className="text-sm text-blue-800">
                                Sua assinatura será ativada automaticamente
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link href="/dashboard">
                            <Button className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                                Ir para Dashboard
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Voltar para Início
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-[#333333]/70 mb-2">Dúvidas sobre seu pagamento?</p>
                        <a href="mailto:suporte@zippyzap.online" className="text-sm text-[#0066FF] hover:underline">
                            Entre em contato com o suporte
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
