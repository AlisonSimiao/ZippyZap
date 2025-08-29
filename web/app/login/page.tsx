"use client"

import { signIn } from "next-auth/react"
import { redirect } from "next/navigation"
import Logo from "../../components/logo"
import {
  Container,
  Card,
  Header,
  Title,
  Form,
  InputGroup,
  Label,
  Input,
  Button,
  Footer,
  StyledLink
} from "./styles"
import toast from "react-hot-toast"



export default function LoginPage() {

  async function loginAction(formData: FormData): Promise<void> {
  
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    })
    
    if(result?.error) {
       toast.error(result.error, {
        style: {backgroundColor: "#eecf1d"},
        position: "top-right"
      })
      return
    }
    if (result?.ok) {
      toast.success("Login realizado com sucesso!", {
        position: "top-right"
      })
      toast("Bem-vindo de volta!", {
        icon: "👋",
        style: {backgroundColor: "#eecf1d"},
        position: "top-right"
      })
      redirect("/dashboard")
    }
  }
  return (
    <Container>
      <Card>
        <Header>
          <Logo />
          <Title>Fazer Login</Title>
        </Header>
        
        <Form action={loginAction}>
          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Sua senha"
              required
            />
          </InputGroup>
          
          <Button type="submit">
            Entrar
          </Button>
        </Form>
        
        <Footer>
          <StyledLink href="/signup">
            Não tem uma conta? Criar conta
          </StyledLink>
          <StyledLink href="/">
            Voltar ao início
          </StyledLink>
        </Footer>
      </Card>
    </Container>
  )
}