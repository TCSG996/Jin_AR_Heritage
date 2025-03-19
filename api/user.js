import request from './request';

// 用户相关接口
export default {
	// 用户登录
	login: (data) => {
		return request('/api/user/login', 'POST', data);
	},

	// 用户注册
	register: (data) => {
		return request('/api/user/register', 'POST', data);
	},

	// 获取用户信息
	getUserInfo: (params) => {
		return request(`/api/user/info${params}`, 'GET');
	},

	// 更新用户信息
	updateUserInfo: (data) => {
		return request('/api/user/update', 'PUT', data);
	},

	// 修改密码
	changePassword: (data) => {
		return request('/api/user/password', 'PUT', data);
	},

	// 退出登录
	logout: () => {
		return request('/api/user/logout', 'POST');
	},

	// 获取首页数据
	home: () => {
		return request('/api/home', 'GET');
	},

	// 获取论坛帖子列表
	getPosts: (params) => {
		return request('/api/home/articles', 'GET', params);
	},

	// 获取订单列表
	// getOrders: (params) => {
	// 	return request('/api/shop/orders', 'GET', params);
	// },

	// // 获取用户收藏的建筑
	// getCollectedBuildings: (params) => {
	// 	return request('//api/user/favorites/buildings', 'GET', params);
	// },

	// // 获取用户收藏的帖子
	// getCollectedPosts: (params) => {
	// 	return request('/api/user/favorites/articles', 'GET', params);
	// },
	
};
