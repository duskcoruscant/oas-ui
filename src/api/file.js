import request from '@/utils/request'

const baseUrl = '/file'

// 文件列表分页查询
export function getFileList(listQuery) {
  return request({
    url: baseUrl,
    method: 'get',
    params: listQuery
  })
}

// 创建文件夹
export function createFolder(data) {
  return request({
    url: baseUrl + '/createFolder',
    method: 'post',
    data
  })
}

// 重命名文件
export function renameFile(data) {
  return request({
    url: baseUrl + '/rename',
    method: 'put',
    data
  })
}

// 下载文件
export function downloadFile(id) {
  return request({
    url: baseUrl + '/download/' + id,
    method: 'get',
    responseType: 'blob'
  })
}

// 上传文件
export function uploadFiles(data) {
  return request({
    url: baseUrl + '/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 删除文件 —— 将文件移入回收站
export function removeFileToRecycleBin(id) {
  return request({
    url: baseUrl + '/' + id,
    method: 'delete'
  })
}
