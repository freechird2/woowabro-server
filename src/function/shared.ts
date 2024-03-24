import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { twoWayCrossFnByLoginChecker } from 'middleware/loginChecker'

/**
 * @author Jei
 * @use O
 * @Param {any} db
 * @Param {string} sql
 * @Param {string} path
 * @explain sql 쿼리를 실행하는 함수
 * }
 */
export const sqlFetch = async (db: any, sql: string, path: string): Promise<any> => {
    try {
        const res = await db.query(sql).catch(() => {
            return false
        })

        return res && res.length > 0 ? (Array.isArray(res[0]) ? res[0][0] : res[0]) : null
    } catch (err) {
        console.log(`Error[sql/${path}] : ${err}`)
    }

    return null
}

/**
 * @author Jei
 * @use O
 * @Param {number} page
 * @Param {number} per
 * @explain page와 per 로 limit sql 만들어주는 함수
 * @example attachOffsetLimit(filter.page, filter.per)
 */
export const attachOffsetLimit = (page: number, per: number) => {
    if (!page || !per) return ''
    else {
        const offset = Number(page - 1) * Number(per)
        return ` LIMIT ${offset}, ${Number(per)}`
    }
}

/**
 * @author Jei
 * @use O
 * @Param {string} password
 * @explain 비밀번호 암호화 공통 함수
 * @example createCryptoPassword(loginData.password)
 */
export const createCryptoPassword = (password: string) => {
    return crypto.createHmac('sha256', process.env.CRYPTO_KEY).update(password).digest('hex')
}

/**
 * @author dean
 * @use O
 * @Param {Request} req
 * @Param {Response} res
 * @Param {NextFunction} next
 * @Param {number} type, 0: global 1 : FIG 2 : WOOCHUNG
 * @explain 가독성을 위한 고차함수 사용
 * 해당함수는 loginchecker middleware 만 사용하게 만듦
 * 인자 커스텀 가능
 */
export const usedMiddlewareByLogin = (type?: number) => {
    return (req: Request, res: Response, next: NextFunction) => twoWayCrossFnByLoginChecker(req, res, next, type)
}

/**
 * @author dean
 * @use X
 * @explain testing error handler
 */
export const asyncWrapper = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // new error 선언시 catch로 자동 전달
        fn(req, res, next).catch(next)
    }
}
