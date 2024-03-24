// import { ConflictError, ServerError } from 'model/common/error'

// /**
//  * @description 파일 업로드
//  * @param {any} conn - db connection 객체
//  * @param {any} file - 파일 객체
//  */
// export const fileUpload = async (conn: any, file: any) => {
//     try {
//         if (!conn) throw new ServerError('db connection error')

//         const [fileId] = await conn.query(
//             `INSERT
//                 file
//             SET file_origin_name = '${file.originalname}',
//             file_transed_name = '${file.location.split('/')[5]}',
//             extension = '${file.mimetype.split('/')[1]}',
//             size = ${file.size}
//             `
//         )

//         return fileId.insertId
//     } catch (error) {
//         if (error instanceof ConflictError) throw new ConflictError(error.message)
//         throw new ServerError(`Error[sql/common/fileUpload] : ${error}`)
//     }
// }
