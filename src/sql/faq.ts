import { attachOffsetLimit } from 'function/shared'
import { CommonFilter } from 'model/admin/common.interface'
import { ConflictError, ServerError } from 'model/common/error'
import { FaqModel } from 'model/faq'
import db from '../../config/database'
import { isExist } from './common/common.sql'
// import { fileUpload } from './common/fileUpload'

/**
 * @description faq 리스트
 * @param filter CommonFilter
 * @returns faq list
 */
export const getFaqList = async (filter: CommonFilter) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const commonWhere = `q.is_deleted = 'N'
        ${filter.word ? `AND title LIKE '%${filter.word}%'` : ``} 
        ${filter.status ? `AND status = '${filter.status}'` : ``}
        ${filter.type ? `AND type = '${filter.type}'` : ``}`

        const [totalCount] = await conn.query(
            `SELECT 
                COUNT(*) AS total
            FROM faq AS q
            WHERE ${commonWhere}
            `
        )

        const [result] = await conn.query(
            `SELECT 
                q.id, 
                status, 
                type,
                title, 
                q.registered_at AS registeredAt
                -- ,IFNULL(f.file_transed_name,'') AS url
            FROM faq AS q
            -- LEFT JOIN file AS f ON f.id = q.file_id
            WHERE ${commonWhere}
            ORDER by registered_at DESC
            ${attachOffsetLimit(filter.page, filter.per)}`
        )

        return { list: result, total: totalCount[0].total }
    } catch (error) {
        throw new ServerError(`Error[sql/faq/getFaqList] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description faq 상세
 * @param id faq id
 * @returns faq detail
 */
export const getFaqDetail = async (id: number) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        await isExist(conn, 'faq', id)

        const [result] = await conn.query(
            `SELECT 
                q.id, 
                status, 
                type,
                title, 
                content,
                q.registered_at AS registeredAt
            FROM faq AS q
            WHERE q.id = ${id}
           `
        )
        return result
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/faq/getFaqDetail] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description faq 생성
 * @param data FaqModel
 * @param file file object
 */
export const createFaq = async (
    data: FaqModel
    //  file?: any
) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        await conn.beginTransaction()

        // let fileId = null
        // if (file) fileId = await fileUpload(conn, file)

        const [result] = await conn.query(
            `INSERT INTO faq (
                status, 
                type,
                title, 
                content
                ) 
            VALUES (
                "${data.status}", 
                "${data.type}", 
                "${data.title}",
                "${data.content}" 
        )`
        )
        await conn.commit()

        return result.insertId
    } catch (error) {
        await conn.rollback()
        throw new ServerError(`Error[sql/faq/createFaq] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description faq 수정
 * @param data FaqModel
 * @param id faq id
 * @param file file object
 */
export const updateFaq = async (
    data: FaqModel
    //  file: any
) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        await isExist(conn, 'faq', data.id)

        // let fileId = null
        // if (file) fileId = await fileUpload(conn, file)

        const [result] = await conn.query(
            `UPDATE faq 
            SET 
                id = ${data.id}
                ${data.status ? `,status = "${data.status}" ` : ``}
                ${data.type ? `,type = "${data.type}" ` : ``}
                ${data.title ? `,title = "${data.title}" ` : ``}
                ${data.content ? `,content = "${data.content}" ` : ``}
            WHERE id = ${data.id}`
        )

        return result
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/faq/updateFaq] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description faq 삭제
 * @param id faq id
 */
export const deleteFaq = async (id: number) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        await isExist(conn, 'faq', id)
        const [result] = await conn.query(
            `UPDATE 
                faq 
            SET is_deleted = 'Y' 
            WHERE id = ${id} `
        )

        return result
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/faq/deleteFaq] : ${error}`)
    } finally {
        await conn.release()
    }
}
