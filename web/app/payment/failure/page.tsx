"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PaymentFailurePage() {
    const searchParams = useSearchParams()
    const planId = searchParams.get("planId")

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-red-200">
                <CardHeader className="text-center pb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <CardTitle className="text-3xl text-[#333333] mb-2">
                        Pagamento Não Aprovado
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Não foi possível processar seu pagamento
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            <strong>O que aconteceu?</strong> Seu pagamento foi recusado ou cancelado. Isso pode acontecer por diversos motivos, como:
                        </p>
                        <ul className="text-sm text-red-800 mt-2 ml-4 list-disc space-y-1">
                            <li>Saldo insuficiente</li>
                            <li>Dados do cartão incorretos</li>
                            <li>Cancelamento durante o processo</li>
                            <li>Limite de crédito excedido</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        {planId && (
                            <Link href={`/checkout?planId=${planId}`}>
                                <Button className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Tentar Novamente
                                </Button>
                            </Link>
                        )}
                        <Link href="/#pricing">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Escolher Outro Plano
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-[#333333]/70 mb-2">Precisa de ajuda?</p>
                        <a href="mailto:suporte@zippyzap.com" className="text-sm text-[#0066FF] hover:underline">
                            Entre em contato com o suporte
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
