import request from '@/utils/request'

/**
 * 新增检验标准模板
 * @param data
 */
export function addTemplate(data) {
  return request({
    url: 'qms/template/add',
    method: 'post',
    data: data,
  })
}

/**
 * 修改检验标准模板
 * @param data
 */
export function editTemplate(data) {
  return request({
    url: 'qms/template/edit',
    method: 'put',
    data: data,
  })
}

/**
 * 获取检验标准模板实体
 * @param query
 */
export function getTemplateInfo(query) {
  return request({
    url: 'qms/template/entity',
    method: 'get',
    params: query,
  })
}

/**
 * 删除验收标准模板
 * @param {主键} pid
 */
export function delTemplate(pid) {
  return request({
    url: '/qms/template/' + pid,
    method: 'delete'
  })
}
