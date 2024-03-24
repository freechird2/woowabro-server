import { ServerError } from 'model/common/error'
import db from '../../../config/database'
import { questions } from '../../../questions'

export const questionMigration = async () => {
    const data = questions
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        let questionId = 1
        for (const item of data) {
            await conn.query(
                `INSERT INTO question (
                    context
                    ) 
                VALUES (
                    "${item.q}"        
                    )`
            )

            await conn.query(
                `INSERT INTO answer (
                    context,
                    question_id,
                    path
                    )
                VALUES(
                    "${item.a}", 
                    ${questionId},
                    1)
                    `
            )

            await conn.query(
                `INSERT INTO answer (
                    context,
                    question_id,
                    path
                    )
                VALUES("${item.b}", ${questionId},2)`
            )
            await conn.query(
                `INSERT INTO answer (
                    context,
                    question_id,
                    path
                )
                VALUES("${item.c}", ${questionId},3)`
            )
            await conn.query(
                `INSERT INTO answer (
                    context,
                    question_id,
                    path
                    )
                VALUES("${item.d}", ${questionId},4)`
            )

            questionId++
        }
    } catch (error) {
        throw new ServerError(`Error[sql/questionMigration] : ${error}`)
    } finally {
        await conn.release()
    }
}
