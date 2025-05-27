import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 仓库信息分页查询
 * @param {查询条件} data
 */
export function listErpstore(query) {
  return request({
    url: 'qms/erpstore/list',
    method: 'get',
    params: query,
  })
}

/**
 * 新增仓库信息
 * @param data
 */
export function addErpstore(data) {
  return request({
    url: 'qms/erpstore/add',
    method: 'post',
    data: data,
  })
}
/**
 * 修改仓库信息
 * @param data
 */
export function updateErpstore(data) {
  return request({
    url: 'qms/erpstore/edit',
    method: 'put',
    data: data,
  })
}
/**
 * 获取仓库信息详情
 * @param {Id}
 */
export function getErpstore(id) {
  return request({
    url: 'qms/erpstore/' + praseStrZero(id),
    method: 'get'
  })
}

/**
 * 删除仓库信息
 * @param {主键} pid
 */
export function delErpstore(pid) {
  return request({
    url: 'qms/erpstore/' + pid,
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
	  url: '/qms/erpstore/changeStatus',
	  method: 'put',
	  data: data
	})
  }