<template>
	<view class="container">
		<view v-if="list.length" class="header">
			<view class="total">累计获得奖励：<text class="num">{{total.toFixed(2)}}</text><text>元</text></view>
			<view class="withdraw" @click="toWithdrawFn">提现</view>
		</view>
		
		<view v-if="list.length" class="list">
			<view
				v-for="item in list"
				:key="item.id"
				class="item"
			>
				<!-- #ifdef MP-WEIXIN -->
				<image class="avatar" src="/static/imgs/user.png" mode="widthFix"></image>
				<!-- #endif -->
				
				<!-- #ifdef H5 -->
				<image class="avatar" :src="item.headerImg || './static/imgs/user.png'" mode="widthFix"></image>
				<!-- #endif -->
				<view class="info">
					<view>{{item.nickName || '微信用户'}}</view>
					<view class="time">注册时间：{{item.time}}</view>
				</view>
				<view class="reward">
					<view class="amount">+<text class="num">{{item.money}}</text>元</view>
					<view class="type">红包奖励</view>
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
	import { getUserInfo, getRewardRecords } from '@/api/user.js';
	const total = ref(0);
	const list = ref([]);
	const more = ref(true);
	let pageNum = 1, pageSize = 10, requesting = false;
	// 获取列表数据
	const getListFn = (refreshing) => {
		if (requesting) return;
		requesting = true;
		uni.showLoading({ mask: true });
		getRewardRecords({
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
					arr[i].time = arr[i].createTime ? new Date(arr[i].createTime).toLocaleString('zh-CN', { hour12: false }) : '';
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
	// 获取用户信息
	const getUserInfoFn = () => {
		uni.showLoading({ mask: true });
		getUserInfo().then(res => {
			total.value = res?.bonusTotal || 0;
			// 获取奖励记录
			getListFn(false);
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg || '获取用户信息失败，请稍后重试',
				mask: true,
				icon: "none"
			});
		});
	};
	// 点击“提现”
	const toWithdrawFn = () => {
		uni.navigateTo({
			url: '/pages/user/withdraw'
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		// 获取用户信息
		getUserInfoFn();
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
	.header {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 25rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 30rpx;
		.total {
			color: #8b8b8b;
			text {
				color: #FF6501;
				font-weight: 600;
			}
			.num {
				font-size: 56rpx;
				line-height: 56rpx;
			}
		}
		.withdraw {
			width: 192rpx;
			height: 70rpx;
			background: #0076FF;
			border-radius: 20rpx;
			// opacity: 0.3;
			text-align: center;
			line-height: 70rpx;
			font-weight: 600;
			color: #ffffff;
		}
	}
	
	.list {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 25rpx;
		.item {
			width: 100%;
			height: auto;
			margin-bottom: 22rpx;
			box-sizing: border-box;
			padding: 16rpx 20rpx;
			background-color: #F6f6f6;
			border-radius: 38rpx;
			display: flex;
			align-items: center;
			.avatar {
				width: 92rpx;
				height: auto;
			}
			.info {
				flex: 1;
				box-sizing: border-box;
				padding: 0 15rpx;
				font-size: 30rpx;
				font-weight: 600;
				.time {
					font-size: 26rpx;
					font-weight: normal;
					color: #8b8b8b;
				}
			}
			.reward {
				min-width: 120rpx;
				height: auto;
				.amount {
					color: #FF6501;
					font-weight: 600;
					.num {
						font-size: 36rpx;
					}
				}
				.type {
					color: #8b8b8b;
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