import jwt from 'jsonwebtoken'
import { userModel } from 'model/admin'
import { ServerError } from 'model/common/error'
require('dotenv').config()

export const secretKeyAdmin = process.env.JWT_SECRET_ADMIN
export const secretKeyUser = process.env.JWT_SECRET_USER
// Public
export const createAccessToken = async (data: userModel) => {
    return data.id ? await createToken('access', data) : null
}

export const createRefreshToken = async (data: userModel) => {
    return data.id ? await createToken('refresh', data) : null
}

// Private
const createToken = async (type: 'refresh' | 'access', data: userModel) => {
    try {
        const payLoad = {
            idx: data.id,
            type: data.type,
            token_type: type,
        }
        const options: jwt.SignOptions = {
            algorithm: 'HS256', // 해싱 알고리즘
            expiresIn: type === 'refresh' ? '12h' : '10m', // 토큰 유효 기간
            issuer: 'fig', // 발행자
        }

        return jwt.sign(payLoad, secretKeyAdmin, options)
    } catch (error) {
        throw new ServerError(`Error[lib/jwt/createToken] : ${error}`)
    }
}

export const createUserToken = async (type: 'refresh' | 'access', id: number) => {
    return id ? await generateUserToken(type, id) : null
}

// Private
const generateUserToken = async (type: 'refresh' | 'access', id: number) => {
    try {
        const payLoad = {
            idx: id,
            token_type: type,
        }
        const options: jwt.SignOptions = {
            algorithm: 'HS256', // 해싱 알고리즘
            expiresIn: type === 'refresh' ? '12h' : '12h', // 토큰 유효 기간
            issuer: 'fig', // 발행자
        }

        return jwt.sign(payLoad, secretKeyUser, options)
    } catch (error) {
        throw new ServerError(`Error[lib/jwt/generateUserToken] : ${error}`)
    }
}
