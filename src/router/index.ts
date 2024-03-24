import { Router } from 'express'
import userRouter from './\bUser'
import adminRouter from './Admin'
import authRouter from './Auth'
import faqRouter from './Faq'
import loginRouter from './Login'
import participantRouter from './Participant'
import questionRouter from './question'

const indexRouter = Router()

indexRouter.use('/auth', authRouter)
indexRouter.use('/login', loginRouter)
indexRouter.use('/admin', adminRouter)
indexRouter.use('/participant', participantRouter)
indexRouter.use('/faq', faqRouter)
indexRouter.use('/question', questionRouter)
indexRouter.use('/user', userRouter)

module.exports = indexRouter
