export type LoginRequest = {
    username:string
    password:string
}

interface BaseEntity<ID> {
    id:ID,
    createdAt?:string
    updatedAt?:string
}

export interface User extends BaseEntity<string> {
    username:string
    active:boolean
}