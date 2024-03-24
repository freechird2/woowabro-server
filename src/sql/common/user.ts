import { ServerError } from 'model/common/error'
import db from '../../../config/database'

/**
 * @description userId로 user 정보 가져오기
 * @param idx number
 * @returns user
 */
export const getUserWithId = async (idx: number) => {
    let user = null
    let conn = null

    try {
        conn = await db.getConnection()

        if (!conn) throw new ServerError(`db connection error`)

        const [res] = await conn.query(
            `SELECT 
                id, 
                login_id AS loginId,
                name,
                type,
                (SELECT project_status FROM config) AS projectStatus
            FROM admin 
            WHERE id = ${idx}`
        )
        user = res && res[0] && res[0].id ? res[0] : null
    } catch (error) {
        throw new ServerError(`Error[sql/common/user/getUserWithId] : ${error}`)
    } finally {
        if (conn) conn.release()
    }

    return user
}
