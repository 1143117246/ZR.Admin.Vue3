import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 班组信息分页查询
 * @param {查询条件} data
 */
export function listErpsteam(query) {
  return request({
    url: 'qms/erpteam/list',
    method: 'get',
    params: query,
  })
}

/**
 * 新增班组信息
 * @param data
 */
export function addErpsteam(data) {
  return request({
    url: 'qms/erpteam/add',
    method: 'post',
    data: data,
  })
}
/**
 * 修改班组信息
 * @param data
 */
export function updateErpsteam(data) {
  return request({
    url: 'qms/erpteam/edit',
    method: 'put',
    data: data,
  })
}
/**
 * 获取班组信息详情
 * @param {Id}
 */
export function getErpsteam(id) {
  return request({
    url: 'qms/erpteam/' + praseStrZero(id),
    method: 'get'
  })
}

/**
 * 删除班组信息
 * @param {主键} pid
 */
export function delErpsteam(pid) {
  return request({
    url: 'qms/erpteam/' + pid,
    method: 'delete'
  })
}


/**
 * 检测设备状态修改
 * @param {主键} Id
 * @param {状态} state
 */
export function changeStatus(Id, state) {
  const data = {
    Id,
    state
  }
  return request({
    url: '/qms/erpsteam/changeStatus',
    method: 'put',
    data: data
  })
}