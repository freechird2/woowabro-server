import Joi from 'joi'
import { BadRequestError } from 'model/common/error'

/**
 * @description faq 생성 검증
 * @param {Faq} data
 */
export const faqDataValidaion = Joi.object()
    .keys({
        id: Joi.number()
            .min(1)
            .integer()
            .alter({
                update: (scheme) => scheme.required(),
            })
            .error(new BadRequestError('id를 확인해주세요.')),
        status: Joi.string().valid('Y', 'N').required().error(new BadRequestError('status를 확인해 주세요.')),
        type: Joi.string()
            .valid('기타', '반배정 테스트', '현장확인', '드레스 코드')
            .required()
            .error(new BadRequestError('type을 확인해 주세요.')),
        title: Joi.string().required().error(new BadRequestError('title은 필수입니다.')),
        content: Joi.string().required().error(new BadRequestError('content는 필수입니다.')),
        // fileId: Joi.number().integer().min(1).optional().error(new BadRequestError('fileId는 숫자여야 합니다.')),
    })
    .unknown()
