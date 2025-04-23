<template>
	<uni-popup ref="privacyPopup" :mask-click="props.closable">
		<view class="privacy">
			<text class="title">用户隐私保护说明</text>
			<view class="context">
				欢迎使用AI智选志愿，请仔细阅读<text @click="toPrivacyPage" class="link">《小程序隐私保护指引》</text>。如您同意，请点击“同意”继续。
			</view>
			<view class="btns">
				<!-- #ifdef MP-WEIXIN -->
				<navigator class="btn exit" open-type="exit" target="miniProgram" hover-class="none">退出</navigator>
				<button class="btn" open-type="agreePrivacyAuthorization" @click="agree">同意</button>
				<!-- #endif -->
				
				<!-- #ifdef H5 -->
				<view class="btn disagree" @click="disagree">不同意</view>
				<view class="btn" @click="agree">同意</view>
				<!-- #endif -->
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import { ref, watch } from 'vue';
	const privacyPopup = ref('');
	const show = defineModel({ default: false });
	const props = defineProps({
		closable: {
			type: Boolean,
			default: false
		}
	});
	const emits = defineEmits(['agree']);
	const disagree = () => {
		show.value = false;
	};
	const agree = () => {
		show.value = false;
		emits('agree', true);
	};
	const toPrivacyPage = () => {
		uni.navigateTo({
			url: '/pages/user/privacy'
		});
	};
	watch(show, (value) => {
		value ? privacyPopup.value.open() : privacyPopup.value.close();
	});
</script>

<style lang="scss" scoped>
	.privacy {
		width: 600rpx;
		height: auto;
		box-sizing: border-box;
		padding: 40rpx;
		background-color: #fff;
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		.title {
			font-weight: bolder;
			font-size: 32rpx;
		}
		.context {
			padding: 30rpx 0 40rpx;
			.link {
				color: #3875fb;
			}
		}
		.btns {
			width: 100%;
			display: flex;
			justify-content: space-between;
			.btn {
				width: 246rpx;
				height: 68rpx;
				border-radius: 34rpx;
				background-color: #3875fb;
				color: #fff;
				text-align: center;
				line-height: 68rpx;
				&.disagree, &.exit {
					background-color: #cdcdcd;
				}
			}
		}
	}
</style>