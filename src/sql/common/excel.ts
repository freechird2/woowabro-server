import { ServerError } from 'model/common/error'
import { ParticipantFilterModel } from 'model/participant'
import db from '../../../config/database'

export const getExcel = async (filter: ParticipantFilterModel) => {
    let conn = null

    try {
        conn = await db.getConnection()

        if (!conn) throw new ServerError(`db connection error`)

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

        const query = /* sql */ `SELECT 
                                    p.id, 
                                    p.name,
                                    (CASE 
                                        WHEN is_entry_cancle = 'Y' THEN '참가취소'
                                        else status
                                    END) AS status,
                                    IF(checkin_at IS NOT NULL, '체크인', '미진행') AS checkin,
                                    team, 
                                    CONCAT(
                                        SUBSTRING(phone, 1, 4),
                                        '****',
                                        SUBSTRING(phone, 9)
                                    ) AS phone,
                                    IFNULL(class_name,'미배정') AS className,
                                    c.cnt,
                                    (CASE 
                                        WHEN c.cnt IS NULL THEN '사용완료'
                                        WHEN c.cnt = 1 THEN '일부사용'
                                        WHEN c.cnt = 2 THEN '미사용'
                                    END) AS coupon,
                                    IFNULL(registered_at,'') AS registeredAt,
                                    IFNULL(test_at,'') AS testAt,
                                    DATE_FORMAT(checkin_at, '%Y-%m-%d %H:%i:%s') AS checkinAt
                                FROM participant AS p
                                    LEFT JOIN (
                                        SELECT
                                            user_id, COUNT(id) AS cnt
                                        FROM coupon
                                        WHERE is_use = 'N'
                                        GROUP BY user_id
                                    ) AS c
                                    ON p.id = c.user_id
                                WHERE ${commonWhere}
                                ORDER by name ASC`

        const [res] = await conn.query(query)

        return res
    } catch (error) {
        throw new ServerError(`Error[sql/common/excel/getExcel] : ${error}`)
    } finally {
        if (conn) conn.release()
    }
}

export const getTestResultExcel = async (filter: ParticipantFilterModel) => {
    let conn = null

    try {
        conn = await db.getConnection()

        if (!conn) throw new ServerError(`db connection error`)

        const commonWhere = `p.className <> '미배정'
                            ${
                                filter.word
                                    ? `AND (p.name LIKE '%${filter.word}%' OR p.phone LIKE '%${filter.word}%' OR p.className LIKE '%${filter.word}%' OR p.team LIKE '%${filter.word}%')`
                                    : ``
                            } 
                            ${
                                filter.className
                                    ? filter.className === '미배정'
                                        ? `AND (p.className IS NULL OR p.className = '미배정')`
                                        : `AND p.className = '${filter.className}'`
                                    : ``
                            }
                            `

        const query = /* sql */ `SELECT
                                    id, p.name, p.className, DATE_FORMAT(tr.registered_at, '%Y-%m-%d %H:%i:%s') AS registeredAt, 
                                    q1, q2, q3, q4, q5, q6, q7, q8, q9,
                                    CONCAT(q1, ',', q2, ',', q3, ',', q4, ',', q5, ',', q6, ',', q7, ',', q8, ',', q9) AS total
                                FROM test_result AS tr
                                    LEFT JOIN (
                                        SELECT
                                            id AS p_id, name, team, phone, IFNULL(class_name, '미배정') AS className
                                        FROM participant 
                                    ) AS p
                                    ON tr.user_id = p.p_id
                                WHERE ${commonWhere}
                                ORDER BY p.name ASC`

        const [res] = await conn.query(query)

        const answerArr = ['', 'A', 'B', 'C', 'D']

        res.map((r) => {
            r.A = r.total.split(',').filter((a) => a === '1').length
            r.B = r.total.split(',').filter((a) => a === '2').length
            r.C = r.total.split(',').filter((a) => a === '3').length
            r.D = r.total.split(',').filter((a) => a === '4').length
            r.q1 = answerArr[r.q1]
            r.q2 = answerArr[r.q2]
            r.q3 = answerArr[r.q3]
            r.q4 = answerArr[r.q4]
            r.q5 = answerArr[r.q5]
            r.q6 = answerArr[r.q6]
            r.q7 = answerArr[r.q7]
            r.q8 = answerArr[r.q8]
            r.q9 = answerArr[r.q9]
            return r
        })

        return res
    } catch (error) {
        throw new ServerError(`Error[sql/common/excel/getTestResultExcel] : ${error}`)
    } finally {
        if (conn) conn.release()
    }
}
