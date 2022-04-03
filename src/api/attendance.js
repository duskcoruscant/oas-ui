import request from '@/utils/request'

const baseUrl = '/attendance'

// 通过员工id和日期查询所有考勤记录
export function getAttListByMonthOrDate(params) {
  return request({
    url: baseUrl + '/getByMonthOrDate',
    method: 'get',
    params
  })
}

// 签到
export function clockIn(empId) {
  return request({
    url: baseUrl + '?empId=' + empId,
    method: 'post'
  })
}

// 签退
export function clockOut(empId) {
  return request({
    url: baseUrl + '?empId=' + empId,
    method: 'put'
  })
}
