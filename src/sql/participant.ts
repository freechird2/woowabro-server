import { attachOffsetLimit } from 'function/shared'
import { ConflictError, ServerError } from 'model/common/error'
import { ParticipantFilterModel, ParticipantUpdateModel, PreParticipantUpdateModel } from 'model/participant'
import db from '../../config/database'
import { isExist } from './common/common.sql'

/**
 * @description 사전 참가자 리스트
 * @param filter CommonFilter
 * @param type 'site' | 'pre'
 */
export const preParticipantList = async (filter: ParticipantFilterModel) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const commonWhere = `is_deleted = 'N'
                            ${
                                filter.status
                                    ? filter.status === '참가취소'
                                        ? `AND is_entry_cancle = 'Y'`
                                        : `AND is_entry_cancle = 'N' AND status = '${filter.status}'`
                                    : ``
                            }
                            ${
                                filter.word
                                    ? `AND (p.name LIKE '%${filter.word}%' OR phone LIKE '%${filter.word}%' OR class_name LIKE '%${filter.word}%' OR team LIKE '%${filter.word}%')`
                                    : ``
                            } 
                            ${
                                filter.className
                                    ? filter.className === '미배정'
                                        ? `AND (class_name IS NULL OR class_name = '미배정')`
                                        : `AND class_name = '${filter.className}'`
                                    : ``
                            }
                            ${filter.team ? `AND team = '${filter.team}'` : ``}`

        const totalQuery = `SELECT 
                                COUNT(*) AS total
                            FROM participant AS p
                            WHERE ${commonWhere}
                            `

        const query = `SELECT 
                            p.id, 
                            p.name,
                            (CASE 
                                WHEN is_entry_cancle = 'Y' THEN '참가취소'
                                else status
                            END) AS status,
                            team, 
                            CONCAT(
                                SUBSTRING(phone, 1, 4),
                                '****',
                                SUBSTRING(phone, 9)
                            ) AS phone,
                            IFNULL(class_name,'미배정') AS className,
                            IFNULL(registered_at,'') AS registeredAt,
                            IFNULL(test_at,'') AS testAt
                        FROM participant AS p
                        WHERE ${commonWhere}
                        ORDER by registered_at DESC, test_at DESC, name ASC
                        ${filter.isExcel ? '' : attachOffsetLimit(filter.page, filter.per)}`

        const [result] = await conn.query(query)
        const [totalCount] = await conn.query(totalQuery)
        return { list: result, total: totalCount[0].total }
    } catch (error) {
        throw new ServerError(`Error[sql/participant/getParticipantList] : ${error}`)
    } finally {
        await conn.release()
    }
}

export const siteParticipantList = async (filter: ParticipantFilterModel) => {
    let conn = null

    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const commonWhere = ` id IS NOT NULL
                            ${
                                filter.word
                                    ? `AND (name LIKE '%${filter.word}%' OR phone LIKE '%${filter.word}%' OR class_name LIKE '%${filter.word}%' OR team LIKE '%${filter.word}%')`
                                    : ``
                            } 
                            ${
                                filter.className
                                    ? filter.className === '미배정'
                                        ? `AND (class_name IS NULL OR class_name = '미배정')`
                                        : `AND class_name = '${filter.className}'`
                                    : ``
                            }
                            ${filter.team ? `AND team = '${filter.team}'` : ``}
                            ${
                                filter.coupon
                                    ? filter.coupon === '사용완료'
                                        ? `AND c.cnt IS NULL`
                                        : filter.coupon === '일부사용'
                                        ? `AND c.cnt = 1`
                                        : `AND c.cnt = 2`
                                    : ``
                            }
                            ${
                                filter.checkin === '체크인'
                                    ? `AND checkin_at IS NOT NULL`
                                    : filter.checkin === '미진행'
                                    ? `AND checkin_at IS NULL`
                                    : ``
                            }
                            `

        const totalQuery = /* sql */ `SELECT
                                        COUNT(id) AS total
                                    FROM participant as p
                                        LEFT JOIN (
                                            SELECT
                                                user_id, COUNT(id) AS cnt
                                            FROM coupon
                                            WHERE is_use = 'N'
                                            GROUP BY user_id
                                        ) AS c
                                        ON p.id = c.user_id
                                    WHERE ${commonWhere}
                                    `

        const query = /* sql */ `SELECT
                                    id, name, team, 
                                    CONCAT(SUBSTRING(phone, 1, 4), '****',SUBSTRING(phone, 9)) AS phone,
                                    class_name AS className,
                                    IF(checkin_at IS NOT NULL, '체크인', '미진행') AS status,
                                    DATE_FORMAT(checkin_at, '%Y-%m-%d %H:%i:%s') AS checkinAt,
                                    c.cnt,
                                    (CASE 
                                        WHEN c.cnt IS NULL THEN '사용완료'
                                        WHEN c.cnt = 1 THEN '일부사용'
                                        WHEN c.cnt = 2 THEN '미사용'
                                    END) AS coupon
                                FROM participant as p
                                    LEFT JOIN (
                                        SELECT
                                            user_id, COUNT(id) AS cnt
                                        FROM coupon
                                        WHERE is_use = 'N'
                                        GROUP BY user_id
                                    ) AS c
                                    ON p.id = c.user_id
                                WHERE ${commonWhere}
                                ORDER by checkin_at DESC
                                ${filter.isExcel ? '' : attachOffsetLimit(filter.page, filter.per)}
                        `

        const [result] = await conn.query(query)
        const [totalCount] = await conn.query(totalQuery)
        return { list: result, total: totalCount[0].total }
    } catch (error) {
        throw new ServerError(`Error[sql/participant/siteParticipantList] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description 사전 참가자 상세
 * @param id 참가자 id
 * @param type 'site' | 'pre'
 * @returns 참가자 상세
 * */
export const preParticipantDetail = async (id: number) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')
        await isExist(conn, 'participant', id)
        const query = `SELECT 
                            p.id, 
                            p.name,
                            team, 
                            status,
                            CONCAT(
                                SUBSTRING(phone, 1, 4),
                                '****',
                                SUBSTRING(phone, 9)
                            ) AS phone,
                            IFNULL(class_name,'') AS className,
                            IFNULL(registered_at, '') AS registeredAt,
                            IFNULL(test_at,'') AS testAt,
                            is_entry_cancle AS isEntryCancle,
                            is_complete_assignment AS isCompleteAssignment
                        FROM participant AS p
                        WHERE is_deleted = 'N'
                        AND p.id = ${id}`

        const [[result]] = await conn.query(query)

        return result
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/getParticipantDetail] : ${error}`)
    } finally {
        await conn.release()
    }
}

