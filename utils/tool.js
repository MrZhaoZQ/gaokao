// 生成 32 位随机字符串（大小写字母+数字）
export function randomString(length = 32) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

// 获取url路径中的参数
export function getQueryStr(url, name) {
	const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	const search = url.split('?')[1] || '';
	const r = search.match(reg) || [];
	return r[2];
}