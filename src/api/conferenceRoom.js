import request from '@/utils/request'

/**
 * 会议室管理API
 */

const baseUrl = '/conference/room'

// 会议室分页查询
export function getRoomList(params) {
  return request({
    url: baseUrl,
    method: 'get',
    params
  })
}

// 新增会议室
export function addRoom(data) {
  return request({
    url: baseUrl,
    method: 'post',
    data
  })
}

// 获取会议室详情
export function getRoomById(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'get'
  })
}

// 更新会议室
export function updateRoom(data) {
  return request({
    url: baseUrl,
    method: 'put',
    data
  })
}

// 删除会议室
export function deleteRoomById(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'delete'
  })
}

// 获取所有会议室（仅id和code）
export function listAllRoom() {
  return request({
    url: baseUrl + '/listAll',
    method: 'get'
  })
}
