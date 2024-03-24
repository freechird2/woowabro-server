export interface LoginHeaderModel {
    userId: number
}

export interface LoginDataModel {
    userId: number
    loginId: string
    type: 0 | 1 | 2
    name: string
    password: string
}
