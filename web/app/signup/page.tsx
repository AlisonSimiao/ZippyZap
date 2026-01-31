"use client"
import Logo from "../../components/logo"
import { api } from "@/lib/api"
import {
  Container,
  Card,
  Header,
  Title,
  Content,
  Form,
  Field,
  Label,
  Input,
  Button,
  Links,
  StyledLink,
  ErrorField
} from "./styles"
import toast from "react-hot-toast"
import { AxiosError } from "axios"
import { useActionState, useState, useEffect } from "react"
import {  MessageSquareWarningIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, { errors: {} })
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', password: '' })
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  
  async function registerAction(prevState: any, formData: FormData) {
    try {
      const email = formData.get("email") as string
      const whatsapp = formData.get("whatsapp") as string
      const password = formData.get("password") as string
      const name = formData.get("name") as string
      
      setFormData({ name, email, whatsapp, password })

      const response = await api.signup({email, whatsapp, password, name})

      // Salvar token JWT para auto-login
      if (response.data?.token) {
        localStorage.setItem("accessToken", response.data.token)
      }

      toast.success("Conta criada com sucesso! Redirecionando...", {
        position: "top-right"
      })
      
      // Aguardar um pouco antes de redirecionar
      setIsRedirecting(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
      
      return { errors: {} }
    } catch (error) {
      if(error instanceof AxiosError){
        if(error.response?.status === 409){
          const rel = error.response.data.message.includes('Email') ? 'email' : 'whatsapp'
          toast.error(error.response.data.message, {
            position: "top-right"
          })
          return { errors: { [rel]: error.response.data.message } }
        }

        if(error.response?.status === 422){
          const errors: Record<string, string> = {}
          Object.keys(error.response?.data || {}).forEach((key) => {
            const message = error?.response?.data[key][0]
            if(message){ 
              toast.error(message, {
                style: {backgroundColor: "#eecf1d"},
                icon: <MessageSquareWarningIcon />,
                position: "top-right"
              })
              errors[key] = message
            }
          })
          return { errors }
        }
      }

      toast.error('Erro ao conectar ao servidor', {
        position: "top-right"
      })
      return { errors: {} }
    }
  }

  // Desabilitar navegação para trás enquanto redirecionando
  useEffect(() => {
    if (isRedirecting) {
      const preventBack = () => window.history.forward()
      window.addEventListener('popstate', preventBack)
      return () => window.removeEventListener('popstate', preventBack)
    }
  }, [isRedirecting])

  return (
    <Container>
      <Card>
        <Header>
          <Logo />
          <Title>Criar Conta</Title>
        </Header>
        <Content>
          <Form action={action}>
            <Field>
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
              />
              <ErrorField>{state.errors.name}</ErrorField>
            </Field>
            <Field>
              <Label htmlFor="email">Endereço de email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
              />
              <ErrorField>{state.errors.email}</ErrorField>
            </Field>
            <Field>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+55 11 99999-9999"
              />
              <ErrorField>{state.errors.whatsapp}</ErrorField>
            </Field>
            <Field>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
              <ErrorField>{state.errors.password}</ErrorField>
            </Field>
            <Button type="submit" disabled={isPending || isRedirecting}>
              {isPending ? "Criando..." : isRedirecting ? "Redirecionando..." : "Criar Conta"}
            </Button>
          </Form>
          
          <Links>
            <StyledLink href="/login">
              Já tem uma conta? Fazer login
            </StyledLink>
            <StyledLink href="/">
              Voltar ao início
            </StyledLink>
          </Links>
        </Content>
      </Card>
    </Container>
  )
}