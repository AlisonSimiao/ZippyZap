export interface IApikey {
    id: number;
    hash: string;
    status: 'ACTIVE' | 'REVOKE';
    name: string;
    createdAt: string;
}