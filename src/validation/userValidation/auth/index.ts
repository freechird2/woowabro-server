import Joi from 'joi'
import { BadRequestError } from 'model/common/error'

export const userLoginRequestValidation = Joi.object({
    name: Joi.string().required().error(new BadRequestError('이름을 입력해주세요.')),
    phone: Joi.string()
        .required()
        .regex(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/)
        .error(new BadRequestError('휴대폰 번호를 확인해주세요.')),
}).unknown()
