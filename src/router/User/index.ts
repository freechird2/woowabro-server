import { Request, Response, Router } from 'express'
import { usedMiddlewareByLogin } from 'function/shared'
import Joi from 'joi'
import { createUserToken } from 'lib/jwt'
import { refreshChecker } from 'middleware/refreshTokenChecker'
import { BadRequestError } from 'model/common/error'
import { TestDataModel, UserLoginModel } from 'model/user'
import { getQuestionList } from 'sql/question'
import { getCoupon, getFaq, getUserById, reportTest, selfCheckin, useCoupon, userLogin } from 'sql/user'

import { userLoginRequestValidation } from 'validation/userValidation/auth'

const userRouter = Router()

userRouter.post('/login', async (req: Request, res: Response) => {
    const data: UserLoginModel = req.body

    try {
        await userLoginRequestValidation.validateAsync(data)
    } catch (error) {
        throw new BadRequestError(error.message)
    }

    const user = await userLogin(data)

    const returnData = {
        id: user.id,
        status: user.status,
        name: user.name,
        phone: user.phone,
        className: user.className,
        coupon: user.couponCnt,
        projectStatus: user.projectStatus,
        seat: user.seat,
        testAt: user.testAt,
        checkinAt: user.checkinAt,
        access: await createUserToken('access', user.id),
        refresh: await createUserToken('refresh', user.id),
    }

    return res.json({
        code: 200,
        message: 'login success',
        data: returnData,
    })
})

userRouter.post('/ping', usedMiddlewareByLogin(), async (req: Request, res: Response) => {
    const userId = req.body.userId
    try {
        await Joi.number().min(0).required().validateAsync(userId)
    } catch (error) {
        throw new BadRequestError('사용자 정보가 없습니다.')
    }

    const user = await getUserById(userId)

    const returnData = {
        id: user.id,
        status: user.status,
        name: user.name,
        phone: user.phone,
        className: user.className,
        coupon: user.couponCnt,
        projectStatus: user.projectStatus,
        seat: user.seat,
        testAt: user.testAt,
        checkinAt: user.checkinAt,
    }

    return res.json({
        code: 200,
        message: 'ping success',
        data: returnData,
    })
})

userRouter.post('/refresh', refreshChecker, async (req: Request, res: Response) => {
    const userId = req.body.userId

    try {
        await Joi.number().min(0).required().validateAsync(userId)
    } catch (error) {
        throw new BadRequestError('사용자 정보가 없습니다.')
    }

    const returnData = {
        access: await createUserToken('access', userId),
        refresh: await createUserToken('refresh', userId),
    }
    res.json({ code: 200, message: 'refresh success', data: returnData })
})

userRouter.get('/question', usedMiddlewareByLogin(), async (req: Request, res: Response) => {
    const result = await getQuestionList()

    return res.json({
        code: 200,
        message: '질문을 불러왔습니다.',
        data: result,
    })
})

userRouter.post('/question', usedMiddlewareByLogin(), async (req: Request, res: Response) => {
    const data: TestDataModel = { ...req.body }

    try {
        await Joi.array().items(Joi.number()).required().validateAsync(data.testResult)
        if (data.testResult.length !== 9) throw new Error()
    } catch (error) {
        throw new BadRequestError('사전 테스트 정보를 확인해주세요.')
    }

    const score = [0, 0, 0, 0, 0]

    data.testResult.map((t) => {
        if (data.testResult[0] === t) score[t] += 1.1
        else score[t]++
    })

    const max = Math.max(...score)
    const maxIndex = score.indexOf(max)
    data.classIndex = maxIndex

    await reportTest(data)

    return res.json({
        code: 200,
        message: '질문 제출이 완료되었습니다.',
        data: null,
    })
})

userRouter.put('/check-in', usedMiddlewareByLogin(), async (req: Request, res: Response) => {
    const userId = req.body.userId

    try {
        await Joi.number().min(0).required().validateAsync(userId)
    } catch (error) {
        throw new BadRequestError('사용자 정보가 없습니다.')
    }

    await selfCheckin(userId)

    return res.json({
        code: 200,
        message: '셀프 체크인을 완료했습니다.',
        data: null,
    })
})

userRouter.get('/coupon', usedMiddlewareByLogin(), async (req: Request, res: Response) => {
    const userId = req.body.userId

    try {
        await Joi.number().min(0).required().validateAsync(userId)
    } catch (error) {
        throw new BadRequestError('사용자 정보가 없습니다.')
    }

    const list = await getCoupon(userId)

    return res.json({
        code: 200,
        message: '쿠폰을 목록을 불러왔습니다.',
        data: list,
    })
})

userRouter.put('/coupon', usedMiddlewareByLogin(), async (req: Request, res: Response) => {
    const data = { ...req.body, userId: req.body.userId }

    try {
        await Joi.number().min(0).required().validateAsync(data.id)
    } catch (error) {
        throw new BadRequestError('쿠폰 정보가 없습니다.')
    }

    await useCoupon(data)

    return res.json({
        code: 200,
        message: '쿠폰을 사용했습니다.',
        data: null,
    })
})

userRouter.get('/faq', usedMiddlewareByLogin(), async (req: Request, res: Response) => {
    const list = await getFaq()

    return res.json({
        code: 200,
        message: 'FAQ 목록을 불러왔습니다.',
        data: list,
    })
})

export default userRouter
