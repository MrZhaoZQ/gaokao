import wxjs from 'weixin-js-sdk'
import { wxConfig } from '@/api/user.js'

// 判断当前H5是否在微信内打开
const isWechat = /micromessenger/i.test(navigator.userAgent)

export function initWxJsSDK() {
	if (!isWechat) return uni.showModal({
		title: '温馨提示',
		content: '请在微信中打开当前页面',
		showCancel: false,
		success: () => {}
	})
	
	wxConfig({url: location.href}).then(res => {
		wxjs.config({
			debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			appId: 'wx62f5435c67d1a41c', // 必填，公众号的唯一标识
			timestamp: res.timestamp, // 必填，生成签名的时间戳
			nonceStr: res.nonceStr, // 必填，生成签名的随机串
			signature: res.signature,// 必填，签名
			jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData', 'chooseWXPay'] // 必填，需要使用的JS接口列表
		})
	}, () => {
		
	})
	
	// config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行
	wxjs.ready((res) => {
		// console.log('wx config success')
		// 配置分享内容
		const shareData = {
			title: 'AI智选志愿', // 分享标题
			desc: '择校启航，决胜未来！精准报考，梦想扬帆！', // 分享描述
			link: 'https://h5.yizhidahui.com/#/?refId=' + getApp().globalData.userId, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: 'https://h5.yizhidahui.com/static/imgs/logo.png', // 分享图标
			success: () => {},
			fail: () => {}
		}
		// 分享给朋友
		wxjs.updateAppMessageShareData(shareData)
		// 分享到朋友圈
		wxjs.updateTimelineShareData(shareData)
	})
	
	// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
	wxjs.error( err => {
		console.log(err)
	})
}


// 1.weixinjsbridge.invoke()出现的版本更早，无需引用jssdk，无需使用wx.config方法注入，需要appId参数；
//   而wx.choosewxpay出现的版本比较晚，需要jssdk注入，不需要参数appId。
// 2.weixinjsbridge.invoke()是微信浏览器的内置方法，只能在微信浏览器内部使用；
//   其实wx.choosewxpay在引用的微信jssdk文件中，也调用了weixinjsbridge.invoke()，是对weixinjsbridge.invoke() 的再次封装。
export const wxPay = wxjs.chooseWXPay
// wxPay({
// 	timeStamp: res.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
// 	nonceStr: res.nonceStr, // 支付签名随机串，不长于 32 位
// 	package: res.packageVal, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
// 	signType: res.signType, // 微信支付V3的传入RSA,微信支付V2的传入格式与V2统一下单的签名格式保持一致
// 	paySign: res.paySign, // 支付签名
// 	success: () => {
// 		// 支付成功
// 	},
// 	fail: () => {
// 		// 支付失败
// 	}
// })
