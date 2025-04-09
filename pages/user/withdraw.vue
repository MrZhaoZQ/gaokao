<template>
	<view class="container">
		<view class="form">
			<view class="item">
				<view class="label">到账方式：</view>
				<view class="select">
					<view
						v-for="(item, index) in selectList"
						:key="index"
						:class="['option', index === selectedIdx ? 'active' : '']"
						@click="selectFn(index)"
					>
						<image :src="index === selectedIdx ? item.selectedIco : item.ico" mode="widthFix"></image>
						<text>{{item.name}}</text>
					</view>
				</view>
			</view>
			<view class="item">
				<view class="label">账号：</view>
				<input type="text" v-model="account" placeholder="请输入提现账号" />
			</view>
			<view class="item">
				<view class="label">姓名：</view>
				<input type="text" v-model="username" placeholder="请输入您的姓名" />
			</view>
			<view class="wrapper">
				<view class="label">提现金额</view>
				<view class="amount">
					<text class="cny">¥</text>
					<input type="number" v-model="amount" placeholder="请输入提现金额" />
				</view>
				<view class="notice">
					<view>可提现金额：¥{{total.toFixed(2)}}</view>
					<view class="withdraw-all" @click="withdrawAllFn">全部提现</view>
				</view>
			</view>
		</view>
		
		<view class="withdraw" @click="withdrawFn">提现</view>
		
		<view class="rules">
			<view class="withdraw-rules">提现规则：</view>
			<text>
				1. 最低提现金额：30元。\r\n
				2. 提现方式：支持支付宝、微信等多种方式。\r\n
				3. 提现时间：1-7天到账，具体因应用和银行而异。\r\n
				4. 提现限制：每周可提现一次。\r\n
				5. 账户要求：提现前需完成实名认证或绑定支付账户。\r\n
				6. 提现审核：提现申请可能需审核通过后才会处理。\r\n
			</text>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onShow } from '@dcloudio/uni-app';
	import { getUserInfo } from '@/api/user.js';
	import { submitWithdraw } from '@/api/order.js';
	const total = ref(0);
	const selectList = ref([
		{ ico: '/static/imgs/wechat1.png', selectedIco: '/static/imgs/wechat0.png', name: '微信' },
		{ ico: '/static/imgs/alipay1.png', selectedIco: '/static/imgs/alipay0.png', name: '支付宝' }
	]);
	const selectedIdx = ref(0);
	let pageShowTimes = 0;
	const account = ref('');
	const username = ref('');
	const amount = ref('');
	const selectFn = (idx) => {
		selectedIdx.value = idx;
	};
	const withdrawAllFn = () => {
		amount.value = total.value;
	};
	const withdrawFn = () => {
		const accountV = account.value;
		const usernameV = username.value;
		const amountV = amount.value;
		let msg = '';
		if (!accountV) msg = '请输入提现账号～';
		if (!usernameV) msg = '请输入您的姓名～';
		if (!amountV) msg = '请输入提现金额～';
		return uni.showToast({
			title: msg,
			mask: true,
			icon: "none"
		});
		uni.showLoading({ mask: true });
		submitWithdraw({
			"cashType": selectedIdx.value,
			"cashAccount": account.value,
			"cashName": username.value,
			"cashMoney": amount.value,
			"memo": ""
		}).then(res => {
			// console.log(res)
			uni.hideLoading();
			uni.showToast({
				title: '提现申请已提交成功~',
				mask: true,
				icon: 'success'
			});
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg || '信息提交失败，请稍后重试~',
				mask: true,
				icon: "none"
			});
		});
	};
	// 获取用户信息
	const getUserInfoFn = () => {
		uni.showLoading({ mask: true });
		getUserInfo().then(res => {
			uni.hideLoading();
			total.value = res?.account || 0;
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg || '获取用户信息失败，请稍后重试~',
				mask: true,
				icon: "none"
			});
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		getUserInfoFn();
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		pageShowTimes += 1;
		if (pageShowTimes > 1) {
			getUserInfoFn();
		}
	});
</script>

<style lang="scss" scoped>
	.form {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 25rpx;
		.item {
			width: 100%;
			margin-bottom: 30rpx;
			display: flex;
			align-items: center;
			.label {
				width: 156rpx;
				font-size: 30rpx;
				text-align: right;
				color: #8B8B8B;
			}
			.select {
				display: flex;
				.option {
					width: 240rpx;
					height: 72rpx;
					box-sizing: border-box;
					border-radius: 20rpx;
					border: 2rpx solid #DBDBDB;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 32rpx;
					&:first-child {
						margin-right: 20rpx;
					}
					image {
						width: 46rpx;
						height: auto;
						margin-right: 6rpx;
					}
				}
				.active {
					background-color: #0076FF;
					color: #FFFFFF;
				}
			}
			input {
				flex: 1;
				height: 72rpx;
				box-sizing: border-box;
				padding: 0 20rpx;
				border-radius: 20rpx;
				border: 2rpx #dbdbdb solid;
				line-height: 72rpx;
				font-size: 30rpx;
			}
		}
		.wrapper {
			width: 100%;
			height: auto;
			box-sizing: border-box;
			padding: 20rpx 50rpx;
			background: #FFFFFF;
			box-shadow: 2rpx 2rpx 12rpx 0rpx rgba(0,0,0,0.13);
			border-radius: 20rpx;
			.label {
				font-size: 32rpx;
			}
			.amount {
				width: 100%;
				box-sizing: border-box;
				margin-bottom: 20rpx;
				padding: 80rpx 0 40rpx;
				border-bottom: 2rpx solid #979797;
				display: flex;
				align-items: flex-end;
				.cny {
					margin-right: 10rpx;
					font-weight: 600;
					font-size: 68rpx;
					line-height: 68rpx;
				}
				input {
					flex: 1;
					font-size: 32rpx;
				}
			}
			.notice {
				display: flex;
				align-items: center;
				color: #8B8B8B;
				.withdraw-all {
					padding-left: 20rpx;
					color: #0076FF;
				}
			}
		}
	}
	
	.withdraw {
		width: 700rpx;
		height: 88rpx;
		margin: 20rpx auto;
		border-radius: 44rpx;
		background-color: #3875fb;
		text-align: center;
		line-height: 88rpx;
		font-weight: 600;
		font-size: 30rpx;
		color: #ffffff;
	}
	
	.rules {
		width: 100%;
		box-sizing: border-box;
		padding: 60rpx 50rpx 20rpx;
		color: #8B8B8B;
		.withdraw-rules {
			font-weight: bolder;
			margin-bottom: 20rpx;
		}
	}
</style>