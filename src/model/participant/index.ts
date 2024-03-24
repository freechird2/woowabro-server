import { CommonFilter } from 'model/admin/common.interface'

export interface ParticipantFilterModel extends CommonFilter {
    team?: string
    status?: '등록완료' | '테스트완료' | '미등록' | '참가취소'
    checkin?: '체크인' | '미진행'
    isExcel?: 'Y' | 'N'
}

export interface ParticipantUpdateModel {
    id: number
    checkin: string
    pouch: string
    drink: string
}

export interface PreParticipantUpdateModel {
    id: number
    isEntry: '참가' | '참가취소'
    status: '등록완료' | '테스트완료' | '미등록'
    className: string
}
