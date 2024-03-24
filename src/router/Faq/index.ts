import { Request, Response, Router } from 'express'
import { usedMiddlewareByLogin } from 'function/shared'
import { CommonFilter } from 'model/admin/common.interface'
import { FaqModel } from 'model/faq'
import { createFaq, deleteFaq, getFaqDetail, getFaqList, updateFaq } from 'sql/faq'
import { commonFilterValidation, commonIdValidation } from 'validation/commonFilter.validation'
import { faqDataValidaion } from 'validation/faq.validation'

const faqRouter = Router()

/**
 * @description faq 리스트
 * @route GET /faq
 */
faqRouter.get('/', usedMiddlewareByLogin(1), async (req, res) => {
    const filter: CommonFilter = req.query
    // Validation
    await commonFilterValidation.validateAsync(filter)
    const result = await getFaqList(filter)

    return res.json({
        code: 200,
        message: '자주 묻는 질문(FAQ) 리스트를 불러왔습니다.',
        data: {
            isLast: filter.page * filter.per >= result.total,
            totalCount: result.total,
            list: result.list,
        },
    })
})

/**
 * @description faq 상세
 * @route GET /faq/:id
 */
faqRouter.get('/:id', usedMiddlewareByLogin(1), async (req: Request, res: Response) => {
    const id: number = Number(req.params.id)
    await commonIdValidation.validateAsync(id)
    const [result] = await getFaqDetail(id)

    return res.json({ code: 200, message: '자주 묻는 질문(FAQ)을 불러왔습니다.', data: result })
})

/**
 * @description faq 수정
 * @route PUT /faq/:id
 */
faqRouter.put('/', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const data: FaqModel = { ...req.body }

    // const file = req.file
    await faqDataValidaion.tailor('update').validateAsync(data)
    await updateFaq(
        data
        // , file
    )
    return res.json({ code: 200, message: '질문을 수정했습니다.', data: null })
})

/**
 * @description faq 생성
 * @route POST /faq
 */
faqRouter.post(
    '/',
    usedMiddlewareByLogin(0),
    // upload.single('file'),

    async (req: Request, res: Response) => {
        const data: FaqModel = req.body
        // const file = req.file
        await faqDataValidaion.validateAsync(data)

        const result = await createFaq(
            data
            // file
        )
        return res.json({ code: 200, message: '질문을 생성했습니다.', data: { id: result } })
    }
)

/**
 * @description faq 삭제
 * @route DELETE /faq/:id
 */
faqRouter.delete('/', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const id = Number(req.body.id)
    await commonIdValidation.validateAsync(id)
    await deleteFaq(id)
    return res.json({ code: 200, message: '질문을 삭제했습니다.', data: null })
})

export default faqRouter
