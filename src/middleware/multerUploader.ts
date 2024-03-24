// const AWS = require('aws-sdk')
// require('aws-sdk/lib/maintenance_mode_message').suppress = true
// import dotenv from 'dotenv'
// import multer from 'multer'
// import multerS3 from 'multer-s3'
// dotenv.config()

// const uploadDir = 'woowa/faq/'

// //* aws region 및 자격증명 설정
// AWS.config.update({
//     accessKeyId: process.env.S3_ACCESS_KEY_ID,
//     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//     region: 'ap-northeast-2',
// })

// //* AWS S3 multer 설정
// export const upload = multer({
//     //* 저장공간
//     // s3에 저장
//     storage: multerS3({
//         // 저장 위치
//         s3: new AWS.S3(),
//         bucket: process.env.S3_BUCKET,
//         acl: 'public-read',
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         key(req, file, cb) {
//             cb(null, `${uploadDir}${Date.now()}`) // original 폴더안에다 파일을 저장
//         },
//     }),
//     //* 용량 제한
//     limits: { fileSize: 5 * 1024 * 1024 },
// })
