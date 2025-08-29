export interface IUser {
  email  : string
  whatsapp : string
  password : string
  name : string
  isActive: Boolean 
  webhookUrl: string
  retentionDays:  number
}

export interface ILoginResponse {
  token: string
  user: IUser
}

export interface ILogin {
  email: string
  password: string
}