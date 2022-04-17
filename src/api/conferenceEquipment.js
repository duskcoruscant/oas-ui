import request from '@/utils/request'

/**
 * 会议室设备API
 */

const baseUrl = '/conference/equipment'

// 会议室设备分页查询
export function getEquipmentList(params) {
  return request({
    url: baseUrl,
    method: 'get',
    params
  })
}

// 新增会议室设备
export function addEquipment(data) {
  return request({
    url: baseUrl,
    method: 'post',
    data
  })
}

// 获取会议室设备详情
export function getEquipmentById(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'get'
  })
}

// 更新会议室设备
export function updateEquipment(data) {
  return request({
    url: baseUrl,
    method: 'put',
    data
  })
}

// 删除会议室设备
export function deleteEquipmentById(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'delete'
  })
}

// 获取 按类型分类的树形结构数据列表，用于创建 / 更改 会议室时的设备下拉选项
export function groupByTypeList(conferenceRoomId) {
  return request({
    url: baseUrl + '/groupByTypeList' + (conferenceRoomId !== undefined ? '?conferenceRoomId=' + conferenceRoomId : ''),
    method: 'get'
  })
}

// 获取 已有设备类型列表（去重）
export function listAllTypes() {
  return request({
    url: baseUrl + '/listAllTypes',
    method: 'get'
  })
}