export const siteParticipantDetail = async (id: number) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')
        await isExist(conn, 'participant', id)
        const query = `SELECT 
                            p.id, 
                            p.name,
                            team, 
                            CONCAT(
                                SUBSTRING(phone, 1, 4),
                                '****',
                                SUBSTRING(phone, 9)
                            ) AS phone,
                            IFNULL(class_name,'') AS className,
                            IFNULL(checkin_at,'') AS checkinAt,
                            IF(checkin_at IS NOT NULL,'체크인','미진행') AS status,
                            JSON_ARRAYAGG(JSON_OBJECT(
                                                'id', IFNULL(cp.id,''), 
                                                'type', IFNULL(cp.type,''), 
                                                'isUse',IFNULL(cp.is_use,'N'))
                                        ) AS coupon
                        FROM participant AS p
                        LEFT JOIN coupon AS cp ON p.id = cp.user_id
                        WHERE is_deleted = 'N'
                        AND p.id = ${id}
                        `

        const [result] = await conn.query(query)

        return result
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/getParticipantDetail] : ${error}`)
    } finally {
        await conn.release()
    }
}

export const updateSiteParticipant = async (data: ParticipantUpdateModel) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')
        await isExist(conn, 'participant', data.id)

        await conn.beginTransaction()

        await conn.query(
            `UPDATE 
                participant 
            SET checkin_at =  ${data.checkin === '체크인' ? `IF(checkin_at IS NULL, NOW(),checkin_at)` : `NULL`}
            WHERE id = ${data.id}`
        )

        if (data.checkin === '체크인') {
            await conn.query(
                `UPDATE 
                    coupon
                SET
                    is_use = ${data.pouch === '사용' ? `'Y'` : `'N'`}
                WHERE user_id = ${data.id}
                AND type = 'pouch'`
            )

            await conn.query(
                `UPDATE 
                    coupon
                SET is_use = ${data.drink === '사용' ? `'Y'` : `'N'`}
                WHERE user_id = ${data.id}
                AND type = 'drink'`
            )
        }

        await conn.commit()
    } catch (error) {
        await conn.rollback()
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/updateSiteParticipant] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description 사전참가자 수정
 * @param id 참가자 id
 */
export const updatePreParticipant = async (data: PreParticipantUpdateModel) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        await isExist(conn, 'participant', data.id)

        const query = /* sql */ `UPDATE
                                    participant
                                SET
                                    ${data.isEntry === '참가' ? `status = '${data.status}', ` : ``}
                                    ${data.isEntry === '참가' ? `class_name = '${data.className}', ` : ``}
                                    is_entry_cancle = '${data.isEntry === '참가' ? 'N' : 'Y'}'
                                WHERE id = ${data.id}
                                `
        await conn.query(query)
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/updatePreParticipant] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description 참가자 복구
 * @param id 참가자 id
 */
export const revertParticipant = async (id: number) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const [result] = await conn.query(
            `UPDATE 
                participant 
            SET pre_status= status
            WHERE id = ${id}
            AND pre_status = '참가취소'`
        )
        if (!result.affectedRows) throw new ConflictError('취소된 사용자가 아닙니다.')
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/revertParticipant] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description 참가자 반 일괄처리
 * @param data { ids: number[]; className: string }
 */
export const batchParticipant = async (data: { ids: number[]; className: string }) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const [isExist] = await conn.query(
            `SELECT 
                id 
            FROM participant
            WHERE id IN (${data.ids.join(',')})
            `
        )
        if (isExist.length !== data.ids.length) throw new ConflictError('존재하지 않는 참가자가 포함되어 있습니다.')

        await conn.query(
            `UPDATE 
                participant 
            SET 
                class_name = "${data.className}"
            WHERE id IN (${data.ids.join(',')})`
        )
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/batchParticipant] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description 참가자 체크인
 * @param id 참가자 id
 */
export const checkinParticipant = async (id: number) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        await isExist(conn, 'participant', id)

        await conn.beginTransaction()

        await conn.query(
            `INSERT INTO coupon(type, user_id) 
            VALUES('pouch', ${id}), ('drink',${id})`
        )
        const [isCheckIn] = await conn.query(`SELECT status FROM participant WHERE id = ${id} AND checkin_at IS NOT NULL`)

        if (isCheckIn.length) throw new ConflictError('이미 체크인된 참가자입니다.')
        await conn.query(
            `UPDATE 
                participant 
            SET checkin_at = NOW()
            WHERE id = ${id}`
        )

        await conn.commit()
    } catch (error) {
        await conn.rollback()
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/checkinParticipant] : ${error}`)
    } finally {
        await conn.release()
    }
}

