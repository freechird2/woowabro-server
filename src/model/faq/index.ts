export interface FaqModel {
    id: number
    status: 'close' | 'open'
    type: '기타' | '반배정' | '현장'
    title: string
    content: string
    // fileId: number
}
