import { IApikey } from '@/types/apikey'
import { IPlan } from '@/types/plan.types'
import { ILogin, ILoginResponse } from '@/types/user.types'
import { IWhatsAppSession, IWhatsAppQRCode, IWhatsAppMessage } from '@/types/whatsapp.types'
import { IWebhook, ICreateWebhook, IUpdateWebhook, IEvent } from '@/types/webhook.types'
import axios, { AxiosInstance } from 'axios'
import { signOut } from 'next-auth/react'


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

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            await signOut({ callbackUrl: '/login' })
          }
        }
        return Promise.reject(error)
      }
    )
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
      .then(({ data }) => data)

  }

  async getApiKeys(accessToken: string): Promise<IApikey[]> {
    return this.client.get<IApikey[]>('/api-keys', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(({ data }) => data)
  }

  async createApiKey(accessToken: string, input: { name: string; status: "ACTIVE" | "REVOKED" }) {
    return this.client.post('/api-keys', input, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(({ data }) => data)
  }

  async createPayment(accessToken: string, planId: number): Promise<{
    checkoutUrl: string;
    paymentId: number;
    preferenceId: string;
  }> {
    return this.client.post('/payments/create', { planId }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }

  async getPaymentStatus(accessToken: string, paymentId: string): Promise<{
    status: string;
    payment: any;
  }> {
    return this.client.get(`/payments/status/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }

  async getUserSubscription(accessToken: string): Promise<any> {
    return this.client.get('/subscriptions/current', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }

  async createWhatsAppSession(apiKey: string): Promise<IWhatsAppSession> {
    return this.client.post<IWhatsAppSession>('/whatsapp/session', {}, {
      headers: { 'x-api-key': apiKey }
    }).then(({ data }) => data);
  }

  async getWhatsAppQRCode(apiKey: string): Promise<IWhatsAppQRCode> {
    return this.client.get<IWhatsAppQRCode>('/whatsapp/qrcode', {
      headers: { 'x-api-key': apiKey }
    }).then(({ data }) => data);
  }

  async sendWhatsAppMessage(apiKey: string, message: IWhatsAppMessage): Promise<{ message: string }> {
    return this.client.post<{ message: string }>('/whatsapp', message, {
      headers: { 'x-api-key': apiKey }
    }).then(({ data }) => data);
  }

  async getWhatsAppStatus(apiKey: string): Promise<{ status: string }> {
    return this.client.get<{ status: string }>('/whatsapp/status', {
      headers: { 'x-api-key': apiKey }
    }).then(({ data }) => data);
  }

  async logoutWhatsApp(apiKey: string): Promise<void> {
    return this.client.delete('/whatsapp/session', {
      headers: { 'x-api-key': apiKey }
    }).then(() => undefined);
  }

  // Webhook methods
  async getWebhook(accessToken: string): Promise<IWebhook | null> {
    return this.client.get<IWebhook>('/webhooks', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }

  async createWebhook(accessToken: string, webhook: ICreateWebhook): Promise<IWebhook> {
    return this.client.post<IWebhook>('/webhooks', webhook, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }

  async updateWebhook(accessToken: string, id: number, webhook: IUpdateWebhook): Promise<IWebhook> {
    return this.client.patch<IWebhook>(`/webhooks/${id}`, webhook, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }

  async deleteWebhook(accessToken: string, id: number): Promise<void> {
    return this.client.delete(`/webhooks/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(() => undefined);
  }

  async getWebhookEvents(accessToken: string): Promise<IEvent[]> {
    return this.client.get<IEvent[]>('/webhooks/events', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }

  async sendDashboardMessage(to: string, message: string): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/dashboard/send-message', { to, message })
      .then(({ data }) => data);
  }

  async getDashboardOverview(accessToken: string): Promise<any> {
    return this.client.get('/dashboard/overview', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(({ data }) => data);
  }
}

export const api = ApiClient.getInstance()