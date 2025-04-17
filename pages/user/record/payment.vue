<template>
	<view class="container">
		<view v-if="list.length" class="list">
			<view
				v-for="item in list"
				:key="item.id"
				class="item"
			>
				<view class="info">
					<view>{{item.name}}</view>
					<view>¥{{item.money}}</view>
				</view>
				<view class="time">{{item.time}}</view>
				<view class="orderNo">流水号：{{item.code}}</view>
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
	import { getPaymtRecords } from '@/api/order.js';
	const list = ref([]);
	const more = ref(true);
	let pageNum = 1, pageSize = 10, requesting = false;
	// 获取列表数据
	const getListFn = (refreshing) => {
		if (requesting) return;
		requesting = true;
		uni.showLoading({ mask: true });
		getPaymtRecords({
			page: refreshing ? 1 : pageNum,
			pageSize,
			status: 6 // 5: 待支付；6: 已支付；7: 已完成
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
					arr[i].name = JSON.parse(arr[i].packageIntro).name;
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
			padding: 16rpx 30rpx;
			background-color: #F6f6f6;
			border-radius: 38rpx;
			line-height: 40rpx;
			color: #8b8b8b;
			.info {
				margin: 2rpx 0;
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
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