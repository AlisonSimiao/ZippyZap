"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Loader2, CheckCircle, ShieldCheck, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PaymentPendingPage() {
    const router = useRouter()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Simular verificação de status
        const timer = setTimeout(() => {
            setChecking(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    if (checking) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-serif font-black tracking-tight mb-2">Verificando Status</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30 animate-pulse">
                    Consultando gateways de pagamento
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />

            <div className="w-full max-w-lg relative z-10">
                <Card className="bg-white/[0.02] border-amber-500/20 shadow-2xl shadow-amber-500/5 overflow-hidden backdrop-blur-xl rounded-[2.5rem]">
                    <CardHeader className="text-center pt-12 pb-8">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-amber-500 animate-pulse opacity-10 rounded-full scale-125"></div>
                            <div className="relative w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-500">
                                <Clock className="w-12 h-12 text-amber-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                                Processamento em Curso
                            </div>
                            <CardTitle className="text-4xl font-serif font-black tracking-tight text-foreground">
                                Quase lá!
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-foreground/40">
                                Estamos aguardando o sinal final do seu pagamento.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-10 pb-8 space-y-8">
                        <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-3xl p-8 space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-500/80">O que significa?</p>
                            <p className="text-xs font-semibold text-foreground/50 leading-relaxed">
                                Alguns métodos como PIX (em análise) ou Boleto podem levar alguns minutos ou horas para confirmar. 
                                Assim que o banco nos avisar, sua conta será ativada instantaneamente.
                            </p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-tight">Ativação Automática</p>
                                    <p className="text-[10px] text-foreground/30 font-medium">Você será notificado por e-mail assim que liberar.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-tight">Acesso ao Dashboard</p>
                                    <p className="text-[10px] text-foreground/30 font-medium">Você já pode customizar seu perfil enquanto aguarda.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link href="/dashboard" className="block">
                                <Button className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all group">
                                    Ir para o Dashboard
                                    <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="bg-white/[0.01] border-t border-white/5 p-8 flex flex-col items-center gap-4">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                            <Mail className="w-3.5 h-3.5" />
                            Dúvidas sobre o tempo de espera?
                        </div>
                        <a href="mailto:suporte@zippyzap.online" className="text-[10px] font-black text-primary hover:text-primary/70 transition-colors uppercase tracking-[0.1em]">
                            Falar com Financeiro
                        </a>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
