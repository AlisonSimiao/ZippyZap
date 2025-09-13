export interface IUser {
  id: number
  email  : string
  whatsapp : string
  password : string
  name : string
  isActive: Boolean 
  webhookUrl: string
  retentionDays:  number
  createdAt: string
  planId: number
  updatedAt: string
}

export interface ILoginResponse {
  token: string
  user: IUser
}

export interface ILogin {
  email: string
  password: string
}