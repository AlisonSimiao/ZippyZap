import styled from "styled-components"
import Link from "next/link"

export const Container = styled.div`
  min-height: 100vh;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

export const Card = styled.div`
  width: 100%;
  max-width: 28rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`

export const Header = styled.div`
  text-align: center;
  padding: 1.5rem 1.5rem 0;
`

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333333;
  margin-top: 1rem;
`

export const Content = styled.div`
  padding: 1.5rem;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: .3rem;
`

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
`

export const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #FFD700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
  }
`

export const Button = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #FFD700;
  color: black;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 215, 0, 0.9);
  }
`
export const ErrorField = styled.span`
  color: rgba(224, 3, 3, 0.733);
  font-size: 0.75rem;
  font-weight: 900;
  height: 1rem;
`
export const Links = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const StyledLink = styled(Link)`
  font-size: 0.875rem;
  color: rgba(51, 51, 51, 0.7);
  text-decoration: none;
  
  &:hover {
    color: #333333;
  }
`