import { request } from "./request"

/**
 * @description 微信小程序登录
 * @param {*} data 
 */
export function wxLogin(data) {
	return request({
		url: '/wechat/login/auth',
		method: 'post',
		data
	})
}

/**
 * @description 获取用户信息
 * @param {*} data 
 */
export function getUserInfo(data) {
	return request({
		url: '/wechat/user/info',
		method: 'post',
		data
	})
}

/**
 * @description 更新用户信息
 * @param {*} data 
 */
export function updateUserInfo(data) {
	return request({
		url: '/wechat/user/update',
		method: 'post',
		data
	})
}

/**
 * @description 获取微信手机号
 * @param {*} data 
 */
export function getWxPhone(data) {
	return request({
		url: '/wechat/getUserMobile',
		method: 'post',
		data
	})
}

/**
 * @description 绑定手机号
 * @param {*} data 
 */
export function bindPhone(data) {
	return request({
		url: '/wechat/login/bind',
		method: 'post',
		data
	})
}

/**
 * @description 获取推广记录
 * @param {*} data 
 */
export function getPromoRecords(data) {
	return request({
		url: '/wechat/user/query',
		method: 'post',
		data
	})
}

/**
 * @description 获取奖励记录
 * @param {*} data 
 */
export function getRewardRecords(data) {
	return request({
		url: '/wechat/user/account/log/query',
		method: 'post',
		data
	})
}

/**
 * @description 获取报告列表
 * @param {*} data 
 */
export function getReportList(data) {
	return request({
		url: '/wechat/report/query',
		method: 'post',
		data
	})
}