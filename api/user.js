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

	// 获取建筑列表数据（用于景点导览）
	getBuildings: (params) => {
		// 支持传入可选参数，如分页、筛选条件等
		const queryString = params ? `?${Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')}` : '';
		return request(`/api/manage/buildings${queryString}`, 'GET');
	},

	// 获取建筑详情
	getBuildingDetail: (id) => {
		return request(`/api/manage/buildings/${id}`, 'GET');
	},

	// 获取论坛帖子列表
	getPosts: (params) => {
		return request('/api/home/articles', 'GET', params);
	},

	// 获取论坛分类列表
	getForumCategories: () => {
		return request('/api/forum/categories', 'GET');
	},

	// 获取论坛帖子列表
	getForumPosts: (params) => {
		return request('/api/forum/posts', 'GET', params);
	},

	// 获取帖子详情
	getForumPostDetail: (id) => {
		return request(`/api/forum/posts/${id}`, 'GET');
	},

	// 发布论坛帖子
	createForumPost: (data) => {
		return request('/api/forum/posts', 'POST', data);
	},

	// 更新论坛帖子
	updateForumPost: (id, data) => {
		return request(`/api/forum/posts/${id}`, 'PUT', data);
	},

	// 获取订单列表
	getOrders: (params) => {
		return request('/api/orders', 'GET', params);
	},

	// 获取订单详情
	getOrderDetail: (orderNo) => {
		return request(`/api/orders/${orderNo}`, 'GET');
	},

	// 支付订单
	payOrder: (orderNo, paymentMethod) => {
		return request('/api/orders/pay', 'POST', { orderNo, paymentMethod });
	},

	// 支付预约门票
	payTicket: (orderNo, paymentMethod) => {
		// 这里使用PUT请求，参数在URL中，无需在body中传递额外参数
		return request(`/api/tickets/pay/${orderNo}`, 'PUT');
	},

	// 取消订单
	cancelOrder: (orderNo) => {
		return request('/api/orders/cancel', 'POST', { orderNo });
	},

	// 获取我的门票列表
	getMyTickets: () => {
		return request('/api/tickets/my', 'GET');
	},

	// 获取门票详情
	getTicketDetail: (ticketId) => {
		return request(`/api/tickets/${ticketId}`, 'GET');
	},
	
	// 预约门票
	reserveTicket: (params) => {
		return request('/api/tickets/reserve', 'POST', params);
	},
	
	// 申请退款
	requestRefund: (orderNo) => {
		return request('/api/orders/refund', 'POST', { orderNo });
	},

	// 创建帖子回复
	createForumReply: (data) => {
		return request(`/api/forum/posts/${data.postId}/replies`, 'POST', data);
	},

	// 获取帖子回复列表
	getForumReplies: (postId, params) => {
		return request(`/api/forum/posts/${postId}/replies`, 'GET', params);
	},
	
	// 点赞帖子
	likeForumPost: (postId, userId) => {
		return request(`/api/forum/posts/${postId}/like?userId=${userId}`, 'POST');
	},
	
	// 收藏帖子
	favoriteForumPost: (data) => {
		return request('/api/forum/favorites', 'POST', data);
	},
	
	// 获取用户收藏的文章列表
	getUserFavorites: (params) => {
		const queryString = params ? `?userId=${params.userId}&type=${params.type}&page=${params.page || 1}&pageSize=${params.pageSize || 10}` : '';
		return request(`/api/articles/favorites${queryString}`, 'GET');
	},
	
	// 删除帖子
	deleteForumPost: (id, userId) => {
		return request(`/api/forum/posts/${id}?userId=${userId}`, 'DELETE');
	},
	
	// 删除回复
	deleteForumReply: (postId, replyId, userId) => {
		return request(`/api/forum/posts/${postId}/replies/${replyId}?userId=${userId}`, 'DELETE');
	},
	
};
