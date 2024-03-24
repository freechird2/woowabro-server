import { ConflictError, ServerError } from 'model/common/error'
import db from '../../config/database'

/**
 * @description 질문지 리스트 불러오기
 * @returns 질문지 리스트
 */
export const getQuestionList = async () => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        let [questionList] = await conn.query(
            `SELECT 
                q.id, 
                q.context
            FROM question AS q
           `
        )

        const [answerList] = await conn.query(
            `SELECT 
                id,
                context,
                question_id AS questionId,
                path
            FROM answer 
                `
        )

        questionList = questionList.map((question: { answer: []; id: number }) => {
            question.answer = answerList.filter((answer: { questionId: number }) => answer.questionId === question.id)
            return question
        })

        return questionList
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/question/getQuestionList] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description 질문지 상세 불러오기
 * @param id 질문지 id
 * @returns 질문지 상세
 */
export const getQuestionDetail = async (id: number) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')
        const [question] = await conn.query(
            `SELECT 
                id, 
                context
            FROM question 
            WHERE id = ${id}
            `
        )

        const [answer] = await conn.query(
            `SELECT 
                id,
                context,
                question_id AS questionId,
                path

            FROM answer 
            WHERE question_id = ${id}
            `
        )

        question[0].answerList = answer
        return question
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/question/getQuestionDetail] : ${error}`)
    } finally {
        await conn.release()
    }
}
