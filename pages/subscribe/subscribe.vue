<template>
	<view class="subscribe">
		<!-- 背景图 -->
		<view class="backdrop">
			<view class="backdrop-overlay"></view>
		</view>
		<!-- 用户信息 -->
		<view class="user">
			<view class="avatar-container">
				<view class="avatar">
					<image :src="userInfo && userInfo.avatar ? getAvatarUrl(userInfo.avatar) : '/static/logo.png'"
						mode="aspectFill">
					</image>
				</view>
				<view class="avatar-border"></view>
			</view>
			<view class="content">
				<view class="name">{{ userInfo ? userInfo.nickname || userInfo.username : '游客' }}</view>
				<view class="login-tip" v-if="!userInfo" @tap="goToLogin">
					<text>点击登录账号</text>
					<uni-icons type="right" size="14" color="#4a90e2"></uni-icons>
				</view>
				<view class="vip" v-if="userInfo">
					<view class="badge level">
						<image src="/static/forum/Grade/LV13.png" mode="aspectFit"></image>
					</view>
					<view class="badge member">
						<image src="/static/forum/vip_bright.png" mode="aspectFit"></image>
					</view>
				</view>
			</view>
			<button class="button" @tap="createPost">
				<text>发帖</text>
				<uni-icons type="plus" size="16" color="#FFFFFF"></uni-icons>
			</button>
		</view>

		<!-- 论坛信息 -->
		<view class="forum">
			<!-- 分类标签 -->
			<view class="categories">
				<view v-for="(category, index) in categories" :key="index"
					:class="['category', activeCategory.id === category.id ? 'active' : '']"
					@tap="changeCategory(category)">
					{{ category.name }}
				</view>
			</view>

			<!-- 帖子列表 -->
			<view class="posts">
				<view class="post-item" v-for="(item, index) in postList" :key="index">
					<!-- 可点击区域 -->
					<view class="post-content" @tap="goToDetail(item)">
						<view class="post-header">
							<view class="post-user">
								<image class="post-avatar"
									:src="item.avatar ? getAvatarUrl(item.avatar) : '/static/logo.png'" mode="aspectFill">
								</image>
								<view class="post-info">
									<view class="post-username">{{ item.username || '文化爱好者' }}</view>
									<view class="post-time">{{ item.time || '2小时前' }}</view>
								</view>
							</view>
							<view class="post-tags">
								<view class="post-tag" v-if="item.isTop">置顶</view>
								<view class="post-tag essence" v-if="item.isEssence">精华</view>
								<view class="post-tag category">{{ item.category || '景点攻略' }}</view>
							</view>
						</view>

						<view class="post-content">
							<view class="post-title">{{ item.title || '晋祠游览攻略，千年古建筑的魅力所在' }}</view>
							<view class="post-text">
								{{ item.content || '晋祠是中国现存最早的皇家园林，始建于北魏，距今已有1400多年历史。这里有着众多国宝级文物和建筑，如难老泉、侍女像、圣母像等，值得细细品味...' }}
							</view>
						</view>

						<view class="post-images" v-if="item.images && item.images.length">
							<image v-for="(img, imgIndex) in item.images.slice(0, 3)" :key="imgIndex" :src="img"
								mode="aspectFill"></image>
						</view>
					</view>

					<!-- 底部操作栏 -->
					<view class="post-footer">
						<view class="action" @tap.stop="likePost(item)">
							<uni-icons :type="item.isLiked ? 'heart-filled' : 'heart'" size="18"
								:color="item.isLiked ? '#4a90e2' : '#666'"></uni-icons>
							<text :style="{ color: item.isLiked ? '#4a90e2' : '#666' }">{{ item.likes || 0 }}</text>
						</view>
						<view class="action" @tap.stop="commentPost(item)">
							<uni-icons type="chat" size="18" color="#666"></uni-icons>
							<text>{{ item.comments || 0 }}</text>
						</view>
						<view class="action" @tap.stop="favoritePost(item)">
							<uni-icons :type="item.isFavorited ? 'star-filled' : 'star'" size="18"
								:color="item.isFavorited ? '#4a90e2' : '#666'"></uni-icons>
							<text :style="{ color: item.isFavorited ? '#4a90e2' : '#666' }">收藏</text>
						</view>
						<view class="action" @tap.stop="sharePost(item)">
							<uni-icons type="forward" size="18" color="#666"></uni-icons>
							<text>分享</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" @tap="loadMorePosts">
				<text>{{ isLoading ? '加载中...' : '上拉加载更多' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';

	export default {
		data() {
			return {
				categories: [],
				activeCategory: '',
				postList: [],
				isLoading: false,
				page: 1,
				pageSize: 5,
				userInfo: null, // 添加用户信息
				hasMore: true
			};
		},
		onLoad() {
			// 获取用户信息
			this.getUserInfo();
			// 调试本地存储
			this.debugLocalStorage();
			// 获取论坛分类
			this.loadCategories();
			// 获取帖子数据
			this.loadPosts();
		},
		// 页面显示时刷新用户信息
		onShow() {
			// 重新获取用户信息，以防用户在其他页面登录或修改了信息
			this.getUserInfo();
			// 调试本地存储
			this.debugLocalStorage();

			// 检查是否从登录页返回
			const pages = getCurrentPages();
			const currentPage = pages[pages.length - 1];
			if (currentPage && currentPage.route.includes('subscribe')) {
				// 延迟一下再次获取用户信息，确保登录后的数据已经保存到本地存储
				setTimeout(() => {
					this.getUserInfo();
					this.debugLocalStorage();
				}, 500);
			}
		},
		methods: {
			// 获取论坛分类
			async loadCategories() {
				try {
					const res = await api.user.getForumCategories();
					if (res && res.code === 200 && res.data) {
						// 添加"全部"选项
						this.categories = [{
								id: 0,
								name: '全部'
							},
							...res.data
						];

						// 默认选中"全部"分类
						this.activeCategory = this.categories[0];
					} else {
						// 加载失败时使用默认分类
						this.categories = [{
								id: 0,
								name: '全部'
							},
							{
								id: 1,
								name: '景点攻略'
							},
							{
								id: 2,
								name: '文物鉴赏'
							},
							{
								id: 3,
								name: '旅行分享'
							},
							{
								id: 4,
								name: 'AR体验'
							}
						];
						this.activeCategory = this.categories[0];
					}
				} catch (error) {
					console.error('获取论坛分类失败:', error);
					// 加载失败时使用默认分类
					this.categories = [{
							id: 0,
							name: '全部'
						},
						{
							id: 1,
							name: '景点攻略'
						},
						{
							id: 2,
							name: '文物鉴赏'
						},
						{
							id: 3,
							name: '旅行分享'
						},
						{
							id: 4,
							name: 'AR体验'
						}
					];
					this.activeCategory = this.categories[0];
				}
			},

			// 获取用户信息
			async getUserInfo() {
				try {
					const userInfoStr = uni.getStorageSync('userInfo');
					const token = uni.getStorageSync('token');

					// console.log('当前存储的用户信息:', userInfoStr);
					// console.log('当前存储的token:', token);

					if (!token || !userInfoStr) {
						// console.log('token或用户信息不存在');
						this.userInfo = null;
						return;
					}

					this.isLoading = true;

					try {
						// 尝试解析存储的用户信息
						const userInfo = JSON.parse(userInfoStr);
						// console.log('解析后的用户信息:', userInfo);

						// 检查是否包含必要的基本信息
						if (userInfo && (userInfo.username || userInfo.nickname)) {
							this.userInfo = userInfo;
							// console.log('设置用户信息成功:', this.userInfo);
						} else {
							// console.log('用户信息不包含必要的基本信息');
							uni.removeStorageSync('userInfo');
							this.userInfo = null;
						}
					} catch (parseError) {
						// console.error('解析用户信息失败:', parseError);
						uni.removeStorageSync('userInfo');
						this.userInfo = null;
					}

				} catch (e) {
					// console.error('获取用户信息失败:', e);
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
				} finally {
					this.isLoading = false;
				}
			},

			// 获取头像URL
			getAvatarUrl(avatar) {
				// 如果是完整的URL，直接返回
				if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
					return avatar;
				}

				// 如果是相对路径，拼接基础URL
				if (avatar && avatar.startsWith('/')) {
					const baseApiUrl = 'http://192.168.194.9:8080'; // 替换为实际的API基础URL
					return baseApiUrl + avatar;
				}

				// 返回默认头像
				return '/static/logo.png';
			},

			// 检查登录状态
			checkLogin() {
				if (!this.userInfo) {
					uni.showModal({
						title: '提示',
						content: '您尚未登录，是否前往登录页面？',
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/login/login'
								});
							}
						}
					});
					return false;
				}
				return true;
			},

			// 创建帖子前检查登录状态
			createPost() {
				if (this.checkLogin()) {
					// 跳转到发帖页面
					uni.navigateTo({
						url: '/pages/post/create'
					});
				}
			},

			// 点赞前检查登录状态
			async likePost(post) {
				if (!this.checkLogin()) return;

				try {
					// 显示加载中
					uni.showLoading({
						title: '处理中...'
					});

					// 调用点赞API
					const res = await api.user.likeForumPost(post.id, this.userInfo.id);
					
					if (res && res.code === 200) {
						// 更新帖子点赞状态
						post.isLiked = !post.isLiked;
						if (post.isLiked) {
							post.likes++;
						} else {
							post.likes--;
						}
						
						// 显示操作结果
						uni.showToast({
							title: post.isLiked ? '点赞成功' : '取消点赞',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res?.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('点赞操作失败:', error);
					uni.showToast({
						title: '操作失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 评论前检查登录状态
			commentPost(post) {
				if (!this.checkLogin()) return;

				// 实现评论帖子逻辑
				uni.navigateTo({
					url: `/pages/post/detail?id=${post.id}&tab=comment`
				});
				// console.log('评论帖子:', post.id);
			},

			// 收藏前检查登录状态
			favoritePost(post) {
				if (!this.checkLogin()) return;

				// 实现收藏帖子逻辑
				post.isFavorited = !post.isFavorited;
				// 实际应用中应该调用API更新收藏状态
				// console.log('收藏帖子:', post.id, '收藏状态:', post.isFavorited);
			},

			// 分享前检查登录状态
			sharePost(post) {
				if (!this.checkLogin()) return;

				// 实现分享帖子逻辑
				uni.share({
					provider: 'weixin',
					scene: 'WXSceneSession',
					type: 0,
					title: post.title,
					summary: post.content,
					imageUrl: post.images && post.images.length > 0 ? post.images[0] : '',
					success: function(res) {
						// console.log('分享成功:', res);
					},
					fail: function(err) {
						// console.log('分享失败:', err);
					}
				});
				// console.log('分享帖子:', post.id);
			},

			loadPosts() {
				// 设置加载状态
				this.isLoading = true;

				// 准备请求参数
				const params = {
					page: this.page,
					pageSize: this.pageSize,
					categoryId: this.activeCategory.id === 0 ? undefined : this.activeCategory.id
				};

				// 调用API获取帖子数据
				api.user.getForumPosts(params)
					.then(res => {
						if (res && res.code === 200 && res.data && res.data.list) {
							const posts = res.data.list.map(post => ({
								id: post.id,
								title: post.title,
								content: post.content,
								images: post.coverImage ? [post.coverImage] : [],
								username: post.userName || '文化爱好者',
								avatar: post.userAvatar || '/static/logo.png',
								time: this.formatTime(new Date(post.createTime).getTime()),
								category: post.categoryName || '文化分享',
								likes: post.likeCount || 0,
								comments: post.replyCount || 0,
								isLiked: false,
								isFavorited: false,
								isTop: post.isTop === 1,
								isEssence: post.isEssence === 1,
								viewCount: post.viewCount || 0
							}));

							// 首次加载或切换分类时替换数据，加载更多时追加数据
							if (this.page === 1) {
								this.postList = posts;
							} else {
								this.postList = [...this.postList, ...posts];
							}

							// 判断是否还有更多数据
							const total = res.data.total || 0;
							this.hasMore = this.postList.length < total;

							// 如果没有数据显示提示
							if (posts.length === 0 && this.page === 1) {
								uni.showToast({
									title: '暂无数据',
									icon: 'none'
								});
							}
						} else {
							uni.showToast({
								title: res?.msg || '获取帖子失败',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						// console.error('获取帖子列表失败:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					})
					.finally(() => {
						this.isLoading = false;
						uni.stopPullDownRefresh();
					});
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '未知时间';

				const now = new Date().getTime();
				const diff = now - timestamp;

				// 小于1小时
				if (diff < 3600000) {
					const minutes = Math.floor(diff / 60000);
					return `${minutes}分钟前`;
				}
				// 小于24小时
				else if (diff < 86400000) {
					const hours = Math.floor(diff / 3600000);
					return `${hours}小时前`;
				}
				// 小于7天
				else if (diff < 604800000) {
					const days = Math.floor(diff / 86400000);
					return `${days}天前`;
				}
				// 大于7天显示具体日期
				else {
					const date = new Date(timestamp);
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
				}
			},

			changeCategory(category) {
				if (this.activeCategory === category) return;

				this.activeCategory = category;
				this.page = 1; // 重置页码
				// 根据分类重新加载帖子
				this.loadPosts();
			},
			loadMorePosts() {
				if (this.isLoading || !this.hasMore) return;

				this.page++;
				this.loadPosts();
			},
			// 调试本地存储
			debugLocalStorage() {
				const token = uni.getStorageSync('token');
				const userInfoStr = uni.getStorageSync('userInfo');

				// console.log('===== 调试本地存储 =====');
				// console.log('token:', token);
				// console.log('userInfoStr:', userInfoStr);

				if (userInfoStr) {
					try {
						const parsedUserInfo = JSON.parse(userInfoStr);
						// console.log('解析后的用户信息:', parsedUserInfo);
					} catch (e) {
						// console.error('解析用户信息失败:', e);
					}
				}
				// console.log('========================');
			},

			// 跳转到登录页面
			goToLogin() {
				// 显示登录对话框
				uni.showModal({
					title: '快速登录',
					content: '您可以选择直接登录或前往登录页面',
					confirmText: '直接登录',
					cancelText: '前往登录页',
					success: (res) => {
						if (res.confirm) {
							// 直接登录
							this.quickLogin();
						} else {
							// 前往登录页
							uni.navigateTo({
								url: '/pages/login/login'
							});
						}
					}
				});
			},

			// 快速登录
			quickLogin() {
				// 显示加载中
				uni.showLoading({
					title: '登录中...'
				});

				// 使用默认账号登录
				const loginData = {
					username: 'zhangsan',
					password: '123456'
				};

				// 模拟登录请求
				setTimeout(() => {
					// 隐藏加载中
					uni.hideLoading();

					// 模拟登录响应数据
					const response = {
						code: 200,
						msg: "登录成功",
						data: {
							token: "fdc0a43d65a041458b868dd79a36a6ea",
							userInfo: {
								id: 1,
								username: "zhangsan",
								nickname: "张三",
								avatar: "/static/logo.png"
							}
						}
					};

					// console.log('登录响应数据:', response);

					if (response.code === 200 && response.data) {
						// 保存token
						uni.setStorageSync('token', response.data.token);
						console.log('保存token成功:', response.data.token);

						// 保存用户信息
						const userInfoStr = JSON.stringify(response.data.userInfo);
						uni.setStorageSync('userInfo', userInfoStr);
						console.log('保存用户信息成功:', userInfoStr);

						// 更新当前状态
						this.userInfo = response.data.userInfo;
						console.log('更新组件状态成功:', this.userInfo);

						// 显示登录成功
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});

						// 刷新页面状态
						this.getUserInfo();
						console.log('刷新后的用户信息:', this.userInfo);
					} else {
						console.error('登录响应异常:', response);
						uni.showToast({
							title: response.msg || '登录失败',
							icon: 'none'
						});
					}
				}, 1000);
			},

			// 跳转到帖子详情页
			goToDetail(post) {
				uni.navigateTo({
					url: `/pages/post/detail?id=${post.id}`
				});
			},
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1;
			this.loadPosts();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 上拉加载更多
		onReachBottom() {
			this.loadMorePosts();
		}
	}
</script>

<style lang="scss">
	.subscribe {
		background-color: #f8f5f0;
		background-image: url('/static/forum/paper-texture.png');
		background-repeat: repeat;
		min-height: 100vh;
		position: relative;

		&::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 400rpx;
			background: linear-gradient(180deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0) 100%);
			pointer-events: none;
			z-index: 1;
		}

		.backdrop {
			width: 100%;
			height: 400rpx;
			background-image: url('/static/subscribe/1.jpg');
			background-size: cover;
			background-position: center;
			position: relative;
			animation: fadeIn 1.5s ease-in-out;

			@keyframes fadeIn {
				from { 
					opacity: 0;
					transform: scale(1.1);
				}
				to { 
					opacity: 1;
					transform: scale(1);
				}
			}

			&-overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(to bottom, 
					rgba(0,0,0,0.2) 0%,
					rgba(0,0,0,0.3) 50%,
					rgba(0,0,0,0.4) 100%
				);
			}
		}

		.user {
			margin: 0 30rpx;
			margin-top: -120rpx;
			display: flex;
			align-items: center;
			position: relative;
			z-index: 10;
			background: rgba(248, 245, 240, 0.95);
			backdrop-filter: blur(20px);
			border-radius: 24rpx;
			padding: 24rpx 30rpx;
			box-shadow: 0 8rpx 32rpx rgba(139, 69, 19, 0.15);
			border: 1rpx solid rgba(139, 69, 19, 0.1);
			transform: translateY(0);
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 4rpx;
				background: linear-gradient(90deg, 
					transparent 0%,
					rgba(139, 69, 19, 0.3) 50%,
					transparent 100%
				);
			}

			&:active {
				transform: translateY(2rpx);
			}

			.avatar-container {
				position: relative;
				width: 130rpx;
				height: 130rpx;

				.avatar {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
					overflow: hidden;
					border: 4rpx solid #8b4513;
					box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.2);
					position: absolute;
					top: 5rpx;
					left: 5rpx;
					z-index: 2;
					transition: all 0.3s ease;

					&:active {
						transform: scale(0.95);
					}

					image {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}
				}

				.avatar-border {
					position: absolute;
					top: 0;
					left: 0;
					width: 130rpx;
					height: 130rpx;
					border-radius: 50%;
					background: linear-gradient(135deg, #8b4513, #a0522d, #8b4513);
					z-index: 1;
					animation: rotate 8s linear infinite;
					box-shadow: 0 0 20rpx rgba(139, 69, 19, 0.3);

					&::before {
						content: '';
						position: absolute;
						top: -2rpx;
						left: -2rpx;
						right: -2rpx;
						bottom: -2rpx;
						border-radius: 50%;
						background: linear-gradient(135deg, 
							rgba(255,255,255,0.2) 0%,
							rgba(255,255,255,0) 50%,
							rgba(255,255,255,0.2) 100%
						);
					}
				}
			}

			.content {
				margin-left: 24rpx;
				flex: 1;

				.name {
					font-size: 36rpx;
					font-weight: 600;
					color: #8b4513;
					margin-bottom: 12rpx;
					text-shadow: 0 1px 2px rgba(0,0,0,0.1);
					font-family: "楷体", KaiTi, serif;
					position: relative;
					display: inline-block;

					&::after {
						content: '';
						position: absolute;
						bottom: -4rpx;
						left: 0;
						width: 100%;
						height: 2rpx;
						background: linear-gradient(90deg, 
							transparent 0%,
							rgba(139, 69, 19, 0.3) 50%,
							transparent 100%
						);
					}
				}

				.login-tip {
					display: flex;
					align-items: center;
					font-size: 26rpx;
					color: #8b4513;
					margin-top: 8rpx;
					transition: all 0.3s ease;
					position: relative;
					padding: 4rpx 0;

					text {
						margin-right: 4rpx;
					}

					&:active {
						opacity: 0.7;
						transform: translateX(4rpx);
					}

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						width: 4rpx;
						height: 24rpx;
						background: #8b4513;
						transform: translateY(-50%);
						border-radius: 2rpx;
					}
				}

				.vip {
					display: flex;
					align-items: center;
					height: 50rpx;
					margin-top: 8rpx;

					.badge {
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 16rpx;
						border-radius: 8rpx;
						overflow: hidden;
						transition: all 0.3s ease;
						position: relative;

						&:active {
							transform: scale(0.95);
						}

						&.level {
							background: linear-gradient(135deg, #8b4513, #a0522d);
							padding: 2rpx 4rpx;
							box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.3);

							&::before {
								content: '';
								position: absolute;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								background: linear-gradient(45deg, 
									rgba(255,255,255,0.1) 0%,
									rgba(255,255,255,0) 50%,
									rgba(255,255,255,0.1) 100%
								);
							}

							image {
								width: 70rpx;
								height: 40rpx;
							}
						}

						&.member {
							background: linear-gradient(135deg, #8b4513, #a0522d);
							padding: 2rpx 4rpx;
							box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.3);

							&::before {
								content: '';
								position: absolute;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								background: linear-gradient(45deg, 
									rgba(255,255,255,0.1) 0%,
									rgba(255,255,255,0) 50%,
									rgba(255,255,255,0.1) 100%
								);
							}

							image {
								width: 70rpx;
								height: 40rpx;
							}
						}
					}
				}
			}

			.button {
				min-width: 160rpx;
				height: 70rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 35rpx;
				background: linear-gradient(135deg, #8b4513, #a0522d);
				color: #FFFFFF;
				font-size: 28rpx;
				font-weight: 500;
				box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.3);
				padding: 0 24rpx;
				transition: all 0.3s ease;
				border: none;
				font-family: "楷体", KaiTi, serif;
				position: relative;
				overflow: hidden;

				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(45deg, 
						rgba(255,255,255,0.1) 0%,
						rgba(255,255,255,0) 50%,
						rgba(255,255,255,0.1) 100%
					);
				}

				text {
					margin-right: 8rpx;
				}

				&:active {
					transform: scale(0.95);
					box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
				}
			}
		}

		.forum {
			margin-top: 40rpx;
			padding: 0 20rpx;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				top: -20rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 200rpx;
				height: 4rpx;
				background: linear-gradient(90deg, 
					transparent 0%,
					rgba(139, 69, 19, 0.3) 50%,
					transparent 100%
				);
			}

			.categories {
				display: flex;
				overflow-x: auto;
				padding: 10rpx 0;
				margin-bottom: 30rpx;
				-webkit-overflow-scrolling: touch;
				position: relative;

				&::-webkit-scrollbar {
					display: none;
				}

				.category {
					padding: 12rpx 30rpx;
					background-color: rgba(248, 245, 240, 0.8);
					backdrop-filter: blur(5px);
					border-radius: 30rpx;
					margin-right: 20rpx;
					font-size: 26rpx;
					color: #8b4513;
					white-space: nowrap;
					transition: all 0.3s ease;
					box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.1);
					border: 1rpx solid rgba(139, 69, 19, 0.1);
					font-family: "楷体", KaiTi, serif;
					position: relative;
					overflow: hidden;
					display: flex;
					align-items: center;
					justify-content: center;
					height: 60rpx;
					line-height: 1;

					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 2rpx;
						background: linear-gradient(90deg, 
							transparent 0%,
							rgba(139, 69, 19, 0.3) 50%,
							transparent 100%
						);
					}

					&.active {
						background: linear-gradient(135deg, #8b4513, #a0522d);
						color: #fff;
						font-weight: 500;
						box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.2);

						&::before {
							background: linear-gradient(90deg, 
								transparent 0%,
								rgba(255,255,255,0.3) 50%,
								transparent 100%
							);
						}
					}

					&:active {
						transform: scale(0.95);
					}
				}
			}

			.posts {
				.post-item {
					background-color: rgba(248, 245, 240, 0.95);
					backdrop-filter: blur(10px);
					border-radius: 20rpx;
					padding: 30rpx;
					margin-bottom: 30rpx;
					box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.1);
					border: 1rpx solid rgba(139, 69, 19, 0.1);
					transition: all 0.3s ease;
					animation: slideUp 0.5s ease-out;
					position: relative;
					overflow: hidden;

					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 4rpx;
						background: linear-gradient(90deg, 
							transparent 0%,
							rgba(139, 69, 19, 0.3) 50%,
							transparent 100%
						);
					}

					@keyframes slideUp {
						from {
							opacity: 0;
							transform: translateY(20rpx);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}

					&:active {
						transform: translateY(2rpx);
						box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.05);
					}

					.post-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 20rpx;
						position: relative;

						&::after {
							content: '';
							position: absolute;
							bottom: -10rpx;
							left: 0;
							right: 0;
							height: 1rpx;
							background: linear-gradient(90deg, 
								transparent 0%,
								rgba(139, 69, 19, 0.2) 50%,
								transparent 100%
							);
						}

						.post-user {
							display: flex;
							align-items: center;

							.post-avatar {
								width: 80rpx;
								height: 80rpx;
								border-radius: 50%;
								margin-right: 16rpx;
								border: 2rpx solid #8b4513;
								box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
								position: relative;
								overflow: hidden;

								&::before {
									content: '';
									position: absolute;
									top: 0;
									left: 0;
									right: 0;
									bottom: 0;
									border-radius: 50%;
									background: linear-gradient(45deg, 
										rgba(255,255,255,0.1) 0%,
										rgba(255,255,255,0) 50%,
										rgba(255,255,255,0.1) 100%
									);
								}
							}

							.post-info {
								.post-username {
									font-size: 28rpx;
									font-weight: 500;
									color: #8b4513;
									text-shadow: 0 1px 1px rgba(0,0,0,0.05);
									font-family: "楷体", KaiTi, serif;
									position: relative;
									display: inline-block;

									&::after {
										content: '';
										position: absolute;
										bottom: -2rpx;
										left: 0;
										width: 100%;
										height: 1rpx;
										background: linear-gradient(90deg, 
											transparent 0%,
											rgba(139, 69, 19, 0.3) 50%,
											transparent 100%
										);
									}
								}

								.post-time {
									font-size: 22rpx;
									color: #a0522d;
									margin-top: 4rpx;
								}
							}
						}

						.post-tags {
							display: flex;
							align-items: center;

							.post-tag {
								padding: 6rpx 16rpx;
								background-color: rgba(139, 69, 19, 0.1);
								border-radius: 20rpx;
								margin-right: 10rpx;
								font-size: 22rpx;
								color: #8b4513;
								white-space: nowrap;
								backdrop-filter: blur(5px);
								border: 1rpx solid rgba(139, 69, 19, 0.2);
								position: relative;
								overflow: hidden;

								&::before {
									content: '';
									position: absolute;
									top: 0;
									left: 0;
									right: 0;
									bottom: 0;
									background: linear-gradient(45deg, 
										rgba(255,255,255,0.1) 0%,
										rgba(255,255,255,0) 50%,
										rgba(255,255,255,0.1) 100%
									);
								}

								&.essence {
									background: linear-gradient(135deg, #8b4513, #a0522d);
									color: #fff;
									box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
								}

								&.category {
									background: linear-gradient(135deg, #8b4513, #a0522d);
									color: #fff;
									box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
								}
							}
						}
					}

					.post-content {
						margin-bottom: 20rpx;

						.post-title {
							font-size: 32rpx;
							font-weight: 600;
							color: #8b4513;
							margin-bottom: 16rpx;
							line-height: 1.4;
							text-shadow: 0 1px 1px rgba(0,0,0,0.05);
							font-family: "楷体", KaiTi, serif;
							position: relative;
							padding-left: 20rpx;

							&::before {
								content: '';
								position: absolute;
								left: 0;
								top: 50%;
								transform: translateY(-50%);
								width: 4rpx;
								height: 32rpx;
								background: #8b4513;
								border-radius: 2rpx;
							}
						}

						.post-text {
							font-size: 28rpx;
							color: #5c4033;
							line-height: 1.8;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 3;
							overflow: hidden;
							font-family: "楷体", KaiTi, serif;
							text-indent: 2em;
							letter-spacing: 1rpx;
							text-shadow: 0 1px 1px rgba(0,0,0,0.05);
							position: relative;
							padding: 10rpx 0;

							&::before {
								content: '';
								position: absolute;
								left: 0;
								top: 0;
								width: 100%;
								height: 1rpx;
								background: linear-gradient(90deg, 
									transparent 0%,
									rgba(139, 69, 19, 0.2) 50%,
									transparent 100%
								);
							}

							&::after {
								content: '';
								position: absolute;
								left: 0;
								bottom: 0;
								width: 100%;
								height: 1rpx;
								background: linear-gradient(90deg, 
									transparent 0%,
									rgba(139, 69, 19, 0.2) 50%,
									transparent 100%
								);
							}
						}
					}

					.post-images {
						display: flex;
						margin-bottom: 20rpx;
						gap: 10rpx;

						image {
							width: 210rpx;
							height: 160rpx;
							border-radius: 12rpx;
							object-fit: cover;
							box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.1);
							transition: all 0.3s ease;
							border: 1rpx solid rgba(139, 69, 19, 0.1);
							position: relative;
							overflow: hidden;

							&::before {
								content: '';
								position: absolute;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								background: linear-gradient(45deg, 
									rgba(255,255,255,0.1) 0%,
									rgba(255,255,255,0) 50%,
									rgba(255,255,255,0.1) 100%
								);
							}

							&:hover {
								transform: scale(1.02);
							}
						}
					}

					.post-footer {
						display: flex;
						justify-content: space-between;
						border-top: 2rpx solid rgba(139, 69, 19, 0.1);
						padding-top: 20rpx;

						.action {
							display: flex;
							align-items: center;
							font-size: 24rpx;
							color: #8b4513;
							padding: 8rpx 16rpx;
							border-radius: 20rpx;
							transition: all 0.3s ease;
							background-color: rgba(139, 69, 19, 0.05);
							backdrop-filter: blur(5px);
							border: 1rpx solid rgba(139, 69, 19, 0.1);
							position: relative;
							overflow: hidden;

							&::before {
								content: '';
								position: absolute;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								background: linear-gradient(45deg, 
									rgba(255,255,255,0.1) 0%,
									rgba(255,255,255,0) 50%,
									rgba(255,255,255,0.1) 100%
								);
							}

							uni-icons {
								margin-right: 6rpx;
							}

							&:active {
								background-color: rgba(139, 69, 19, 0.1);
								transform: scale(0.95);
							}
						}
					}
				}
			}

			.load-more {
				text-align: center;
				padding: 30rpx 0;
				color: #8b4513;
				font-size: 26rpx;
				transition: opacity 0.3s ease;
				font-family: "楷体", KaiTi, serif;
				position: relative;

				&::before {
					content: '';
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 200rpx;
					height: 1rpx;
					background: linear-gradient(90deg, 
						transparent 0%,
						rgba(139, 69, 19, 0.3) 50%,
						transparent 100%
					);
					z-index: 0;
				}

				text {
					position: relative;
					z-index: 1;
					background: #f8f5f0;
					padding: 0 20rpx;
				}

				&:active {
					opacity: 0.7;
				}
			}
		}
	}
</style>