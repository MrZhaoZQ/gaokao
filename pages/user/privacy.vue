<template>
	<view>
		<web-view src="https://admin.yizhidahui.com/privacy.html"></web-view>
	</view>
</template>

<script setup>
	import { onLoad, onShow } from '@dcloudio/uni-app';
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		
	});
</script>

<style lang="scss" scoped>
</style>