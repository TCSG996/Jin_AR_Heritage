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

	// 更新用户资料
	updateUserProfile: (userId, data) => {
		return request(`/api/manage/users/${userId}`, 'PUT', data);
	},

	// 上传头像
	uploadAvatar: (userId, file) => {
		// 使用uni.uploadFile方法直接上传文件
		return new Promise((resolve, reject) => {
			const token = uni.getStorageSync('token');
			// 获取baseUrl - 通常API基础URL会定义在请求模块中
			const baseUrl = request.baseUrl || 'http://192.168.194.9:8080';
			
			uni.uploadFile({
				url: baseUrl + `/api/manage/users/${userId}/avatar`,
				filePath: file,
				name: 'file',
				header: {
					'Authorization': token ? `Bearer ${token}` : ''
				},
				success: (uploadRes) => {
					try {
						// uploadFile返回的数据是字符串，需要解析
						const result = JSON.parse(uploadRes.data);
						resolve(result);
					} catch(e) {
						console.error('解析上传响应失败:', e, uploadRes.data);
						reject(new Error('解析响应失败'));
					}
				},
				fail: (err) => {
					console.error('上传头像请求失败:', err);
					reject(err);
				}
			});
		});
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
