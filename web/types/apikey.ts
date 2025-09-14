export interface IApikey {
    id: number;
    status: 'ACTIVE' | 'REVOKE';
    name: string;
    createdAt: string;
}