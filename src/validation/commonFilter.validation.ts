import Joi from 'joi'
import { BadRequestError } from 'model/common/error'

/**
 * @description 공통 필터 검증
 * @param {CommonFilter} filter
 */
export const commonFilterValidation = Joi.object()
    .keys({
        userId: Joi.allow(),
        page: Joi.number().integer().min(1).required().error(new BadRequestError('page는 1보다 작을 수 없습니다.')),
        per: Joi.number().integer().min(1).required().error(new BadRequestError('per는 1보다 작을 수 없습니다.')),
        word: Joi.string()
            .allow('' || null)
            .error(new BadRequestError('word는 문자열이어야 합니다.')),
        status: Joi.string().valid('Y', 'N').error(new BadRequestError('status는 Y 또는 N이어야 합니다.')),
        type: Joi.string()
            .valid('기타', '반배정 테스트', '현장확인')
            .error(new BadRequestError('type은 기타, 반배정, 현장확인 중 하나여야 합니다.')),
    })
    .unknown()

/**
 * @description 공통 id 검증
 * @param {number} id
 */
export const commonIdValidation = Joi.number()
    .integer()
    .min(1)
    .required()
    .error(new BadRequestError('id를 확인해주세요.'))
