<template>
	<view class="post-detail">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="left" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<view class="title">帖子详情</view>
			<view class="right">
				<view class="edit-btn" v-if="isAuthor" @tap.stop="showEditOptions">
					<uni-icons type="more-filled" size="24" color="#333"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 帖子内容 -->
		<view class="post-content">
			<view class="post-header">
				<view class="author-info">
					<image class="avatar" :src="getAvatarUrl(post.userAvatar)" mode="aspectFill"></image>
					<view class="info">
						<text class="name">{{ post.userName || '文化爱好者' }}</text>
						<text class="time">{{ formatTime(post.createTime) }}</text>
					</view>
				</view>
				<!-- 暂时隐藏删除按钮 -->
				<!-- <view class="post-actions" v-if="isAuthor">
					<view class="delete-btn" @tap="showDeleteConfirm">
						<uni-icons type="trash" size="20" color="#ff4d4f"></uni-icons>
					</view>
				</view> -->
			</view>

			<!-- 帖子标题和内容 -->
			<view class="content">
				<view class="title">{{ post.title }}</view>
				<view class="text">{{ post.content }}</view>
			</view>

			<!-- 帖子标签 -->
			<view class="tags">
				<view class="tag" v-if="post.isTop">置顶</view>
				<view class="tag essence" v-if="post.isEssence">精华</view>
				<view class="tag category">{{ post.categoryName }}</view>
			</view>

			<!-- 帖子数据 -->
			<view class="stats">
				<view class="stat-item">
					<text class="label">浏览</text>
					<text class="value">{{ post.viewCount || 0 }}</text>
				</view>
				<view class="stat-item">
					<text class="label">评论</text>
					<text class="value">{{ post.replyCount || 0 }}</text>
				</view>
				<view class="stat-item">
					<text class="label">点赞</text>
					<text class="value">{{ post.likeCount || 0 }}</text>
				</view>
			</view>

			<!-- 互动按钮 -->
			<view class="post-actions">
				<view class="action" @tap.stop="likePost">
					<uni-icons :type="post.isLiked ? 'heart-filled' : 'heart'" size="24" 
						:color="post.isLiked ? '#4a90e2' : '#666'"></uni-icons>
					<text :style="{ color: post.isLiked ? '#4a90e2' : '#666' }">
						{{ post.likeCount || 0 }}
					</text>
				</view>
				<view class="action" @tap.stop="showCommentInput">
					<uni-icons type="chat" size="24" color="#666"></uni-icons>
					<text>{{ post.replyCount || 0 }}</text>
				</view>
				<view class="action">
					<uni-icons type="forward" size="24" color="#666"></uni-icons>
					<text>分享</text>
				</view>
			</view>
		</view>

		<!-- 评论区 -->
		<view class="comments">
			<view class="section-title">评论 {{ post.replyCount || 0 }}</view>
			<!-- 评论列表 -->
			<view class="comment-list">
				<!-- 暂无评论提示 -->
				<view class="empty" v-if="!replies.length">
					<image src="/static/forum/empty.png" mode="aspectFit"></image>
					<text>暂无评论，快来抢沙发~</text>
				</view>
				<!-- 评论列表 -->
				<view class="comment-item" v-for="(reply, index) in replies" :key="reply.id">
					<view class="comment-user">
						<image class="avatar" :src="getAvatarUrl(reply.userAvatar)" mode="aspectFill"></image>
						<view class="info">
							<view class="name">{{ reply.userName }}</view>
							<view class="time">{{ formatTime(reply.createTime) }}</view>
						</view>
						<!-- 添加删除按钮，仅对评论作者显示 -->
						<view class="delete-btn" v-if="userInfo && userInfo.id === reply.userId" @tap.stop="showDeleteReplyConfirm(reply)">
							<uni-icons type="trash" size="16" color="#ff4d4f"></uni-icons>
						</view>
					</view>
					<view class="comment-content">{{ reply.content }}</view>
					<view class="comment-actions">
						<view class="action" @tap="likeReply(reply)">
							<uni-icons :type="reply.isLiked ? 'heart-filled' : 'heart'" size="14" 
								:color="reply.isLiked ? '#4a90e2' : '#999'"></uni-icons>
							<text :style="{ color: reply.isLiked ? '#4a90e2' : '#999' }">{{ reply.likeCount }}</text>
						</view>
						<view class="action" @tap="replyToComment(reply)">
							<uni-icons type="chat" size="14" color="#999"></uni-icons>
							<text>回复</text>
						</view>
					</view>
				</view>
				<!-- 加载更多 -->
				<view class="load-more" v-if="hasMore" @tap="loadMoreReplies">
					<text>{{ isLoadingMore ? '加载中...' : '加载更多' }}</text>
				</view>
			</view>
		</view>

		<!-- 底部评论输入框 -->
		<view class="comment-input" v-if="showInput">
			<input type="text" v-model="commentText" placeholder="写下你的评论..." focus />
			<button class="send-btn" :disabled="!commentText.trim()" @tap="submitComment">发送</button>
		</view>

		<!-- 删除确认弹窗 -->
		<!-- <uni-popup ref="deletePopup" type="dialog">
			<uni-popup-dialog
				type="warning"
				title="删除确认"
				content="确定要删除这篇帖子吗？此操作不可恢复。"
				:before-close="true"
				@confirm="deletePost"
				@close="closeDeletePopup"
			></uni-popup-dialog>
		</uni-popup> -->

		<!-- 删除回复确认弹窗 -->
		<uni-popup ref="deleteReplyPopup" type="dialog">
			<uni-popup-dialog
				type="warning"
				title="删除确认"
				content="确定要删除这条回复吗？此操作不可恢复。"
				:before-close="true"
				@confirm="deleteReply"
				@close="closeDeleteReplyPopup"
			></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import api from '@/api/index.js';

	export default {
		data() {
			return {
				postId: null,
				post: {},
				replies: [], // 回复列表
				page: 1,
				pageSize: 10,
				hasMore: true,
				isLoadingMore: false,
				isLiked: false,
				isFavorited: false,
				showInput: false,
				commentText: '',
				userInfo: null,
				isAuthor: false,
				isEditing: false,
				editForm: {
					title: '',
					content: '',
					categoryId: null
				},
				selectedReply: null, // 添加选中的回复对象
			};
		},
		onLoad(options) {
			if (options.id) {
				this.postId = options.id;
				this.loadPostDetail();
			}
			this.getUserInfo();
		},
		methods: {
			// 获取用户信息
			async getUserInfo() {
				try {
					const userInfoStr = uni.getStorageSync('userInfo');
					const token = uni.getStorageSync('token');

					if (!token || !userInfoStr) {
						this.userInfo = null;
						return;
					}

					try {
						const userInfo = JSON.parse(userInfoStr);
						if (userInfo && (userInfo.username || userInfo.nickname)) {
							this.userInfo = userInfo;
						} else {
							uni.removeStorageSync('userInfo');
							this.userInfo = null;
						}
					} catch (parseError) {
						uni.removeStorageSync('userInfo');
						this.userInfo = null;
					}
				} catch (e) {
					console.error('获取用户信息失败:', e);
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
				}
			},

			// 加载帖子详情
			async loadPostDetail() {
				uni.showLoading({
					title: '加载中...'
				});

				try {
					const res = await api.user.getForumPostDetail(this.postId);
					if (res && res.code === 200 && res.data) {
						this.post = res.data;
						this.isAuthor = this.userInfo && this.userInfo.id === this.post.userId;
						
						this.editForm = {
							title: this.post.title,
							content: this.post.content,
							categoryId: this.post.categoryId
						};

						// 加载回复列表
						await this.loadReplies();
					} else {
						console.error('获取帖子失败:', res?.msg || '未知错误');
					}
				} catch (error) {
					console.error('获取帖子详情失败:', error);
				} finally {
					uni.hideLoading();
				}
			},

			// 获取头像URL
			getAvatarUrl(avatar) {
				if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
					return avatar;
				}
				if (avatar && avatar.startsWith('/')) {
					const baseApiUrl = 'http://192.168.194.9:8080';
					return baseApiUrl + avatar;
				}
				return '/static/logo.png';
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '未知时间';
				
				// 如果是字符串格式的时间，直接返回
				if (typeof timestamp === 'string') {
					return timestamp;
				}

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
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
				}
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 显示操作菜单
			showActions() {
				if (!this.checkLogin()) return;

				uni.showActionSheet({
					itemList: ['举报', '分享到朋友圈', '复制链接'],
					success: (res) => {
						switch (res.tapIndex) {
							case 0:
								this.reportPost();
								break;
							case 1:
								this.shareToMoments();
								break;
							case 2:
								this.copyLink();
								break;
						}
					}
				});
			},

			// 关注作者
			followAuthor() {
				if (!this.checkLogin()) return;

				uni.showToast({
					title: '关注成功',
					icon: 'success'
				});
			},

			// 点赞帖子
			async likePost() {
				if (!this.checkLogin()) return;

				try {
					// 显示加载中
					uni.showLoading({
						title: '处理中...'
					});

					// 调用点赞API
					const res = await api.user.likeForumPost(this.postId, this.userInfo.id);
					
					if (res && res.code === 200) {
						// 更新帖子点赞状态
						this.post.isLiked = !this.post.isLiked;
						if (this.post.isLiked) {
							this.post.likeCount++;
						} else {
							this.post.likeCount--;
						}
					} else {
						console.error('点赞操作失败:', res?.msg || '未知错误');
					}
				} catch (error) {
					console.error('点赞操作失败:', error);
				} finally {
					uni.hideLoading();
				}
			},

			// 收藏帖子
			async favoritePost() {
				if (!this.checkLogin()) return;

				try {
					uni.showLoading({
						title: '处理中...'
					});

					const favoriteData = {
						userId: this.userInfo.id,
						postId: this.postId,
						type: 1  // 1-帖子收藏
					};

					const res = await api.user.favoriteForumPost(favoriteData);
					
					if (res && res.code === 200) {
						// 更新收藏状态
						this.isFavorited = !this.isFavorited;
					} else {
						console.error('收藏操作失败:', res?.msg || '未知错误');
					}
				} catch (error) {
					console.error('收藏操作失败:', error);
				} finally {
					uni.hideLoading();
				}
			},

			// 分享帖子
			sharePost() {
				if (!this.checkLogin()) return;

				uni.share({
					provider: 'weixin',
					scene: 'WXSceneSession',
					type: 0,
					title: this.post.title,
					summary: this.post.content,
					success: function(res) {
						console.log('分享成功');
					},
					fail: function(err) {
						console.log('分享失败');
					}
				});
			},

			// 显示评论输入框
			showCommentInput() {
				if (!this.checkLogin()) return;
				this.showInput = true;
				// 自动聚焦输入框
				setTimeout(() => {
					const input = document.querySelector('.comment-input input');
					if (input) {
						input.focus();
					}
				}, 100);
			},

			// 提交评论
			async submitComment() {
				if (!this.commentText.trim()) return;

				try {
					uni.showLoading({
						title: '发送中...'
					});

					const replyData = {
						postId: this.postId,
						content: this.commentText.trim(),
						userId: this.userInfo.id,
						userName: this.userInfo.nickname || this.userInfo.username,
						userAvatar: this.userInfo.avatar || '/static/logo.png',
						parentId: 0,  // 默认为0，表示直接回复帖子
						likeCount: 0,  // 默认点赞数为0
						status: 1      // 默认状态为1，表示正常
					};

					const res = await api.user.createForumReply(replyData);
					
					uni.hideLoading();

					if (res && res.code === 200) {
						this.showInput = false;
						this.commentText = '';
						// 重新加载帖子详情以更新评论数
						this.loadPostDetail();
					} else {
						console.error('评论失败:', res?.msg || '未知错误');
					}
				} catch (error) {
					uni.hideLoading();
					console.error('发表评论失败:', error);
				}
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

			// 举报帖子
			reportPost() {
				uni.showToast({
					title: '举报成功',
					icon: 'success'
				});
			},

			// 分享到朋友圈
			shareToMoments() {
				uni.share({
					provider: 'weixin',
					scene: 'WXSceneTimeline',
					type: 0,
					title: this.post.title,
					summary: this.post.content,
					success: function(res) {
						console.log('分享成功');
					},
					fail: function(err) {
						console.log('分享失败');
					}
				});
			},

			// 复制链接
			copyLink() {
				uni.setClipboardData({
					data: window.location.href,
					success: () => {
						uni.showToast({
							title: '链接已复制',
							icon: 'success'
						});
					}
				});
			},

			// 显示编辑选项
			showEditOptions() {
				if (!this.checkLogin()) return;
				
				uni.showActionSheet({
					itemList: ['编辑帖子', '删除帖子'],
					success: (res) => {
						switch (res.tapIndex) {
							case 0:
								this.editPost();
								break;
							case 1:
								uni.showToast({
									title: '正在维修，请稍后',
									icon: 'none'
								});
								break;
						}
					}
				});
			},

			// 编辑帖子
			editPost() {
				uni.navigateTo({
					url: `/pages/post/edit?id=${this.postId}`
				});
			},

			/*
			// 删除帖子
			async deletePost() {
				try {
					uni.showLoading({
						title: '删除中...'
					});

					const res = await api.user.deleteForumPost(this.postId, this.userInfo.id);
					
					if (res && res.code === 200) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						
						// 关闭弹窗
						this.$refs.deletePopup.close();
						
						// 返回上一页
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: res?.msg || '删除失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('删除帖子失败:', error);
					uni.showToast({
						title: '删除失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 显示删除确认弹窗
			showDeleteConfirm() {
				this.$refs.deletePopup.open();
			},

			// 关闭删除确认弹窗
			closeDeletePopup() {
				this.$refs.deletePopup.close();
			},
			*/

			// 加载回复列表
			async loadReplies(isLoadMore = false) {
				if (!isLoadMore) {
					this.page = 1;
					this.replies = [];
				}

				if (this.isLoadingMore) return;
				this.isLoadingMore = true;

				try {
					uni.showLoading({
						title: '加载中...'
					});

					const params = {
						page: this.page,
						pageSize: this.pageSize
					};

					console.log('正在获取回复列表，参数:', {
						postId: this.postId,
						params: params
					});

					const res = await api.user.getForumReplies(this.postId, params);
					console.log('获取回复列表响应:', res);
					
					if (res && res.code === 200 && res.data) {
						console.log('回复列表数据:', res.data);
						
						const newReplies = res.data.list.map(reply => ({
							id: reply.id,
							postId: reply.postId,
							content: reply.content,
							userId: reply.userId,
							userName: reply.userName,
							userAvatar: reply.userAvatar || '/static/logo.png',
							likeCount: reply.likeCount || 0,
							createTime: reply.createTime,
							updateTime: reply.updateTime,
							isLiked: false // 添加点赞状态
						}));

						console.log('处理后的回复列表:', newReplies);

						if (isLoadMore) {
							this.replies = [...this.replies, ...newReplies];
						} else {
							this.replies = newReplies;
						}

						this.hasMore = this.replies.length < (res.data.total || 0);
						console.log('当前回复列表状态:', {
							total: this.replies.length,
							hasMore: this.hasMore
						});
					} else {
						console.error('获取回复列表失败:', res?.msg || '未知错误');
					}
				} catch (error) {
					console.error('获取回复列表失败:', error);
				} finally {
					uni.hideLoading();
					this.isLoadingMore = false;
				}
			},

			// 加载更多回复
			loadMoreReplies() {
				if (this.hasMore && !this.isLoadingMore) {
					this.page++;
					this.loadReplies(true);
				}
			},

			// 点赞回复
			likeReply(reply) {
				if (!this.checkLogin()) return;

				reply.isLiked = !reply.isLiked;
				if (reply.isLiked) {
					reply.likeCount++;
				} else {
					reply.likeCount--;
				}
				// TODO: 调用点赞API
			},

			// 回复评论
			replyToComment(reply) {
				if (!this.checkLogin()) return;
				
				this.showInput = true;
				this.commentText = `@${reply.userName} `;
				// TODO: 记录回复的父评论ID
			},

			// 检查是否是帖子作者
			checkIsAuthor() {
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo) {
					this.isAuthor = false;
					return;
				}
				const user = JSON.parse(userInfo);
				this.isAuthor = user.id === this.post.userId;
			},

			// 显示删除回复确认弹窗
			showDeleteReplyConfirm(reply) {
				this.selectedReply = reply;
				this.$refs.deleteReplyPopup.open();
			},

			// 关闭删除回复确认弹窗
			closeDeleteReplyPopup() {
				this.$refs.deleteReplyPopup.close();
				this.selectedReply = null;
			},

			// 删除回复
			async deleteReply() {
				if (!this.selectedReply) return;

				try {
					uni.showLoading({
						title: '删除中...'
					});

					const res = await api.user.deleteForumReply(
						this.postId,
						this.selectedReply.id,
						this.userInfo.id
					);

					if (res && res.code === 200) {
						// 从列表中移除该回复
						this.replies = this.replies.filter(reply => reply.id !== this.selectedReply.id);
						// 更新帖子回复数
						if (this.post.replyCount > 0) {
							this.post.replyCount--;
						}
					} else {
						console.error('删除回复失败:', res?.msg || '未知错误');
					}
				} catch (error) {
					console.error('删除回复失败:', error);
				} finally {
					uni.hideLoading();
					this.closeDeleteReplyPopup();
				}
			},
		}
	}
