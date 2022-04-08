import request from '@/utils/request'

const baseUrl = '/recycleFile'

// 回收站 —— 文件列表分页查询
export function getRecycleFileList(listQuery) {
  return request({
    url: baseUrl,
    method: 'get',
    params: listQuery
  })
}
