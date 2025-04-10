<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<navbar @clickMenu="clickMenuFn"></navbar>
		
		<!-- 隐私弹框 -->
		<privacy v-model="showPrivacy" @agree="mpLogin"></privacy>
		
		<!-- 左侧“个人中心”侧滑菜单 -->
		<uni-drawer ref="menuDrawer" mode="left" :mask-click="true">
			<scroll-view class="mine-list" style="height: 100%;" scroll-y>
				<image class="avatar" src="/static/imgs/user.png" mode="widthFix"></image>
				<view 
					v-for="(item, index) in mine"
					:key="index"
					class="mine-item"
					@click="clickMenuItemFn(index)"
				>
					<image class="ico" :src="item.ico" mode="widthFix"></image>
					<text>{{item.name}}</text>
				</view>
			</scroll-view>
		</uni-drawer>
		
		<!-- 欢迎内容 -->
		<view v-if="!sent" class="welcome">
			<view class="content">
				<image class="logo" src="/static/imgs/logo.png" mode="widthFix"></image>
				<text class="subtitle">嗨! 我是 AI雷达志愿 ~</text>
				<view class="introduction">我可以帮你报考分析、答疑、建议, 请把你的任务交给我吧 ~</view>
			</view>
		</view>
		
		<!-- 主要内容 -->
		<view v-else class="main">
			<view class="list">
				<view v-for="(item, index) in list" :key="index">
					<view v-if="item.type === 1" class="user">{{item.context}}</view>
					<view v-else class="ai">
						<image class="avatar" src="/static/imgs/ai_avatar.png" mode="widthFix"></image>
						<view class="result">
							<view class="context" v-if="item.context">
								<rich-text :nodes="item.context"></rich-text>
							</view>
							<view v-if="item.output" class="thinking"></view>
							<view v-else class="wrapper">
								<view class="notice">
									<view class="uicon">
										<uni-icons type="info" size="32rpx" color="#e27b26"></uni-icons>
									</view>
									<text class="txt">本回答由 AI 生成，内容仅供参考。</text>
								</view>
								<view v-if="item.hasReport" class="create-pdf" @click="createPDF(item.msgKey)">
									<image class="pdf" src="/static/imgs/pdf_ico.png" mode="widthFix"></image>
									<text>生成PDF</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 购买弹窗 -->
		<uni-popup ref="purchasePopup" type="bottom" :mask-click="true">
			<view class="purchase">
				<view class="subtitle">会员套餐</view>
				<view class="pack-info">
					<image class="member" src="../../static/imgs/ai_memb.png" mode="widthFix"></image>
					<view class="info">
						<view class="tag">限时优惠</view>
						<view class="price">¥<text class="num">{{membPackage.discountPrice}}</text></view>
						<view class="discount">已经优惠¥{{membPackage.marketPrice}}</view>
					</view>
					<view class="expiration">{{membPackage.tips}}</view>
				</view>
				<view class="highlights">
					<view
						v-for="(item, index) in highlights"
						:key="index"
						class="highlight"
					>
						<image :src="item.ico" mode="widthFix"></image>
						<view>{{item.txt}}</view>
						<text>{{item.sub}}</text>
					</view>
				</view>
				<view class="buy" @click="buyFn">确认协议并支付</view>
				<view class="checkbox">
					<radio :checked="checked" color="#0076FF" style="transform: scale(0.7)" @click="checkedFn" />
					<view>我已阅读并同意 <text class="protocol" @click="toProtocolFn">Ai雷达志愿会员服务协议</text> </view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 固定底部 -->
		<view class="footer">
			<view class="sendable">
				<textarea
					class="inpt"
					type="text"
					v-model="msg"
					:disabled="!sendable"
					auto-height
					disable-default-padding
					placeholder="给AI雷达志愿发送消息"
				></textarea>
				<image
					class="send"
					:src="thinking ? '../../static/imgs/send_pause.png' : '../../static/imgs/send.png'"
					mode="widthFix"
					@click="sendFn"
				></image>
			</view>
			<view v-if="!sendable" class="unable" @click="showBuyPopupFn"></view>
		</view>
	</view>
</template>

