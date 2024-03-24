import { Request, Response, Router } from 'express'
import { usedMiddlewareByLogin } from 'function/shared'
import { ExcelMulter } from 'middleware/excelUploader'
import { ParticipantFilterModel, ParticipantUpdateModel, PreParticipantUpdateModel } from 'model/participant'
import {
    batchParticipant,
    batchSeat,
    checkinParticipant,
    getClassDivisionList,
    preParticipantDetail,
    preParticipantList,
    revertParticipant,
    siteParticipantDetail,
    siteParticipantList,
    updatePreParticipant,
    updateSiteParticipant,
} from 'sql/participant'
import { commonIdValidation } from 'validation/commonFilter.validation'
import {
    batchParticipantValidate,
    participantFilterValidation,
    participantUpadateValidation,
    preParticipantUpadateValidation,
} from 'validation/participant.validation'
const util = require('util')
const xlsx = require('xlsx')

const participantRouter = Router()

/**
 * @description 사전 참가자 리스트
 * @route GET /participant/pre
 */
participantRouter.get('/pre', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const filter: ParticipantFilterModel = req.query
    await participantFilterValidation.tailor('pre').validateAsync(filter)
    const result = await preParticipantList(filter)
    return res.json({
        code: 200,
        message: '사전 참가자 리스트를 불러왔습니다.',
        data: {
            isLast: filter.page * filter.per >= result.total,
            totalCount: result.total,
            list: result.list,
        },
    })
})

participantRouter.get('/pre/:id', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    await commonIdValidation.tailor('pre').validateAsync(id)
    const result = await preParticipantDetail(id)
    return res.json({ code: 200, message: '사전 참가자 리스트를 불러왔습니다.', data: result })
})

/**
 * @description 현장 참가자 리스트
 * @route GET /participant/pre
 */
participantRouter.get('/site', usedMiddlewareByLogin(1), async (req: Request, res: Response) => {
    const filter: ParticipantFilterModel = req.query

    await participantFilterValidation.tailor('field').validateAsync(filter)
    const result = await siteParticipantList(filter)

    return res.json({
        code: 200,
        message: '현장 참가자 리스트를 불러왔습니다.',
        data: {
            isLast: filter.page * filter.per >= result.total,
            totalCount: result.total,
            list: result.list,
        },
    })
})

participantRouter.get('/site/:id', usedMiddlewareByLogin(1), async (req: Request, res: Response) => {
    const id: number = Number(req.params.id)
    await commonIdValidation.validateAsync(id)
    const [result] = await siteParticipantDetail(id)

    return res.json({ code: 200, message: '현장 참가자를 불러왔습니다.', data: result })
})

participantRouter.put('/site', usedMiddlewareByLogin(1), async (req: Request, res: Response) => {
    const data: ParticipantUpdateModel = req.body
    await participantUpadateValidation.validateAsync(data)
    await updateSiteParticipant(data)
    return res.json({ code: 200, message: '현장 참가자를 수정했습니다.', data: null })
})

/**
 * @description 사전 참가자 수정
 */
participantRouter.put('/pre', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const data: PreParticipantUpdateModel = req.body
    await preParticipantUpadateValidation.validateAsync(data)
    await updatePreParticipant(data)

    return res.json({ code: 200, message: '사전 참가자를 수정했습니다.', data: null })
})

/**
 * @description 참가자 복구
 * @route PUT /participant/revert/:id
 * @param id 참가자 id
 */
participantRouter.put('/revert/', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const id: number = req.body.id
    await commonIdValidation.validateAsync(id)
    await revertParticipant(id)

    return res.json({ code: 200, message: '참가자를 복구했습니다.', data: null })
})

/**
 * @description 반배정 수정 페이지 list
 * @route GET /class-division
 */
participantRouter.get('/class-division', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const filter: ParticipantFilterModel = req.query
    const result = await getClassDivisionList(filter)

    return res.json({
        code: 200,
        message: '반배정 수정 리스트를 불러왔습니다.',
        data: result,
    })
})

/**
 * @description 참가자 일괄 반배정
 * @route PUT /participant/batch
 * @param ids 참가자 id 배열
 * @param className 반명
 */
participantRouter.put('/batch', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const data: { ids: number[]; className: string } = { ...req.body }
    await batchParticipantValidate.validateAsync(data)
    await batchParticipant(data)
    return res.json({ code: 200, message: '반배정을 완료했습니다.', data: null })
})

participantRouter.put('/check-in/', usedMiddlewareByLogin(0), async (req: Request, res: Response) => {
    const id: number = req.body.id
    await commonIdValidation.validateAsync(id)
    await checkinParticipant(id)
    return res.json({ code: 200, message: '체크인을 완료했습니다.', data: null })
})

export interface MulterRequest extends Request {
    fileValidationError?: string
}

participantRouter.post('/seat', async (req: MulterRequest, res: Response) => {
    const upload = util.promisify(ExcelMulter.single('excel'))

    upload(req, res, async function error(error) {
        if (!req.file || req.fileValidationError) return res.status(500).json({ code: 500, message: req.fileValidationError, data: null })

        const excelFile = xlsx.readFile(req.file.path)
        const sheetName = excelFile.SheetNames[0]
        const firstSheet = excelFile.Sheets[sheetName]
        const data = xlsx.utils.sheet_to_json(firstSheet, { header: 1 })

        if (!data || data.length < 1) return res.json({ code: 400, message: '입력할 데이터가 없습니다.', data: null })

        try {
            await batchSeat(data)
        } catch (error) {
            return res.status(500).json({ code: 500, message: '좌석배치 업로드 중 오류가 발생했습니다.', data: null })
        }

        return res.json({ code: 200, message: '좌석배치를 완료했습니다.', data: null })
    })
})

export default participantRouter
