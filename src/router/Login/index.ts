import { Request, Response, Router } from 'express'
import { createCryptoPassword } from 'function/shared'
import { createAccessToken, createRefreshToken } from 'lib/jwt'
import { userModel } from 'model/admin'
import { ServerError, UnauthorizedError } from 'model/common/error'
import { LoginDataModel } from 'model/login'
import { adminLogin } from 'sql/common/login'

require('dotenv').config()

const loginRouter = Router()

// 로그인
loginRouter.post('/', async (req: Request, res: Response) => {
    let loginData: LoginDataModel = req.body
    loginData.password = createCryptoPassword(loginData.password)
    let user: userModel = await adminLogin(loginData)

    if (!user) throw new UnauthorizedError('아이디 또는 비밀번호를 확인해주세요.')

    const accessToken = await createAccessToken(user)
    const refreshToken = await createRefreshToken(user)

    if (!accessToken || !refreshToken) throw new ServerError()

    const returnData = user
        ? {
              ...user,
              access: accessToken,
              refresh: refreshToken,
          }
        : null

    res.json({ code: 200, message: '로그인 성공', data: returnData })
})

export default loginRouter
