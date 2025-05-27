import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 产品信息分页查询
 * @param {查询条件} data
 */
export function listProductinfo(query) {
	return request({
		url: 'qms/Productinfo/list',
		method: 'get',
		params: query,
	})
}

/**
 * 产品信息tree查询
 * @param {查询条件} data
 */
export function treelistProductinfo(query) {
	return request({
		url: 'qms/Productinfo/treelist',
		method: 'get',
		params: query,
	})
}
/**
 * 新增产品信息
 * @param data
 */
export function addProductinfo(data) {
	return request({
		url: 'qms/Productinfo/add',
		method: 'post',
		data: data,
	})
}
/**
 * 修改产品信息
 * @param data
 */
export function updateProductinfo(data) {
	return request({
		url: 'qms/Productinfo/edit',
		method: 'put',
		data: data,
	})
}
/**
 * 获取产品信息详情
 * @param {Id}
 */
export function getProductinfo(id) {
	return request({
		url: 'qms/Productinfo/' + + praseStrZero(id),
		method: 'get'
	})
}

/**
 * 删除产品信息
 * @param {主键} pid
 */
export function delProductinfo(pid) {
	return request({
		url: 'qms/Productinfo/' + pid,
		method: 'delete'
	})
}

/**
 * 产品状态修改
 * @param {主键} Id
 * @param {状态} state
 */
export function changeStatus(Id, state) {
	const data = {
		Id,
		state
	}
	return request({
		url: '/qms/Productinfo/changeStatus',
		method: 'put',
		data: data
	})
}
