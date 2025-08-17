export interface IPlan {
    id: number,
    name: string,
    dailyLimit:number,
    monthlyLimit:number,
    price: number,
    features: string[],
    isActive: boolean,
    createdAt:string,
    updatedAt:string
}