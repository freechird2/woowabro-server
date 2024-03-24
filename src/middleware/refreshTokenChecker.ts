import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'

import { secretKeyAdmin, secretKeyUser } from 'lib/jwt'
import { UnauthorizedError } from 'model/common/error'

export const refreshChecker = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split('Bearer ')[1]
        const isUser = req.baseUrl.split('/').findIndex((f) => f === 'user') !== -1 ? true : false

        try {
            const data: string | jwt.JwtPayload = jwt.verify(token, isUser ? secretKeyUser : secretKeyAdmin)
            const userId = data['idx']
            const tokenType = data['token_type']

            if (tokenType !== 'refresh') {
                throw new jwt.JsonWebTokenError('invalid token')
            }

            req.body.userId = userId
            req.body.tokenType = tokenType
            next()
        } catch (error) {
            if (error instanceof UnauthorizedError) throw new UnauthorizedError(error.message)
            else throw new jwt.JsonWebTokenError(error.message === 'jwt expired' ? 'jwt expired' : 'invalid token')
        }
    } else {
        throw new UnauthorizedError('로그인이 필요합니다.')
    }
}
