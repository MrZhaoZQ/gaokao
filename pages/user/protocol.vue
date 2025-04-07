<template>
	<view>
		<web-view src="https://gxb.admin.jmd-mall.com/protocol.html"></web-view>
	</view>
</template>

<script setup>
	import { onLoad, onShow } from '@dcloudio/uni-app';
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		// uni.downloadFile({
		// 	url: 'https://health.image.jmd-mall.com/gxb/upload/protocol.pdf',
		// 	success: res => {
		// 		const filePath = res.tempFilePath;
		// 		uni.openDocument({
		// 			filePath: filePath,
		// 			fileType: 'pdf',
		// 			showMenu: true,
		// 			success: () => {
		// 				console.log('打开协议成功');
		// 			},
		// 			fail: () => {
		// 				uni.showToast({
		// 					title: '打开协议失败，请稍后重试～',
		// 					mask: true,
		// 					icon: 'none'
		// 				});
		// 			}
		// 		});
		// 	},
		// 	fail: () => {
		// 		uni.showToast({
		// 			title: '加载协议失败，请稍后重试～',
		// 			mask: true,
		// 			icon: 'none'
		// 		});
		// 	}
		// });
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		
	});
</script>

<style lang="scss" scoped>
</style>