export interface IApikey {
    id: number;
    hash: string;
    status: 'ACTIVE' | 'REVOKED';
    name: string;
    createdAt: string;
}