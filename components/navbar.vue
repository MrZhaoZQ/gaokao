<template>
	<view class="navbar" :style="[styleObj]">
		<image
			class="left-icon"
			src="../static/imgs/menu.png"
			mode="widthFix"
			@click="clickMenuFn"
		></image>
		<view class="title">AI雷达志愿</view>
		<view class="placeholder"></view>
	</view>
</template>

<script setup>
	import { onMounted, ref } from 'vue';
	const styleObj = ref({
		'height': '44px',
		'top': '24px'
	});
	const emits = defineEmits(['clickMenu']);
	const clickMenuFn = () => {
		emits('clickMenu');
	};
	onMounted(() => {
		const { height, top } = uni.getMenuButtonBoundingClientRect();
		if (height && top) {
			styleObj.value = {
				'height': height + 'px',
				// 'top': top + 'px'
				'padding-top': top + 'px',
				'padding-bottom': '10px'
			}
		}
	});
</script>

<style lang="scss" scoped>
	.navbar {
		width: 100%;
		// position: fixed;
		position: sticky;
		z-index: 88;
		left: 0;
		top: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #ffffff;
	}
	.title {
		font-size: 32rpx;
		font-weight: bolder;
		color: #737373;
	}
	.left-icon, .placeholder {
		width: 56rpx;
		padding: 0 5px;
	}
</style>