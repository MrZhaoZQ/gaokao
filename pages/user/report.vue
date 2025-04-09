<template>
	<view class="container">
		<view v-if="list.length" class="list">
			<view
				v-for="item in list"
				:key="item.id"
				class="item"
				@click="viewReportFn(item.pdfFile)"
			>
				<image class="pdf" src="/static/imgs/pad.png" mode="widthFix"></image>
				<view class="info">
					<view class="time">{{item.time}}</view>
					<view class="title">{{item.question}}</view>
				</view>
			</view>
			<view v-if="!more" class="no-more">
				<image class="img" src="/static/imgs/no-more.png" mode="widthFix"></image>
				<text>哇哦，没有更多了~</text>
			</view>
		</view>
		<view v-else class="empty">
			<image class="img" src="/static/imgs/empty.png" mode="widthFix"></image>
			<view class="txt">哇，您还没有此项内容哦~</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
	import { getReportList } from '@/api/user.js';
	const list = ref([]);
	const more = ref(true);
	let pageNum = 1, pageSize = 10, requesting = false;
	// 获取列表数据
	const getListFn = (refreshing) => {
		if (requesting) return;
		requesting = true;
		uni.showLoading({ mask: true });
		getReportList({
			page: refreshing ? 1 : pageNum,
			pageSize,
		}).then(res => {
			requesting = false;
			uni.hideLoading();
			if (refreshing) uni.stopPullDownRefresh();
			if (res.records) {
				// 下拉刷新时重置数据和标识
				if (refreshing) {
					let len = list.value.length;
					list.value.splice(0, len);
					pageNum = 1;
					more.value = true;
				}
				// 处理数据和标识
				const arr = res.records || [];
				for (const i in arr) {
					arr[i].time = new Date(arr[i].createTime).toLocaleString('zh-CN', { hour12: false });
					list.value.push(arr[i]);
				}
				if (arr.length < pageSize) {
					more.value = false;
				} else {
					pageNum += 1;
				}
				// console.log(pageNum, more.value, list.value)
			} else {
				uni.showToast({
					title: res?.errmsg || '获取列表失败，请稍后重试',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			requesting = false;
			uni.hideLoading();
			if (refreshing) uni.stopPullDownRefresh();
			uni.showToast({
				title: errMsg || '获取列表失败，请稍后重试',
				mask: true,
				icon: "none"
			});
		});
	};
	// 查看报告
	const viewReportFn = (pdfUrl) => {
		uni.showLoading({ mask: true });
		uni.downloadFile({
			url: pdfUrl,
			success: res => {
				uni.openDocument({
					filePath: res.tempFilePath,
					fileType: 'pdf',
					showMenu: true,
					success: () => {
						uni.hideLoading();
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({
							title: '打开报告失败，请稍后重试',
							mask: true,
							icon: 'none'
						});
					}
				});
			},
			fail: () => {
				uni.hideLoading();
				uni.showToast({
					title: '加载报告失败，请稍后重试',
					mask: true,
					icon: 'none'
				});
			}
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		getListFn(false);
	});
	// 监听页面刷新
	onPullDownRefresh(() => {
		getListFn(true);
	});
	// 监听页面滚动到底部
	onReachBottom(() => {
		if (more.value) {
			getListFn(false);
		}
	});
</script>

<style lang="scss" scoped>
	.list {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 25rpx;
		.item {
			width: 100%;
			height: auto;
			margin-bottom: 22rpx;
			box-sizing: border-box;
			padding: 20rpx;
			border-radius: 38rpx;
			box-shadow: 2rpx 2rpx 12rpx 0rpx rgba(0,0,0,0.13);
			display: flex;
			justify-content: space-between;
			align-items: center;
			.pdf {
				width: 132rpx;
				height: auto;
				margin-right: 15rpx;
			}
			.info {
				flex: 1;
				.time {
					margin-bottom: 2rpx;
					color: #8b8b8b;
				}
				.title {
					width: 100%;
					display: -webkit-box;
					overflow: hidden;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					text-overflow: ellipsis;
				}
			}
		}
		.no-more {
			width: 100%;
			padding: 30rpx 0;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #d1d1d1;
			.img {
				width: 46rpx;
				height: auto;
				margin-right: 10rpx;
			}
		}
	}
	
	.empty {
		width: 100%;
		box-sizing: border-box;
		padding: 26vh 25rpx 0;
		text-align: center;
		font-size: 32rpx;
		.img {
			width: 296rpx;
			height: auto;
			margin-bottom: 100rpx;
		}
		.txt {
			color: #d1d1d1;
		}
	}
</style>