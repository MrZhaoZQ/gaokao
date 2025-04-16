<template>
	<view class="container">
		<view class="main">
			<image class="bg" src="https://xcx.yizhidahui.com/upload/imgs/promo.jpg" mode="widthFix"></image>
			<view class="generate" @click="generateFn"></view>
		</view>
		<!-- 微信小程序基础库2.9.0起支持一套新Canvas 2D接口（需指定type属性），同时支持同层渲染 -->
		<canvas type="2d" id="canvas"></canvas>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onShow } from '@dcloudio/uni-app';
	import { wxLogin, getUserInfo } from '@/api/user.js';
	// 生成的图片路径
	const createdImg = ref('')
	// 分享图片的数据
	const shareInfo = {
		title: 'AI雷达志愿',
		mpQrCode: '',
		bgImg: 'https://xcx.yizhidahui.com/upload/imgs/share.png',
		txts: ['1. 数据分析', '2. 快速答疑', '3. 精准建议', '4. 解决报考难题']
	};
	// 绘制网络图片（需先下载）
	const drawRemoteImage = (canvas, ctx, imgUrl, x, y, width, height, isCircle = false) => {
		return new Promise((resolve, reject) => {
			// 图片对象
			const image = canvas.createImage();
			// 设置图片src
			image.src = imgUrl;
			// 图片加载完成回调
			image.onload = () => {
				// 绘制图片
				if (isCircle) { // 圆形头像
					ctx.save();
					ctx.beginPath();
					ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
					ctx.clip();
					ctx.drawImage(image, x, y, width, height);
					ctx.restore();
				} else {
					ctx.drawImage(image, x, y, width, height);
				}
				resolve();
			};
			image.onerror = () => {
				console.error('图片下载失败:', imgUrl);
				reject('图片下载失败，请稍后重试');
			};
		});
	};
	// 画布转图片临时文件（可用image元素在页面预览）
	const canvasToTempFilePath = (canvas) => {
		uni.canvasToTempFilePath({
			canvas,
			success: (res) => {
				uni.hideLoading();
				createdImg.value = res.tempFilePath;
				// 将图片临时文件保存到相册
				save2albumFn();
			},
			fail: err => {
				console.error('生成失败:', err);
				uni.hideLoading();
				uni.showToast({
					title: '生成失败',
					icon: 'none'
				});
			}
		});
	};
	// 保存到相册
	const save2albumFn = () => {
		uni.saveImageToPhotosAlbum({
			filePath: createdImg.value,
			success: () => uni.showToast({
				title: '保存成功',
				mask: true,
				icon: 'success'
			}),
			fail: () => uni.showToast({
				title: '保存失败',
				mask: true,
				icon: 'none'
			})
		});
	};
	// 点击“生成”
	const generateFn = () => {
		uni.showLoading({
			title: '生成中...',
			mask: true
		});
		// 1. 获取画布元素并创建画布上下文
		uni.createSelectorQuery().select('#canvas').fields({
			node: true,
			size: true
		}).exec(res => {
			// console.log(res[0].node)
			if (res && res[0] && res[0].node) {
				// Canvas 对象
				const canvas = res[0].node;
				// 渲染上下文
				const ctx = canvas.getContext('2d');
				// Canvas 画布的实际绘制宽高
				const { width, height } = res[0];
				// 获取设备的像素比，乘上 canvas 的渲染大小，作为画布的逻辑大小（支付宝小程序内的key为pixelRatio）
				const { devicePixelRatio, pixelRatio, screenWidth } = uni.getSystemInfoSync();
				const dpr = devicePixelRatio || pixelRatio;
				// 屏幕宽度与UI图的宽度比，用来确定绘制位置、大小
				const ratio = screenWidth / 750;
				// 初始化画布大小
				canvas.width = width * dpr;
				canvas.height = height * dpr;
				ctx.scale(dpr, dpr);
				
				// 2. 绘制背景（网络图片需先下载）
				drawRemoteImage(canvas, ctx, shareInfo.bgImg, 0, 0, width, height).then(() => {
					
					// 3. 绘制标题
					// ctx.font = (36 * ratio) + 'px sans-serif';
					// ctx.fillStyle = '#262626';
					// ctx.fillText(shareInfo.title, 116 * ratio, 1346 * ratio);

					// 4. 绘制描述文字
					// ctx.font = (32 * ratio) + 'px sans-serif';
					// ctx.fillStyle = '#8b8b8b';
					// ctx.fillText(shareInfo.txts[0], 420 * ratio, 1120 * ratio);
					// ctx.fillText(shareInfo.txts[1], 420 * ratio, 1170 * ratio);
					// ctx.fillText(shareInfo.txts[2], 420 * ratio, 1220 * ratio);
					// ctx.fillText(shareInfo.txts[3], 420 * ratio, 1270 * ratio);

					// 5. 绘制二维码（需确保小程序码已生成）
					drawRemoteImage(canvas, ctx, shareInfo.mpQrCode, 180 * ratio , 866 * ratio, 390 * ratio, 390 * ratio, false).then(() => {
						// 6. 绘制完成，将 canvas 上的内容生成图片临时文件
						setTimeout(() => { // 确保渲染完成
							canvasToTempFilePath(canvas);
						}, 300);
					}, () => {
						uni.showToast({
							title: errMsg || '生成失败，请稍后重试',
							mask: true,
							icon: 'none'
						});
					});
				}, errMsg => {
					uni.showToast({
						title: errMsg || '生成失败，请稍后重试',
						mask: true,
						icon: 'none'
					});
				});
			} else {
				// 获取canvas元素失败
				console.log("获取canvas元素失败");
				uni.hideLoading();
				uni.showToast({
					title: '生成失败，请稍后重试',
					mask: true,
					icon: 'none'
				});
			}
		});
	};
	// 获取用户信息
	const getUserInfoFn = () => {
		getUserInfo().then(res => {
			// 当前用户的小程序码
			shareInfo.mpQrCode = res.inviteQrCode
		}, () => {
			getUserInfoFn();
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		getUserInfoFn();
	});
	// 监听页面显示
	onShow(() => {

	});
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		position: relative;

		#canvas {
			width: 750rpx;
			height: 1624rpx;
			position: absolute;
			left: 0;
			top: 0;
			pointer-events: none;
		}

		.main {
			width: 750rpx;
			height: 1624rpx;
			background-color: #ff9744;
			position: relative;
			left: 0;
			top: 0;

			.bg {
				width: 750rpx;
				height: 1624rpx;
				display: block;
			}

			.generate {
				width: 598rpx;
				height: 136rpx;
				position: absolute;
				left: 76rpx;
				bottom: 280rpx;
			}
		}
	}
</style>