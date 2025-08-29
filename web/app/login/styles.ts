import styled from "styled-components"
import Link from "next/link"

export const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

export const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
`

export const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333333;
  margin-top: 1rem;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const InputGroup = styled.div`
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
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`

export const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #ffd700;
  color: black;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 215, 0, 0.9);
  }
`

export const Footer = styled.div`
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