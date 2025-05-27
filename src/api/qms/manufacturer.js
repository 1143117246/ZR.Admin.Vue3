import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 生产厂家分页查询
 * @param {查询条件} data
 */
export function listManufacturer(query) {
	return request({
		url: 'qms/Manufacturer/list',
		method: 'get',
		params: query,
	})
}

/**
 * 新增生产厂家
 * @param data
 */
export function addManufacturer(data) {
	return request({
		url: 'qms/Manufacturer/add',
		method: 'post',
		data: data,
	})
}
/**
 * 修改生产厂家
 * @param data
 */
export function updateManufacturer(data) {
	return request({
		url: 'qms/Manufacturer/edit',
		method: 'put',
		data: data,
	})
}
/**
 * 获取生产厂家详情
 * @param {Id}
 */
export function getManufacturer(id) {
	return request({
		url: 'qms/Manufacturer/' + praseStrZero(id),
		method: 'get'
	})
}

/**
 * 删除生产厂家
 * @param {主键} pid
 */
export function delManufacturer(pid) {
	return request({
		url: 'qms/Manufacturer/' + pid,
		method: 'delete'
	})
}

/**
 * 生产厂商状态修改
 * @param {主键} Id
 * @param {状态} state
 */
export function changeStatus(Id, state) {
	const data = {
		Id,
		state
	}
	return request({
		url: '/qms/Manufacturer/changeStatus',
		method: 'put',
		data: data
	})
}
