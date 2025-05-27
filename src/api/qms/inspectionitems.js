import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 检验项目分页查询
 * @param {查询条件} data
 */
export function listInspectionitems(query) {
  return request({
    url: 'qms/inspectionitems/list',
    method: 'get',
    params: query,
  })
}
/**
 * 根据关键字查询数据，取前15条数据
 * @param {查询条件} data
 */
export function listbykeys(query) {
  return request({
    url: 'qms/inspectionitems/listbykeys',
    method: 'get',
    params: query,
  })
}

/**
 * 新增检验项目
 * @param data
 */
export function addInspectionitems(data) {
  return request({
    url: 'qms/inspectionitems/add',
    method: 'post',
    data: data,
  })
}
/**
 * 修改检验项目
 * @param data
 */
export function updateInspectionitems(data) {
  return request({
    url: 'qms/inspectionitems/edit',
    method: 'put',
    data: data,
  })
}
/**
 * 获取检验项目详情
 * @param {Id}
 */
export function getInspectionitems(id) {
  return request({
    url: '/qms/inspectionitems/' + praseStrZero(id),
    method: 'get'
  })
}

/**
 * 删除检验项目
 * @param {主键} pid
 */
export function delInspectionitems(pid) {
  return request({
    url: 'qms/inspectionitems/' + pid,
    method: 'delete'
  })
}

/**
 * 检验项目状态修改
 * @param {主键} Id
 * @param {状态} state
 */
export function changeStatus(Id, state) {
  const data = {
    Id,
    state
  }
  return request({
    url: '/qms/inspectionitems/changeStatus',
    method: 'put',
    data: data
  })
}
