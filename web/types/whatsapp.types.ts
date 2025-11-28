export interface IWhatsAppSession {
    success: boolean
    sessionId: string
    status: string
    message: string
}

export interface IWhatsAppQRCode {
    status: string
    qr: string
}

export interface IWhatsAppMessage {
    to: string
    type: 'text'
    message: string
}

export type WhatsAppStatus = 'disconnected' | 'initializing' | 'qr_received' | 'connected' | 'error'
