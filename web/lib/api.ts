import { IPlan } from '@/types/plan.types'
import axios, { AxiosInstance } from 'axios'

class ApiClient {
  private static instance: ApiClient
  private client: AxiosInstance

  private constructor() {
    if (!process.env.NEXT_PUBLIC_API_HOST)
      throw new Error('NEXT_PUBLIC_API_HOST is not defined')
    
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_HOST
    })
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  async getPlans(): Promise<IPlan[]> {
    const response = await this.client.get('/plans')
    return response.data
  }
}

export const api = ApiClient.getInstance()