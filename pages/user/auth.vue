<template>
	
</template>

<script setup>
	import { onLoad, onShow } from '@dcloudio/uni-app';
	import { wxAuth } from '@/api/user.js';
	let code = '', refId = '';
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		if (options?.code) {
			code = options.code;
			refId = options.state || '';
			wxAuth(options).then(res => {
				uni.setStorage({
					key: 'token',
					data: res.token,
					complete: () => {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}
				});
				getApp().globalData.userId = res?.id || '';
			}, errMsg => {
				uni.showToast({
					title: errMsg || '授权失败，请稍后重试',
					mask: true,
					icon: "none"
				});
				setTimeout(() => {
					// 重定向到首页
					uni.reLaunch({
						url: '/pages/index/index?refId=' + refId
					});
				}, 1800);
			});
		} else {
			// 重新发起授权
			const REDIRECT_URI = encodeURIComponent('https://h5.yizhidahui.com/redirect.html');
			window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx62f5435c67d1a41c&redirect_uri='+ REDIRECT_URI +'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
		}
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		
	});
</script>

<style lang="scss" scoped>
</style>