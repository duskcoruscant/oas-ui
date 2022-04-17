/**
 *
 * 数据字典工具类
 */

/**
 * 角色类型字典
 */
export const ROLE_TYPE_DICT = [{
  value: 0,
  name: '系统内置',
  type: 'danger'
}, {
  value: 1,
  name: '自定义',
  type: 'primary'
}]

/**
 * 性别字典
 */
export const SEX_TYPE_DICT = [{
  value: 1,
  label: '女'
}, {
  value: 2,
  label: '男'
}]

/**
 * 全局通用状态字典
 */
export const COMMON_STATUS_DICT = [{
  value: 0,
  label: '正常'
}, {
  value: 1,
  label: '停用'
}]

export const CONFERENCE_EQUIPMENT_STATUS_DICT = [{
  value: 0,
  label: '空闲'
}, {
  value: 1,
  label: '使用中'
}, {
  value: 2,
  label: '损坏'
}]
