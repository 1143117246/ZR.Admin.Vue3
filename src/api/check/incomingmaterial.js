import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 来料质检单分页查询
 * @param {查询条件} data
 */
export function listIncomingmaterial(query) {
	return request({
		url: 'check/Incomingmaterial/list',
		method: 'get',
		params: query,
	})
}

/**
 * 新增来料质检单
 * @param data
 */
export function addIncomingmaterial(data) {
	return request({
		url: 'check/Incomingmaterial',
		method: 'post',
		data: data,
	})
}
/**
 * 修改来料质检单
 * @param data
 */
export function updateIncomingmaterial(data) {
	return request({
		url: 'check/Incomingmaterial',
		method: 'PUT',
		data: data,
	})
}
/**
 * 获取来料质检单详情
 * @param {Id}
 */
export function getIncomingmaterial(id) {
	return request({
		url: 'check/Incomingmaterial/' + id,
		method: 'get'
	})
}

/**
 * 删除来料质检单
 * @param {主键} pid
 */
export function delIncomingmaterial(pid) {
	return request({
		url: 'check/Incomingmaterial/delete/' + pid,
		method: 'POST'
	})
}
