import { Request, Response, Router } from 'express'
import { usedMiddlewareByLogin } from 'function/shared'
import Joi from 'joi'
import { BadRequestError } from 'model/common/error'
import { ParticipantFilterModel } from 'model/participant'
import { changeProcess, getCurrentProcess, makeCoupon, testReset } from 'sql/common/common.sql'
import { getExcel, getTestResultExcel } from 'sql/common/excel'

const adminRouter = Router()

adminRouter.post('/make-coupon', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    await makeCoupon()

    return res.json({
        code: 200,
        message: '쿠폰 발급 완료.',
        data: null,
    })
})

adminRouter.get('/excel', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const filter: ParticipantFilterModel = req.query

    const list = await getExcel(filter)

    return res.json({
        code: 200,
        message: '엑셀 다운로드 완료.',
        data: list,
    })
})

adminRouter.get('/test-excel', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const filter: ParticipantFilterModel = req.query

    const list = await getTestResultExcel(filter)

    return res.json({
        code: 200,
        message: '엑셀 다운로드 완료.',
        data: list,
    })
})

adminRouter.get('/process', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    return res.json({
        code: 200,
        message: 'get process',
        data: { status: await getCurrentProcess() },
    })
})

adminRouter.post('/process', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const process = req.body.process

    try {
        await Joi.string().valid('T', 'C', 'I').required().error(new Error('Invalid process status')).validateAsync(process)
    } catch (err) {
        throw new BadRequestError(err.message)
    }

    await changeProcess(process)

    return res.json({
        code: 200,
        message: 'change process',
        data: null,
    })
})

adminRouter.post('/reset', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    await testReset()

    return res.json({
        code: 200,
        message: 'reset complete',
        data: null,
    })
})

export default adminRouter
