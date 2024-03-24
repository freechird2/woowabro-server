import multer from 'multer'

const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/')
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    },
})

const fileFilter = (req, file, callback) => {
    const type = file.originalname.split('.')[1]

    if (type === 'xlsx') {
        callback(null, true)
    } else {
        req.fileValidationError = 'xlsx 파일만 업로드 가능합니다.'
        callback(null, false)
    }
}

export const ExcelMulter = multer({
    storage: Storage,
    fileFilter: fileFilter, // optional
})
