import Joi from 'joi'
import { BadRequestError } from 'model/common/error'
import { commonFilterValidation } from 'validation/commonFilter.validation'

/**
 * @description 참가자 일괄 반배정
 * @property ids 참가자 id 배열
 * @property className 반명
 */
export const batchParticipantValidate = Joi.object({
    userId: Joi.allow(),
    ids: Joi.array()
        .items(Joi.number().min(1))
        .required()
        .error(new BadRequestError('id는 숫자로 이루어진 배열만 가능합니다.')),
    className: Joi.string().required().error(new BadRequestError('존재하지 않는 반입니다.')),
})

export const participantFilterValidation = commonFilterValidation
    .keys({
        className: Joi.string().optional().error(new BadRequestError('반명을 확인해주세요.')),
        status: Joi.string()
            .alter({ field: (scheme) => scheme.valid('체크인', '미진행') })
            .alter({
                pre: (scheme) => scheme.valid('등록완료', '미등록', '테스트완료', '참가취소'),
            })
            .optional()
            .error(new BadRequestError('status를 확인해 주세요.')),
        coupon: Joi.string()
            .optional()
            .valid('사용완료', '미사용', '일부사용')
            .error(new BadRequestError('coupon 사용여부를 확인해 주세요.')),
        team: Joi.string().optional().error(new BadRequestError('team은 문자열이여야 합니다.')),
    })
    .unknown()

export const participantUpadateValidation = Joi.object({
    id: Joi.number().min(1).required().error(new BadRequestError('id를 확인해주세요.')),
    checkin: Joi.string()
        .required()
        .valid('체크인', '미진행')
        .error(new BadRequestError('체크인 여부를 확인해주세요.')),
    pouch: Joi.string()
        .required()
        .valid('사용', '미사용')
        .error(new BadRequestError('파우치 쿠폰 사용여부를 확인해주세요.')),
    drink: Joi.string()
        .required()
        .valid('사용', '미사용')
        .error(new BadRequestError('음료 쿠폰 사용여부를 확인해주세요.')),
}).unknown()

export const preParticipantUpadateValidation = Joi.object({
    id: Joi.number().min(1).required().error(new BadRequestError('id를 확인해주세요.')),
    isEntry: Joi.string().required().valid('참가', '참가취소').error(new BadRequestError('참가 여부를 확인해주세요.')),
    status: Joi.string()
        .required()
        .valid('등록완료', '미등록', '테스트완료')
        .error(new BadRequestError('진행 상태를 확인해주세요.')),
    className: Joi.string().required().error(new BadRequestError('반을 확인해주세요.')),
}).unknown()
