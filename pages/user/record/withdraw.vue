<template>
	<view class="container">
		<view class="header">
			<view @click="changeVisibleFn">
				<text class="account">我的资产(元)</text>
				<uni-icons :type="visible ? 'eye' : 'eye-slash'" size="32rpx" color="#ffffff"></uni-icons>
			</view>
			<view v-if="visible" class="total">{{total.toFixed(2)}}</view>
			<view v-else class="total">******</view>
			<view class="withdraw" @click="toWithdrawFn">提现</view>
		</view>
		
		<view class="subtitle">提现记录</view>
		
		<view v-if="list.length" class="list">
			<view
				v-for="item in list"
				:key="item.transactionId"
				class="item"
			>
				<view class="left">
					<view class="platform">提现到{{item.cashType == 1 ? '支付宝' : '微信'}}</view>
					<view class="time">{{item.time}}</view>
					<view class="orderNo">流水号：{{item.code}}</view>
				</view>
				<view class="right">
					<view class="amount">-¥{{item.cashMoney.toFixed(2)}}</view>
					<view :class="['status', item.status === 1 ? 'received' : '']">{{item.status === 1 ? '已到账' : '审核中'}}</view>
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
	import { getUserInfo } from '@/api/user.js';
	import { getWithdrawRecords } from '@/api/order.js';
	const visible = ref(true);
	const total = ref(0);
	const list = ref([]);
	const more = ref(true);
	let pageNum = 1, pageSize = 10, requesting = false;
	// 获取列表数据
	const getListFn = (refreshing) => {
		if (requesting) return;
		requesting = true;
		uni.showLoading({ mask: true });
		getWithdrawRecords({
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
	// 金额是否可见
	const changeVisibleFn = () => {
		visible.value = !visible.value;
	};
	// 点击“提现”
	const toWithdrawFn = () => {
		uni.navigateTo({
			url: '/pages/user/withdraw'
		});
	};
	// 获取用户信息
	const getUserInfoFn = () => {
		uni.showLoading({ mask: true });
		getUserInfo().then(res => {
			total.value = res?.account || 0;
			// 获取提现记录
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
		width: 700rpx;
		height: 362rpx;
		margin: 0 auto 20rpx;
		background: linear-gradient( 143deg, rgba(0,118,255,0.91) 0%, rgba(0,63,255,0.81) 46%, rgba(0,27,255,0.81) 100%);
		border-radius: 38rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: #fff;
		text-align: center;
		.account {
			margin-right: 10rpx;
		}
		.total {
			padding: 10rpx 0 40rpx;
			font-weight: 600;
			font-size: 62rpx;
		}
		.withdraw {
			width: 232rpx;
			height: 76rpx;
			background-color: #F4F9FF;
			border-radius: 20rpx;
			color: #469AFB;
			line-height: 76rpx;
			font-weight: bolder;
		}
	}
	
	.subtitle {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 25rpx 0;
		font-size: 32rpx;
		font-weight: bolder;
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
			padding: 16rpx 0rpx;
			border-bottom: 2rpx #f6f6f6 solid;
			display: flex;
			justify-content: space-between;
			align-items: center;
			&:first-child {
				border-top: 2rpx #f6f6f6 solid;
			}
			.left {
				flex: 1;
				color: #8b8b8b;
				.platform {
					margin: 2rpx 0;
					font-size: 32rpx;
					color: #333;
				}
			}
			.right {
				min-width: 146rpx;
				margin-left: 20rpx;
				text-align: right;
				.amount {
					font-weight: bolder;
					font-size: 32rpx;
				}
				.status {
					color: #FF6501;
					&.received {
						color: #469AFB;
					}
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
		padding: 10vh 25rpx 0;
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