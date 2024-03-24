import schedule from 'node-schedule'
import { changeProcess } from 'sql/common/common.sql'

export const startProcessCron = async () => {
    const resultDate = new Date(2023, 11, 5, 10, 0, 0)
    const startEventDate = new Date(2023, 11, 14, 12, 0, 0)

    schedule.scheduleJob(resultDate, async () => {
        await changeProcess('C')
        console.log('결과발표')
    })

    schedule.scheduleJob(startEventDate, async () => {
        await changeProcess('I')
        console.log('행사시작')
    })
}