<script setup>
	import privacy from '@/components/privacy.vue';
	import navbar from '@/components/navbar.vue';
	import { ref, nextTick } from 'vue';
	import { onLoad, onReady, onShow, onUnload } from '@dcloudio/uni-app';
	import { wxLogin, getUserInfo, getPdfReport } from '@/api/user.js';
	import { getPackageList, createOrder, getPaymtData } from '@/api/order.js';
	import { randomString } from '@/utils/tool.js';
	const showPrivacy = ref(false);
	const menuDrawer = ref('');
	const mine = ref([
		{'ico': '../../static/imgs/qrcode.png', 'name': '专属二维码', 'path': '/pages/user/qrcode'},
		{'ico': '../../static/imgs/promos.png', 'name': '推广记录', 'path': '/pages/user/record/promos'},
		{'ico': '../../static/imgs/reward.png', 'name': '奖励记录', 'path': '/pages/user/record/reward'},
		{'ico': '../../static/imgs/withdraw.png', 'name': '提现', 'path': '/pages/user/record/withdraw'},
		{'ico': '../../static/imgs/report.png', 'name': '我的报告', 'path': '/pages/user/report'},
		{'ico': '../../static/imgs/paymt.png', 'name': '支付记录', 'path': '/pages/user/record/payment'},
		{'ico': '../../static/imgs/channel.png', 'name': '购买渠道', 'path': ''},
		{'ico': '../../static/imgs/version.png', 'name': '版本信息（V1.0）', 'path': '/pages/user/version'},
	]);
	const msg = ref('');
	const sendable = ref(false); // 已付费用户才可发送消息
	const sent = ref(false); // 已发送则不展示welcome，展示main
	const thinking = ref(false); // 当前是否正在等待AI返回结果
	const purchasePopup = ref('');
	const membPackage = ref({});
	const highlights = ref([
		{ 'ico': '../../static/imgs/feat1.png', 'txt': '有效期', 'sub': '6个月有效期' },
		{ 'ico': '../../static/imgs/feat2.png', 'txt': '不限次数', 'sub': '不限评估次数' },
		{ 'ico': '../../static/imgs/feat3.png', 'txt': '一键生成', 'sub': '一键生成PDF报告' }
	]);
	const checked = ref(false);
	// 获取用户信息（发送消息的参数）
	let userInfo = {};
	const getUserInfoFn = () => {
		getUserInfo().then(res => {
			uni.hideLoading();
			userInfo = {
				openid: res?.openid || '',
				id: res?.id || ''
			};
			// 根据返回数据展示对应内容，如用户是否已付费可直接使用
			if (res?.allowSend === 1) {
				sendable.value = true;
				// 连接 WebSocket
				connectWebSocket();
			} else {
				sendable.value = false;
			}
			getApp().globalData.userId = res?.id || '';
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg || '获取用户信息失败，请稍后重试',
				mask: true,
				icon: "none"
			});
		});
	};
	// 微信小程序登录 (同意隐私协议)
	const mpLogin = () => {
		uni.showLoading({ mask: true });
		uni.login({
			success: ({code}) => {
				wxLogin({
					code,
					refId: getApp().globalData.refId
				}).then(res => {
					// console.log(res)
					uni.setStorage({
						key: 'token',
						data: res.token,
						complete: () => {
							getUserInfoFn()
						}
					});
					getApp().globalData.userId = res?.id || '';
				}, errMsg => {
					uni.hideLoading();
					uni.showToast({
						title: errMsg || '登录异常，请稍后重试',
						mask: true,
						icon: "none"
					});
				});
			},
			fail: () => {
				mpLogin();
			}
		});
	};
	// 点击左上角menu图标
	const clickMenuFn = () => {
		menuDrawer.value.open();
	};
	// 点击左上角menu item
	const clickMenuItemFn = (idx, path) => {
		const arr = mine.value;
		if (idx === 6) {
			menuDrawer.value.close();
			// purchasePopup.value.open();
			showBuyPopupFn();
		} else {
			uni.navigateTo({
				url: arr[idx].path
			});
		}
	};
	// 未付费用户点击底部输入框、发送按钮
	const showBuyPopupFn = () => {
		getPackageList({
			page: 1,
			pageSize: 10
		}).then(res => {
			membPackage.value = res?.records?.length ? res.records[0] : {
				id: 1,
				discountPrice: 29.99,
				marketPrice: 30,
				tips: '优惠24小时后失效'
			};
			purchasePopup.value.open();
		}, errMsg => {
			uni.showToast({
				title: errMsg || '获取付费套餐失败，请稍后重试',
				mask: true,
				icon: "none"
			});
		});
	};
	// 勾选用户协议
	const checkedFn = () => {
		checked.value = !checked.value;
	};
	// 查看用户协议
	const toProtocolFn = () => {
		uni.navigateTo({
			url: '/pages/user/protocol'
		});
	};
	// 确认协议并支付
	const buyFn = () => {
		if (!checked.value) return uni.showToast({
			title: '请先阅读并同意用户协议',
			mask: true,
			icon: "none"
		});
		uni.showLoading({ mask: true });
		const membPack = membPackage.value;
		// 创建订单
		createOrder({
			packageId: membPack.id
		}).then(order => {
			// 获取支付参数
			getPaymtData({id: order.id}).then(res => {
				// 拉起支付
				uni.requestPayment({
					provider: 'wxpay',
					timeStamp: res.timeStamp,
					nonceStr: res.nonceStr,
					package: res.packageVal,
					signType: res.signType,
					paySign: res.paySign,
					success: () => {
						// 支付成功后
						purchasePopup.value.close();
						sendable.value = true;
						// 更新用户信息
						getUserInfoFn();
					},
					fail: ({errMsg}) => {
						uni.hideLoading();
						// console.log(errMsg)
						if (errMsg && errMsg.indexOf('cancel') < 0) {
							uni.showToast({
								title: '支付失败，请稍后重试',
								mask: true,
								icon: "none"
							});
						}
					}
				});
			}, errMsg => {
				uni.hideLoading();
				uni.showToast({
					title: errMsg || '支付失败，请稍后重试',
					mask: true,
					icon: "none"
				});
			});
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg || '创建订单失败，请稍后重试',
				mask: true,
				icon: "none"
			});
		});
	};
	// WebSocket
	let wsTask = null; // socketTask 对象
	let wsConnected = false; // 是否已连接
	let reconnectCount = 0; // 重连次数
	const maxReconnectCount = 3; // 最大重连次数
	const reconnectInterval = 3000; // 重连间隔时间（毫秒）
	const list = ref([]); // 用户与AI的消息列表
	let current = 0; // 当前正在接收的AI消息在消息列表的索引
	let tempMsg = ''; // 用于临时存储 AI 返回的数据流
	// 连接 WebSocket
	const connectWebSocket = () => {
		// uni-app的socket，分全局socket和socketTask。全局socket只能有一个，一旦被占用就无法再开启。一般使用socketTask。
		// SocketTask 由 uni.connectSocket() 接口创建。
		wsTask = uni.connectSocket({
			url: 'wss://gxb.jmd-mall.com/ws', // WebSocket 地址
			success: () => {
				console.log('WebSocket 连接中...');
			},
			fail: (err) => {
				console.error('WebSocket 连接失败', err);
				reconnect();
			}
		});
		// 监听 WebSocket 打开事件
		wsTask.onOpen(() => {
			console.log('WebSocket 连接成功');
			wsConnected = true;
			reconnectCount = 0;
		});
		// 监听 WebSocket 消息事件
		wsTask.onMessage((res) => {
			const arr = list.value;
			let message = res.data;
			// console.log('收到消息: ', message);
			if (message == '<message>' || message == '<noreport>') { // 开头
				tempMsg = '';
			} else if (message == '</message>' || message == '</noreport>') {// 结尾
				arr[current].hasReport = message == '</noreport>' ? false : true;
				arr[current].output = false;
				thinking.value = false;
			} else if (message == '```' || message == 'html' || message == '###') { // 过滤特殊字符
				message = '';
			} else {
				tempMsg += message;
				arr[current].context = tempMsg;
				uni.pageScrollTo({
					scrollTop: 999999999
				});
			}
		});
		// 监听 WebSocket 错误事件
		wsTask.onError((err) => {
			console.error('WebSocket 错误', err);
			reconnect();
		});
		// 监听 WebSocket 关闭事件
		wsTask.onClose(() => {
			console.log('WebSocket 连接关闭');
			wsConnected = false;
			// 判断是否需要重连
			// reconnect();
		});
	};
	// 关闭 WebSocket
	const closeWebSocket = () => {
		wsTask.close();
	};
	// 重连机制
	const reconnect = () => {
		if (reconnectCount >= maxReconnectCount) {
			console.error('已达到最大重连次数，停止重连');
			return;
		}
		setTimeout(() => {
			console.log(`尝试第 ${reconnectCount + 1} 次重连...`);
			reconnectCount += 1;
			connectWebSocket();
		}, reconnectInterval);
	};
	// 发送消息
	const sendFn = () => {
		if (!wsConnected) return connectWebSocket(); // WebSocket 未连接
		if (!msg.value) return; // 消息不能为空
		if (thinking.value) return; // AI 思考中...
		thinking.value = true;
		const msgKey = randomString();
		wsTask.send({
			data: JSON.stringify({
				type: "user",
				token: userInfo.openid,
				uid: userInfo.id,
				key: msgKey,
				content: msg.value
			}),
			success: () => {
				console.log('消息发送成功:', msg.value);
				list.value.push({
					msgKey,
					type: 1,
					context: msg.value
				});
				list.value.push({
					msgKey,
					type: 2,
					output: true,
					hasReport: true,
					context: ''
				});
				current = list.value.length - 1;
				msg.value = '';
				sent.value = true;
				// thinking.value = true;
				nextTick(() => {
					uni.pageScrollTo({
						scrollTop: 999999999
					});
				});
			},
			fail: (err) => {
				console.error('消息发送失败', err);
				uni.showToast({
					title: '消息发送失败，请稍后重试',
					mask: true,
					icon: "none"
				});
			}
		});
	};
	// 点击“生成PDF”
	const createPDF = (msgKey) => {
		uni.showLoading({ mask: true });
		getPdfReport({
			reportKey: msgKey
		}).then(res => {
			console.log(res)
			if (res?.pdfFile) {
				uni.downloadFile({
					url: res.pdfFile,
					success: succ => {
						uni.openDocument({
							filePath: succ.tempFilePath,
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
			} else if (res?.status === 5 || res?.status === 6) {
				uni.hideLoading();
				uni.showToast({
					title: '报告生成中，请稍候在“我的报告”列表中查看',
					mask: true,
					icon: "none"
				});
			} else {
				uni.hideLoading();
				uni.showToast({
					title: '生成报告失败，请稍后重试',
					mask: true,
					icon: "none"
				});
			}
		}, errMsg => {
			uni.hideLoading();
			uni.showToast({
				title: errMsg || '生成报告失败，请稍后重试',
				mask: true,
				icon: "none"
			});
		});
	};
	// 监听页面加载
	onLoad((options) => {
		// console.log('onLoad: ', options);
		
	});
	// 监听页面初次渲染完成，此时组件已挂载完成，DOM 树($el)已可用
	onReady(() => {
		if (!uni.getStorageSync('token')) {
			showPrivacy.value = true;
		} else {
			uni.showLoading({ mask: true });
			getUserInfoFn();
		}
	});
	// 监听页面显示，页面每次出现在屏幕上都触发
	onShow(() => {
		
	});
	// 监听页面卸载
	onUnload(() => {
		if (wsConnected) {
			// 关闭 WebSocket
			closeWebSocket();
		}
	});
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		padding-bottom: 220rpx; // to handle fixed footer
	}
	
	.mine-list {
		width: 468rpx;
		box-sizing: border-box;
		padding: 100rpx 40rpx;
		.avatar {
			width: 68rpx;
			height: 68rpx;
			border-radius: 50%;
			padding: 20rpx 10rpx 68rpx;
		}
		.mine-item {
			width: 100%;
			padding: 20rpx 0;
			display: flex;
			align-items: center;
			color: #8b8b8b;
			font-size: 30rpx;
			.ico {
				width: 34rpx;
				height: auto;
				margin-right: 20rpx;
			}
		}
	}
	
	.welcome {
		width: 100%;
		padding-top: 26vh;
		.content {
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.logo {
				width: 128rpx;
				height: auto;
				margin-bottom: 30rpx;
			}
			.subtitle {
				text-align: center;
				font-weight: 600;
				font-size: 42rpx;
				color: #262626;
				line-height: 46rpx;
				margin-bottom: 30rpx;
			}
			.introduction {
				width: 568rpx;
				text-align: center;
			}
		}
	}
	
	.list {
		width: 100%;
		box-sizing: border-box;
		padding: 0 25rpx;
		font-size: 30rpx;
		.user {
			width: auto;
			height: auto;
			display: inline-block;
			float: right;
			margin-left: 100rpx;
			margin-bottom: 60rpx;
			border-radius: 40rpx;
			box-sizing: border-box;
			padding: 20rpx 30rpx;
			background-color: #F5F5F5;
		}
		.ai {
			width: 100%;
			margin-bottom: 60rpx;
			display: flex;
			.avatar {
				width: 60rpx;
				height: auto;
				margin-right: 18rpx;
			}
			.result {
				flex: 1;
				.context {
					width: 100%;
					margin-bottom: 20rpx;
					box-sizing: border-box;
					padding: 20rpx 30rpx;
					background-color: #F5F5F5;
					box-shadow: 0rpx 2rpx 8rpx 0rpx rgba(0,0,0,0.2);
					border-radius: 20rpx;
					font-size: 32rpx;
				}
				.wrapper {
					width: 100%;
					display: flex;
					justify-content: flex-end;
					align-items: center;
				}
				.notice {
					display: flex;
					justify-content: flex-end;
					align-items: center;
					font-size: 26rpx;
					font-weight: bolder;
					color: #e27b26;
					.uicon {
						margin: 4rpx 4rpx 0 0;
					}
				}
				.create-pdf {
					padding-left: 20rpx;
					display: flex;
					justify-content: flex-end;
					align-items: center;
					color: #469AFB;
					font-size: 24rpx;
					.pdf {
						width: 32rpx;
						height: auto;
						margin-right: 8rpx;
					}
				}
				
			}
		}
	}
	
	.purchase {
		width: 100%;
		min-height: 786rpx;
		padding-top: 46rpx;
		border-radius: 46rpx 46rpx 0 0;
		background: url('https://health.image.jmd-mall.com/gxb/imgs/popup_bg.png') no-repeat;
		background-size: 100% 100%;
		background-color: #ffffff;
		.subtitle {
			width: 100%;
			box-sizing: border-box;
			padding: 0 10rpx;
			margin-bottom: 68rpx;
			text-align: center;
			font-weight: 600;
			font-size: 36rpx;
			line-height: 36rpx;
		}
		.pack-info {
			width: 640rpx;
			height: 160rpx;
			margin: 0 auto;
			display: flex;
			align-items: center;
			background: url('../../static/imgs/package_bg.png') no-repeat;
			background-size: 100% 100%;
			.member {
				width: 370rpx;
				height: 64rpx;
				margin: 0 20rpx 0 28rpx;
			}
			.info {
				flex: 1;
				height: auto;
				display: flex;
				flex-direction: column;
				justify-content: center;
				font-size: 24rpx;
				line-height: 36rpx;
				color: #8C6129;
				.price {
					font-weight: bolder;
					.num {
						font-size: 46rpx;
					}
				}
				.discount {
					font-size: 22rpx;
				}
			}
			.expiration {
				width: 20rpx;
				margin: 0 8rpx 0 30rpx;
				font-size: 20rpx;
				line-height: 20rpx;
				color: #8C6129;
				text-align: center;
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				transform: scale(0.92);
				word-break: normal;
			}
		}
		.highlights {
			margin: 40rpx 0;
			display: flex;
			justify-content: center;
			.highlight {
				width: 220rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				text-align: center;
				image {
					width: 80rpx;
					height: 80rpx;
				}
				view {
					margin: 10rpx 0 2rpx;
					line-height: 40rpx;
				}
				text {
					font-size: 20rpx;
					color: #999999;
				}
			}
		}
		.checkbox {
			width: 100%;
			padding: 25rpx 0;
			display: flex;
			justify-content: center;
			align-items: center;
			.protocol {
				color: #0076FF;
				text-decoration: underline;
			}
		}
		.buy {
			width: 576rpx;
			height: 86rpx;
			margin: 0 auto;
			border-radius: 43rpx;
			background-color: #3875fb;
			text-align: center;
			line-height: 86rpx;
			font-weight: 600;
			font-size: 30rpx;
			color: #ffffff;
		}
	}
	
	.footer {
		width: 100%;
		min-height: 200rpx;
		background-color: #ffffff;
		position: fixed;
		z-index: 66;
		left: 0rpx;
		bottom: 0rpx;
		.sendable {
			width: 700rpx;
			min-height: 92rpx;
			margin: 18rpx auto 44rpx;
			box-sizing: border-box;
			padding-left: 30rpx;
			border-radius: 46rpx;
			background-color: #f5f5f5;
			display: flex;
			align-items: center;
			.inpt {
				flex: 1;
				min-height: 46rpx;
				padding: 23rpx 0;
				font-size: 32rpx;
				line-height: 46rpx;
			}
			.send {
				width: 56rpx;
				height: auto;
				padding: 18rpx 30rpx 18rpx 26rpx;
			}
		}
		.unable {
			width: 100%;
			height: 100%;
			position: absolute;
			left: 0;
			top: 0;
			z-index: 88;
			background-color: transparent;
		}
	}
	
	// AI thinking animation
	.thinking {
		width: 40rpx;
		margin: 10rpx 0;
		// margin: 10rpx 0 10rpx 252rpx;
		aspect-ratio: 1;
		border-radius: 50%;
		background: 
			radial-gradient(farthest-side,#469AFB 94%,#0000) top/8rpx 8rpx no-repeat,
			conic-gradient(#0000 30%,#469AFB);
		-webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 8rpx),#000 0);
		animation: l13 1s infinite linear;
	}
	@keyframes l13 { 
		100% {transform: rotate(1turn)}
	}
	
	// for AI result
	::v-deep .ai-title {
		margin: 6px 0;
		font-weight: bolder;
	}
	
	::v-deep .ai-ul {
		padding-bottom: 12px;
		&:last-child {
			padding-bottom: 0;
		}
	}
</style>
