export interface IApikey {
    id: number;
    key: string;
    status: 'ACTIVE' | 'REVOKE';
    name: string;
    createdAt: string;
}