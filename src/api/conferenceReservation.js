import request from '@/utils/request'

/**
 * 会议预订API
 */

const baseUrl = '/conference/reservation'

// 会议预订页面分页查询
export function pageQueryForRes(params) {
  return request({
    url: baseUrl,
    method: 'get',
    params
  })
}

// 预订会议
export function addConferenceReservation(form) {
  return request({
    url: baseUrl,
    method: 'post',
    data: form
  })
}

// 会议列表页面分页查询
export function pageQueryForResHistory(params) {
  return request({
    url: baseUrl + '/resHistory',
    method: 'get',
    params
  })
}

// 根据id取消未开始的会议预订记录
export function cancelConferenceRes(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'delete'
  })
}
