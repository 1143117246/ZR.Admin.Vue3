import request from '@/utils/request'
import { praseStrZero } from '@/utils/ruoyi'

/**
 * 产品分类分页查询
 * @param {查询条件} data
 */
export function listproductcategory(query) {
	return request({
		url: 'qms/productcategory/list',
		method: 'get',
		params: query,
	})
}

/**
 * 新增产品分类
 * @param data
 */
export function addproductcategory(data) {
	return request({
		url: 'qms/productcategory/add',
		method: 'post',
		data: data,
	})
}
/**
 * 修改产品分类
 * @param data
 */
export function updateproductcategory(data) {
	return request({
		url: 'qms/productcategory/edit',
		method: 'put',
		data: data,
	})
}

/**
 * 获取产品分类详情
 * @param {Id}
 */
export function getproductcategory(id) {
	return request({
		url: 'qms/productcategory/' + praseStrZero(id),
		method: 'get'
	})
}

/**
 * 删除产品分类
 * @param {主键} pid
 */
export function delproductcategory(pid) {
	return request({
		url: 'qms/productcategory/' + pid,
		method: 'delete'
	})
}

/**
 * 产品分类状态修改
 * @param {主键} Id
 * @param {状态} state
 */
export function changeStatus(Id, state) {
	const data = {
		Id,
		state
	}
	return request({
		url: '/qms/productcategory/changeStatus',
		method: 'put',
		data: data
	})
}

// 查询部门下拉树结构
export function treeselect() {
	return request({
		url: '/qms/productcategory/treeselect',
		method: 'get'
	})
}
