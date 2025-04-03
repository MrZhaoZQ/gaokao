class WebSocketManager {
	constructor(url, options = {}) {
		this.url = url; // WebSocket 地址
		this.socketOpen = false; // 连接状态
		this.reconnectCount = 0; // 重连次数
		this.maxReconnectCount = options.maxReconnectCount || 5; // 最大重连次数
		this.reconnectInterval = options.reconnectInterval || 3000; // 重连间隔
		this.messageHandler = null; // 消息处理回调
		this.openHandler = null; // 连接打开回调
		this.errorHandler = null; // 错误处理回调
		this.closeHandler = null; // 连接关闭回调
	}

	// 连接 WebSocket
	connect() {
		wx.connectSocket({
			url: this.url,
			success: () => {
				console.log('WebSocket 连接中...');
			},
			fail: (err) => {
				console.error('WebSocket 连接失败', err);
				this.reconnect();
			},
		});

		// 监听 WebSocket 打开事件
		wx.onSocketOpen(() => {
			console.log('WebSocket 连接成功');
			this.socketOpen = true;
			this.reconnectCount = 0;
			if (this.openHandler) {
				this.openHandler();
			}
		});

		// 监听 WebSocket 消息事件
		wx.onSocketMessage((res) => {
			const message = res.data;
			console.log('收到消息:', message);
			if (this.messageHandler) {
				this.messageHandler(message);
			}
		});

		// 监听 WebSocket 错误事件
		wx.onSocketError((err) => {
			console.error('WebSocket 错误', err);
			this.reconnect();
		});

		// 监听 WebSocket 关闭事件
		wx.onSocketClose(() => {
			console.log('WebSocket 连接关闭');
			this.socketOpen = false;
			if (this.closeHandler) {
				this.closeHandler();
			}
			this.reconnect();
		});
	}

	// 关闭 WebSocket
	close() {
		wx.closeSocket();
	}

	// 重连机制
	reconnect() {
		if (this.reconnectCount >= this.maxReconnectCount) {
			console.error('已达到最大重连次数，停止重连');
			return;
		}

		setTimeout(() => {
			console.log(`尝试第 ${this.reconnectCount + 1} 次重连...`);
			this.reconnectCount += 1;
			this.connect();
		}, this.reconnectInterval);
	}

	// 发送消息
	send(message) {
		if (!this.socketOpen) {
			console.error('WebSocket 未连接');
			return false;
		}

		wx.sendSocketMessage({
			data: message,
			success: () => {
				console.log('消息发送成功:', message);
			},
			fail: (err) => {
				console.error('消息发送失败', err);
			},
		});
		return true;
	}

	// 设置消息处理回调
	onMessage(handler) {
		this.messageHandler = handler;
	}

	// 设置连接打开回调
	onOpen(handler) {
		this.openHandler = handler;
	}

	// 设置错误处理回调
	onError(handler) {
		this.errorHandler = handler;
	}

	// 设置连接关闭回调
	onClose(handler) {
		this.closeHandler = handler;
	}
}

// 导出 WebSocketManager 类
export default WebSocketManager;