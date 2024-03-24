/**
 * @interface CommonFilter
 * @description 공통 필터 인터페이스
 * @property {string} className - 반명
 * @property {string} team - 팀
 * @property {string} coupon - 쿠폰
 * @property {string} status - 상태
 * @property {string} word - 검색어
 * @property {number} page - 페이지
 * @property {number} per - 개수
 */
export interface CommonFilter {
    className?: string
    team?: string
    coupon?: string
    status?: string
    type?: string
    word?: string
    page?: number
    per?: number
}
