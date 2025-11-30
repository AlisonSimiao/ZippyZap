export interface IWebhook {
    id: number;
    userId: number;
    url: string;
    name?: string;
    webhookEvents: {
        id: number;
        active: boolean;
        event: IEvent;
    }[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateWebhook {
    url: string;
    name?: string;
    events?: string[];
    isActive?: boolean;
}

export interface IUpdateWebhook {
    url?: string;
    name?: string;
    events?: string[];
    isActive?: boolean;
}

export interface IEvent {
    id: number;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}