/**
 * @description 반배정 수정 페이지 list
 * @param 반명
 */
export const getClassDivisionList = async (filter: ParticipantFilterModel) => {
    let conn = null
    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        const commonWhere = `is_deleted = 'N'
                            ${
                                filter.className
                                    ? `AND ${
                                          filter.className === '미배정'
                                              ? `(class_name IS NULL OR class_name = '미배정')`
                                              : ` class_name = '${filter.className}'`
                                      }`
                                    : ``
                            }
                            ${
                                filter.word
                                    ? `AND (name LIKE '%${filter.word}%' 
                                            OR phone LIKE '%${filter.word}%' 
                                            OR class_name LIKE '%${filter.word}%' 
                                            OR team LIKE '%${filter.word}%')`
                                    : ``
                            } 
                            `

        const query =
            /* sql */
            `SELECT 
                id, 
                name, 
                team, 
                CONCAT(SUBSTRING(phone, 1, 4),
                        '****',
                        SUBSTRING(phone, 9)) AS phone, 
                IF(class_name IS NULL , '미배정' , class_name) AS class, 
                IFNULL(DATE_FORMAT(test_at, '%Y-%d-%m %H:%i:%s'),'') AS testAt
            FROM participant
            WHERE ${commonWhere}
            ${attachOffsetLimit(filter.page, filter.per)}`

        const [res] = await conn.query(query)

        const [[totalCount]] = await conn.query(
            `SELECT 
                COUNT(*) AS total
            FROM participant
            WHERE is_deleted = 'N'
            AND ${commonWhere}
           `
        )

        // className에 따른 참가자 수를 res의 class와 일치한지 판단 후 같으면 summary에 넣어주고 total에 더해준다.
        const summaryQuery =
            /* sql */
            `SELECT 
                *, count(*) AS total
            FROM (SELECT
                        IF(class_name = '미배정' OR class_name IS NULL, '미배정',class_name) AS className
                    FROM participant
                    WHERE is_deleted = 'N'
                ) AS a
            GROUP BY a.className
            ORDER BY a.className ASC,
                    CASE 
                        WHEN a.className != '미배정' THEN 1 
                        ELSE 2
                    END
        `

        const [summary] = await conn.query(summaryQuery)

        const totalSummary = summary.reduce((acc, cur) => acc + cur.total, 0)

        summary.unshift({ className: '전체', total: totalSummary })
        // summary.map((v) => (!v.className ? (v.className = '미배정') : (v.className = v.className)))

        return { summary, total: totalCount.total, list: res }
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/getClassDivisionList] : ${error}`)
    } finally {
        await conn.release()
    }
}

export const batchSeat = async (data: (number | string)[]) => {
    let conn = null

    try {
        conn = await db.getConnection()
        if (!conn) throw new ServerError('db connection error')

        for (let i = 0; i < data.length; i++) {
            const d = data[i]

            const name = d[0]
            const phone = d[1]
            const seat = `${d[2]}-${d[3]}`

            const [[res]] = await conn.query(`SELECT id FROM participant WHERE name = '${name}' AND phone = '${phone}'`)

            if (res && res.id) await conn.query(`UPDATE participant SET seat = '${seat}' WHERE id = ${res.id}`)
        }
    } catch (error) {
        if (error instanceof ConflictError) throw new ConflictError(error.message)
        throw new ServerError(`Error[sql/participant/batchSeat] : ${error}`)
    } finally {
        await conn.release()
    }
}
