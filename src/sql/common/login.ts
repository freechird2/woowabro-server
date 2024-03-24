import { ServerError } from 'model/common/error'
import { LoginDataModel } from 'model/login'
import db from '../../../config/database'

/**
 * @description 사전 참가자 로그인
 * @param loginData LoginDataModel
 */
export const adminLogin = async (loginData: LoginDataModel) => {
    let result = null
    let conn = null

    try {
        conn = await db.getConnection()
        if (!conn) throw 'db connection error'

        const [res] = await conn.query(
            `SELECT 
              id, 
              login_id AS loginId,
              name,
              type
            FROM admin 
            WHERE login_id = "${loginData.loginId}"
            AND password = "${loginData.password}"
            `
        )
        result = res[0] || null
    } catch (err) {
        throw new ServerError(`Error[sql/common/login/adminLogin] : ${err}`)
    } finally {
        if (conn) await conn.release()
    }

    return result
}
