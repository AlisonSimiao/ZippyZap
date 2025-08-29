"use client"
import Link from "next/link"
import styled from "styled-components"

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 1rem;
`

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
  max-width: 500px;
`

const Title = styled.h1`
  font-size: 4rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 1rem;
`

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #333333;
  margin-bottom: 1rem;
`

const Description = styled.p`
  color: rgba(51, 51, 51, 0.7);
  margin-bottom: 2rem;
`

const Button = styled(Link)`
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #ffd700;
  color: black;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 215, 0, 0.9);
  }
`

export default function NotFound() {
  return (
    <Container>
      <Card>
        <Title>404</Title>
        <Subtitle>Página não encontrada</Subtitle>
        <Description>
          A página que você está procurando não existe ou foi movida.
        </Description>
        <Button href="/dashboard">
          Voltar ao início
        </Button>
      </Card>
    </Container>
  )
}