import { request } from "./request"

/**
 * @description 获取费用套餐
 * @param {*} data 
 */
export function getPackageList(data) {
	return request({
		url: '/wechat/package/query',
		method: 'post',
		data
	})
}

/**
 * @description 创建订单
 * @param {*} data 
 */
export function createOrder(data) {
	return request({
		url: '/wechat/renew/create',
		method: 'post',
		data
	})
}

/**
 * @description 获取支付参数
 * @param {*} data 
 */
export function getPaymtData(data) {
	return request({
		url: '/wechat/pay',
		method: 'post',
		data
	})
}

/**
 * @description 获取订单列表（支付记录）
 * @param {*} data 
 */
export function getPaymtRecords(data) {
	return request({
		url: '/wechat/renew/query',
		method: 'post',
		data
	})
}

/**
 * @description 提现
 * @param {*} data 
 */
export function submitWithdraw(data) {
	return request({
		url: '/wechat/cash/create',
		method: 'post',
		data
	})
}

/**
 * @description 获取提现记录
 * @param {*} data 
 */
export function getWithdrawRecords(data) {
	return request({
		url: '/wechat/cash/query',
		method: 'post',
		data
	})
}