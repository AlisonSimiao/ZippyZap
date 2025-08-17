"use client"

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { IPlan } from '@/types/plan.types'

export function usePlans() {
  const [plans, setPlans] = useState<IPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await api.getPlans()
        setPlans(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  return { plans, loading, error }
}