</script>

<style lang="scss">
	.post-detail {
		min-height: 100vh;
		background-color: #f8f5f0;
		background: linear-gradient(135deg, #f8f5f0 0%, #fff5e6 100%);
		padding-top: var(--status-bar-height);
		padding-bottom: 100rpx;

		.nav-bar {
			position: fixed;
			top: var(--status-bar-height);
			left: 0;
			right: 0;
			height: 88rpx;
			background-color: rgba(248, 245, 240, 0.95);
			backdrop-filter: blur(10px);
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			z-index: 100;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			border-bottom: 1rpx solid rgba(139, 69, 19, 0.1);

			.left,
			.right {
				padding: 20rpx;
				transition: opacity 0.3s ease;

				&:active {
					opacity: 0.7;
				}
			}

			.title {
				font-size: 32rpx;
				font-weight: 600;
				color: #8b4513;
				text-shadow: 0 1px 1px rgba(0,0,0,0.05);
				font-family: "楷体", KaiTi, serif;
			}
		}

		.post-content {
			margin-top: calc(var(--status-bar-height) + 108rpx);
			background-color: rgba(255, 255, 255, 0.95);
			backdrop-filter: blur(10px);
			padding: 30rpx;
			animation: fadeIn 0.5s ease-out;
			border-radius: 20rpx;
			margin: calc(var(--status-bar-height) + 108rpx) 20rpx 20rpx;
			box-shadow: 0 4rpx 20rpx rgba(139, 69, 19, 0.1);
			border: 1rpx solid rgba(139, 69, 19, 0.1);

			@keyframes fadeIn {
				from {
					opacity: 0;
					transform: translateY(20rpx);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}

			.post-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 30rpx;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid rgba(139, 69, 19, 0.1);

				.author-info {
					display: flex;
					align-items: center;

					.avatar {
						width: 80rpx;
						height: 80rpx;
						border-radius: 50%;
						margin-right: 20rpx;
						border: 2rpx solid #8b4513;
						box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
					}

					.info {
						.name {
							font-size: 32rpx;
							font-weight: 500;
							color: #8b4513;
							margin-bottom: 4rpx;
							font-family: "楷体", KaiTi, serif;
						}

						.time {
							font-size: 24rpx;
							color: #a0522d;
						}
					}
				}

				.post-actions {
					.delete-btn {
						padding: 10rpx;
						border-radius: 50%;
						transition: all 0.3s ease;

						&:active {
							background-color: rgba(139, 69, 19, 0.1);
						}
					}
				}
			}

			.content {
				margin-bottom: 30rpx;

				.title {
					font-size: 36rpx;
					font-weight: 600;
					color: #8b4513;
					margin-bottom: 20rpx;
					line-height: 1.4;
					text-shadow: 0 1px 1px rgba(0,0,0,0.05);
					font-family: "楷体", KaiTi, serif;
				}

				.text {
					font-size: 28rpx;
					color: #5c4033;
					line-height: 1.8;
					text-align: justify;
					font-family: "宋体", SimSun, serif;
				}
			}

			.tags {
				display: flex;
				margin-bottom: 30rpx;
				flex-wrap: wrap;
				gap: 12rpx;

				.tag {
					padding: 6rpx 20rpx;
					background-color: rgba(139, 69, 19, 0.1);
					backdrop-filter: blur(5px);
					border-radius: 20rpx;
					font-size: 24rpx;
					color: #8b4513;
					transition: transform 0.3s ease;
					border: 1rpx solid rgba(139, 69, 19, 0.2);

					&:active {
						transform: scale(0.95);
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

			.stats {
				display: flex;
				border-top: 1rpx solid rgba(139, 69, 19, 0.1);
				padding-top: 30rpx;
				margin-bottom: 30rpx;

				.stat-item {
					flex: 1;
					text-align: center;
					transition: transform 0.3s ease;

					&:active {
						transform: scale(0.95);
					}

					.label {
						font-size: 24rpx;
						color: #a0522d;
						margin-bottom: 8rpx;
					}

					.value {
						font-size: 32rpx;
						color: #8b4513;
						font-weight: 600;
						text-shadow: 0 1px 1px rgba(0,0,0,0.05);
					}
				}
			}

			.post-actions {
				display: flex;
				justify-content: space-around;
				align-items: center;
				padding: 20rpx 0;
				border-top: 1rpx solid rgba(139, 69, 19, 0.1);
				margin-top: 20rpx;

				.action {
					display: flex;
					align-items: center;
					padding: 12rpx 30rpx;
					border-radius: 30rpx;
					transition: all 0.3s ease;
					background-color: rgba(139, 69, 19, 0.05);
					backdrop-filter: blur(5px);
					border: 1rpx solid rgba(139, 69, 19, 0.1);

					&:active {
						transform: scale(0.95);
						background-color: rgba(139, 69, 19, 0.1);
					}

					uni-icons {
						margin-right: 8rpx;
					}

					text {
						font-size: 28rpx;
						color: #8b4513;
					}
				}
			}
		}

		.comments {
			margin: 20rpx;
			background-color: rgba(255, 255, 255, 0.95);
			backdrop-filter: blur(10px);
			padding: 30rpx;
			animation: slideUp 0.5s ease-out;
			border-radius: 20rpx;
			box-shadow: 0 4rpx 20rpx rgba(139, 69, 19, 0.1);
			border: 1rpx solid rgba(139, 69, 19, 0.1);

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

			.section-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #8b4513;
				margin-bottom: 30rpx;
				text-shadow: 0 1px 1px rgba(0,0,0,0.05);
				font-family: "楷体", KaiTi, serif;
			}

			.empty {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 60rpx 0;

				image {
					width: 200rpx;
					height: 200rpx;
					margin-bottom: 20rpx;
					opacity: 0.8;
				}

				text {
					font-size: 28rpx;
					color: #a0522d;
					font-family: "楷体", KaiTi, serif;
				}
			}

			.comment-list {
				.comment-item {
					padding: 30rpx 0;
					border-bottom: 1rpx solid rgba(139, 69, 19, 0.1);
					transition: transform 0.3s ease;

					&:last-child {
						border-bottom: none;
					}

					&:active {
						transform: translateX(4rpx);
					}

					.comment-user {
						display: flex;
						align-items: center;
						margin-bottom: 16rpx;

						.avatar {
							width: 64rpx;
							height: 64rpx;
							border-radius: 50%;
							margin-right: 16rpx;
							border: 2rpx solid #8b4513;
							box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
						}

						.info {
							.name {
								font-size: 26rpx;
								font-weight: 600;
								color: #8b4513;
								margin-bottom: 4rpx;
								text-shadow: 0 1px 1px rgba(0,0,0,0.05);
								font-family: "楷体", KaiTi, serif;
							}

							.time {
								font-size: 22rpx;
								color: #a0522d;
							}
						}

						.delete-btn {
							margin-left: auto;
							padding: 10rpx;
							border-radius: 50%;
							transition: all 0.3s ease;

							&:active {
								background-color: rgba(255, 77, 79, 0.1);
							}
						}
					}

					.comment-content {
						font-size: 28rpx;
						color: #5c4033;
						line-height: 1.6;
						margin-bottom: 16rpx;
						padding-left: 80rpx;
						font-family: "宋体", SimSun, serif;
					}

					.comment-actions {
						display: flex;
						padding-left: 80rpx;
						gap: 20rpx;

						.action {
							display: flex;
							align-items: center;
							padding: 6rpx 16rpx;
							border-radius: 20rpx;
							background-color: rgba(139, 69, 19, 0.05);
							backdrop-filter: blur(5px);
							transition: all 0.3s ease;
							border: 1rpx solid rgba(139, 69, 19, 0.1);

							&:active {
								transform: scale(0.95);
								background-color: rgba(139, 69, 19, 0.1);
							}

							uni-icons {
								margin-right: 4rpx;
							}

							text {
								font-size: 24rpx;
								color: #8b4513;
							}
						}
					}
				}

				.load-more {
					text-align: center;
					padding: 30rpx 0;
					color: #a0522d;
					font-size: 26rpx;
					transition: opacity 0.3s ease;
					font-family: "楷体", KaiTi, serif;

					&:active {
						opacity: 0.7;
					}
				}
			}
		}

		.comment-input {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background-color: rgba(248, 245, 240, 0.95);
			backdrop-filter: blur(10px);
			padding: 20rpx 30rpx;
			display: flex;
			align-items: center;
			box-shadow: 0 -2rpx 10rpx rgba(139, 69, 19, 0.1);
			animation: slideUp 0.3s ease-out;
			border-top: 1rpx solid rgba(139, 69, 19, 0.1);

			input {
				flex: 1;
				height: 72rpx;
				background-color: rgba(255, 255, 255, 0.8);
				backdrop-filter: blur(5px);
				border-radius: 36rpx;
				padding: 0 30rpx;
				font-size: 28rpx;
				margin-right: 20rpx;
				transition: all 0.3s ease;
				border: 1rpx solid rgba(139, 69, 19, 0.2);

				&:focus {
					background-color: rgba(255, 255, 255, 0.95);
					box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.1);
				}
			}

			.send-btn {
				width: 120rpx;
				height: 72rpx;
				background: linear-gradient(135deg, #8b4513, #a0522d);
				border-radius: 36rpx;
				color: #fff;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				border: none;
				box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
				font-family: "楷体", KaiTi, serif;

				&:active {
					transform: scale(0.95);
					box-shadow: 0 2rpx 4rpx rgba(139, 69, 19, 0.1);
				}

				&[disabled] {
					background: #ccc;
					box-shadow: none;
				}
			}
		}

		.edit-btn {
			padding: 20rpx;
			transition: opacity 0.3s ease;
			
			&:active {
				opacity: 0.7;
			}
		}
	}
</style> 