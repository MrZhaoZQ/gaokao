// 配置域名
export const BASE_URL = "https://gxb.jmd-mall.com"
const LOGIN_URLS = ["/wechat/login/auth"]

/**
 * 请求
 */
export function request({url, data, method}) {
	data = data || {}
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		// 判断是否需要登录
		if (!token && !LOGIN_URLS.includes(url)) {
			// 重定向到首页走登录的逻辑
			console.log('need to login')
			return uni.reLaunch({
				url: '/pages/index/index'
			})
		}
		uni.request({
			url: url.indexOf("http") > -1 ? url : BASE_URL + url,
			data: data,
			method: method.toUpperCase(),
			header: {
				"content-type": "application/json; charset=utf-8",
				token: token || ''
			},
			dataType: "json",
			success: res => {
				// console.log("res: ", res)
				if (res.statusCode === 200 && res.errMsg == "request:ok") {
					if (res.data) {
						if (res.data.status === 209) { // errMsg: "token过期"
							return uni.removeStorage({
								key: 'token',
								complete: uni.reLaunch({
									url: '/pages/index/index'
								})
							})
						} else if (res.data.status === 200 && res.data.data) {
							resolve(res.data.data)
						} else {
							reject(res.data.errMsg || res.data.error)
						}
					} else {
						reject("数据异常，请稍后再试~")
					}
				} else {
					reject(res.data?.error || res.errMsg || "网络异常，请稍后再试~")
				}
			},
			fail: err => {
				// console.log("err:", err);
				reject(err.errMsg || "网络异常，请稍后再试");
			}
		})
	})
}