"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw, Loader2, ShieldAlert, Mail } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function PaymentFailureContent() {
    const searchParams = useSearchParams()
    const planId = searchParams.get("planId")

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />

            <div className="w-full max-w-lg relative z-10">
                <Card className="bg-white/[0.02] border-rose-500/20 shadow-2xl shadow-rose-500/5 overflow-hidden backdrop-blur-xl rounded-[2.5rem]">
                    <CardHeader className="text-center pt-12 pb-8">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-rose-500 animate-pulse opacity-10 rounded-full scale-150"></div>
                            <div className="relative w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-500">
                                <XCircle className="w-12 h-12 text-rose-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-4xl font-serif font-black tracking-tight text-foreground">
                                Pagamento Recusado
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-foreground/40">
                                Não foi possível completar sua transação neste momento.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-10 pb-8 space-y-8">
                        <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-3xl p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="h-4 w-4 text-rose-500/60" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/80">Motivos comuns:</p>
                            </div>
                            <ul className="text-xs font-semibold text-foreground/50 space-y-3">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-rose-500/40" />
                                    Saldo insuficiente ou limite excedido
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-rose-500/40" />
                                    Dados do cartão inseridos incorretamente
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-rose-500/40" />
                                    Transação negada pelo banco emissor
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            {planId && (
                                <Link href={`/checkout?planId=${planId}`} className="block">
                                    <Button className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all group">
                                        <RefreshCw className="w-4 h-4 mr-3 transition-transform group-hover:rotate-180 duration-500" />
                                        Tentar Novamente
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard/plans" className="block">
                                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 hover:text-foreground/40 hover:bg-white/5 h-12 rounded-2xl transition-all">
                                    <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                                    Escolher Outro Plano
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="bg-white/[0.01] border-t border-white/5 p-8 flex flex-col items-center gap-4">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                            <Mail className="w-3.5 h-3.5" />
                            Precisa de ajuda?
                        </div>
                        <a href="mailto:suporte@zippyzap.online" className="text-[10px] font-black text-primary hover:text-primary/70 transition-colors uppercase tracking-[0.1em]">
                            Contatar Suporte Técnico
                        </a>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                </div>
            </div>
        }>
            <PaymentFailureContent />
        </Suspense>
    )
}
