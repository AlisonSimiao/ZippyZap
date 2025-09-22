import { IApikey } from '@/types/apikey'
import { IPlan } from '@/types/plan.types'
import { ILogin, ILoginResponse } from '@/types/user.types'
import axios, { AxiosInstance } from 'axios'

class ApiClient {
  private static instance: ApiClient
  private client: AxiosInstance

  private constructor() {
    if (!process.env.NEXT_PUBLIC_API_HOST)
      throw new Error('NEXT_PUBLIC_API_HOST is not defined')
    
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_HOST,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
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

  async signup(body: { email: string; whatsapp: string; password: string; name: string }) {
    return this.client.post('auth/signup', body)
  }

  async updateUser(accessToken: string, body: { email: string; whatsapp: string; name: string, webhookUrl: string, retentionDays: number }) {
    return this.client.patch('/users', body, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  }

  async login({ email, password }: ILogin): Promise<ILoginResponse> {
   return this.client.post<ILoginResponse>('auth/signin', { email, password })
    .then(({data}) => data)

  }

  async getApiKeys(accessToken: string): Promise<IApikey[]> {
    return this.client.get<IApikey[]>('/api-keys', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(({data}) => data)
  }

  async createApiKey(accessToken: string, input: { name: string; status: "ACTIVE" | "REVOKED" }) {
    return this.client.post('/api-keys', input, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(({data}) => data)
  }
}

export const api = ApiClient.getInstance()