export const share = {
	onShareAppMessage: () => {
		return {
			title: 'AI智选志愿',
			path: 'pages/index/index?refId=' + getApp().globalData.userId,
			imageUrl: '' // 默认为当前页面的截图
		}
	},
	onShareTimeline: () => {
		return {
			title: 'AI智选志愿',
			path: 'pages/index/index?refId=' + getApp().globalData.userId,
			imageUrl: '' // 默认为当前页面的截图
		}
	}
}