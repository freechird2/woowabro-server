import { Request, Response } from 'express'
import 'express-async-errors'
import { errorHandler } from 'middleware/errorHandler'
const { sanitizer } = require('./src/middleware/sanitizer')

const port = 3100
const indexRouter = require('router')

import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { startProcessCron } from 'function/cron'
const fs = require('fs')
const app = express()

app.use(
    cors({
        origin: '*',
        optionsSuccessStatus: 200, // 응답 상태 200으로 설정
    })
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', sanitizer, indexRouter)

// 404 Error Handling
app.use(function (req: Request, res: Response) {
    res.status(404).json({ code: 404, message: '지원하지 않는 API URI입니다.' })
})

app.use(errorHandler)

app.listen(port, async () => {
    const dir = './uploads'
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }

    await startProcessCron()
    console.log(`WOOWAYOUTHS Server listening on port ${port}`)
})
