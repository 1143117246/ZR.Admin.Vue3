import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 分页查询
 * @param {查询条件} data
 */
export function listEquipment(query) {
  return request({
    url: 'qms/equipment/list',
    method: 'get',
    params: query,
  })
}

/**
 * 新增
 * @param data
 */
export function addEquipment(data) {
  return request({
    url: 'qms/equipment/add',
    method: 'post',
    data: data,
  })
}
/**
 * 修改
 * @param data
 */
export function updateEquipment(data) {
  return request({
    url: 'qms/equipment/edit',
    method: 'put',
    data: data,
  })
}
/**
 * 获取详情
 * @param {Id}
 */
export function getEquipment(id) {
  return request({
    url: '/qms/equipment/' + praseStrZero(id),
    method: 'get'
  })
}

/**
 * 删除
 * @param {主键} pid
 */
export function delEquipment(pid) {
  return request({
    url: 'qms/equipment/' + pid,
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
    url: '/qms/equipment/changeStatus',
    method: 'put',
    data: data
  })
}
