import { ConflictError, ServerError } from 'model/common/error'
import db from '../../../config/database'

/**
 * @description 인자로 받은 테이블 내 데이터 존재 여부 확인
 * @param {any} conn - db connection 객체
 * @param {string} table - 테이블명
 * @param {number} id - 데이터 id
 * @returns {string} - 쿼리문
 */
export const isExist = async (conn: any, table: string, id: number): Promise<string> => {
    const [[result]] = await conn.query(
        `SELECT 
            id 
        FROM ${table} 
        WHERE id = ${id}
        AND is_deleted = 'N'`
    )

    if (!result) throw new ConflictError(`'${table}' 테이블에 { id :${id} } 가 없습니다.`)

    return `SELECT id FROM ${table} WHERE id = ${id}`
}

// 쿠폰 생성
export const makeCoupon = async () => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const query = /* sql */ `SELECT
                                    id,
                                    (SELECT COUNT(*) AS cnt FROM coupon WHERE user_id = p.id AND type = 'pouch') AS pouch,
                                    (SELECT COUNT(*) AS cnt FROM coupon WHERE user_id = p.id AND type = 'drink') AS drink
                                FROM participant AS p
                                `

        const [list] = await conn.query(query)

        const arr = []

        list.map((l) => {
            if (l.pouch === 0) arr.push(`('pouch', ${l.id})`)

            if (l.drink === 0) arr.push(`('drink', ${l.id})`)
        })

        const insertQuery = /* sql */ `INSERT INTO 
                                        coupon(type, user_id) 
                                    VALUES ${arr.join(', ')}`
        await conn.query(insertQuery)
    } catch (error) {
        throw new ServerError(`Error[sql/common/makeCoupon] : ${error}`)
    } finally {
        await conn.release()
    }
}

export const getCurrentProcess = async () => {
    let conn = null

    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const query = /* sql */ `SELECT
                                    CASE
                                        WHEN project_status = '사전예약중' THEN '테스트기간'
                                        WHEN project_status = '배정완료' THEN '결과발표'
                                        WHEN project_status = '행사중' THEN '행사시작'
                                    END AS projectStatus
                                FROM config
                                `

        const [[res]] = await conn.query(query)

        return res.projectStatus
    } catch (error) {
        throw new ServerError(`Error[sql/common/chageProcess] : ${error}`)
    } finally {
        await conn.release()
    }
}

export const changeProcess = async (process: 'T' | 'C' | 'I') => {
    let conn = null

    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const query = /* sql */ `UPDATE
                                    config
                                SET
                                    project_status = '${
                                        process === 'T'
                                            ? '사전예약중'
                                            : process === 'C'
                                            ? '배정완료'
                                            : process === 'I'
                                            ? '행사중'
                                            : '행사전'
                                    }'
                                `

        const [res] = await conn.query(query)

        if (!res || !res.affectedRows) throw new ConflictError('process 변경 중 오류가 발생했습니다.')
    } catch (error) {
        throw new ServerError(`Error[sql/common/chageProcess] : ${error}`)
    } finally {
        await conn.release()
    }
}

export const testReset = async () => {
    let conn = null

    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const query = /* sql */ `UPDATE
                                    participant
                                SET
                                    status = '미등록',
                                    class_name = NULL,
                                    checkin_at = NULL,
                                    test_at = NULL,
                                    registered_at = NULL
                                `

        const [res] = await conn.query(query)

        const query2 = /* sql */ `UPDATE
                                    coupon
                                SET
                                    is_use = 'N'
                                `

        const [res2] = await conn.query(query2)
    } catch (error) {
        throw new ServerError(`Error[sql/common/testReset] : ${error}`)
    } finally {
        await conn.release()
    }
}
