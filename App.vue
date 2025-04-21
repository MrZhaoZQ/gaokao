<script>
	// #ifdef H5
	import { initWxJsSDK } from '@/utils/wxjssdk.js'
	// #endif
	
	export default {
		globalData: {
			userId: '', // 用于分享页面时携带参数
			refId: ''
		},
		onLaunch: function(e) {
			// 获取小程序码的参数分享ID
			if (e.query && e.query.refId) {
				this.globalData.refId = e.query.refId
			}
			
			// #ifdef H5
			initWxJsSDK()
			// #endif
		},
		onShow: function(e) {
			// 获取小程序码的参数分享ID，以免扫码后再次扫另一新的码参数未更新
			if (e.query && e.query.refId) {
				this.globalData.refId = e.query.refId
			}
		},
		onHide: function() {
			
		}
	}
</script>

<style>
	/*每个页面公共css */
	.container {
		font-size: 28rpx;
	}
	/* 去除按钮的默认样式 */
	button {
		margin: 0;
		padding: 0;
		border: none;
		background-color: #fff;
		font-size: 28rpx;
	}
	button:after {
		content: none;
	}
	/* 去除textarea的默认样式 */
	textarea {
		margin: 0;
		padding: 0;
		border: none;
	}
</style>
