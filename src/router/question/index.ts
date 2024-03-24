import { Router } from 'express'
import { usedMiddlewareByLogin } from 'function/shared'
import { questionMigration } from 'sql/common/question.migration'
import { getQuestionDetail, getQuestionList } from 'sql/question'

const questionRouter = Router()

/**
 * @description 질문 마이그레이션
 * @route POST /question
 */
questionRouter.post('/migration', usedMiddlewareByLogin(0), async (req, res) => {
    await questionMigration()
    return res.json({ code: 200, message: 'migration complete.', data: null })
})

questionRouter.get('/', usedMiddlewareByLogin(0), async (req, res) => {
    const list = await getQuestionList()
    return res.json({ code: 200, message: '질문 목록을 불러왔습니다.', data: list })
})

questionRouter.get('/:id', usedMiddlewareByLogin(0), async (req, res) => {
    const id: number = Number(req.params.id)
    const [result] = await getQuestionDetail(id)
    return res.json({ code: 200, message: '질문을 불러왔습니다.', data: result })
})

export default questionRouter
