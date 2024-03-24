import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { secretKeyAdmin, secretKeyUser } from 'lib/jwt'
import { UnauthorizedError } from 'model/common/error'

/**
 * @author Dean
 * @use O
 * @explain 로그인 type에 따라 및 리턴 값 변경
 * 중복된 호출 제거
 */
// type = 0 둘다, type = 1 fig, type = 2 우청, type 없으며 유저
export const twoWayCrossFnByLoginChecker = (req: Request, res: Response, next: NextFunction, type?: number) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        throw new UnauthorizedError('로그인이 필요합니다.')
    }

    const token = authorization.split('Bearer ')[1]

    try {
        const data: string | jwt.JwtPayload = jwt.verify(token, type === 0 || type === 1 || type === 2 ? secretKeyAdmin : secretKeyUser)
        if (data['idx']) {
            req.query.userId = data['idx']
            req.body.userId = data['idx']
        }

        if (!data['token_type'] || data['token_type'] !== 'access') throw new UnauthorizedError('Invalid token')

        if (type && data['type'] !== type) {
            throw new UnauthorizedError('권한이 없습니다.')
        }

        next()
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw new UnauthorizedError(error.message)
        } else if (error.message === 'jwt expired') {
            throw new jwt.JsonWebTokenError('jwt expired')
        } else {
            throw new jwt.JsonWebTokenError('Invalid token')
        }
    }
}
