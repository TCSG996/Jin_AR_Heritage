<template>
	<view class="collection">
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="back" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<view class="title">我的收藏</view>
		</view>

		<!-- 收藏列表 -->
		<view class="collection-list">
			<view class="collection-item" v-for="(item, index) in collectionList" :key="index" @tap="goToDetail(item.post)">
				<view class="post-info">
					<view class="post-title">{{ item.post.title }}</view>
					<view class="post-meta">
						<text class="category">{{ item.post.categoryName }}</text>
						<view class="stats">
							<view class="stat-item">
								<uni-icons type="eye" size="14" color="#999"></uni-icons>
								<text>{{ item.post.viewCount }}</text>
							</view>
							<view class="stat-item">
								<uni-icons type="chat" size="14" color="#999"></uni-icons>
								<text>{{ item.post.replyCount }}</text>
							</view>
							<view class="stat-item">
								<uni-icons type="heart" size="14" color="#999"></uni-icons>
								<text>{{ item.post.likeCount }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="collection-time">{{ formatTime(item.createTime) }}</view>
			</view>
		</view>

		<!-- 加载更多 -->
		<view class="load-more" v-if="collectionList.length > 0">
			<uni-load-more :status="loadMoreStatus" :contentText="loadMoreText" />
		</view>

		<!-- 空状态 -->
		<view class="empty" v-if="collectionList.length === 0 && !isLoading">
			<image src="/static/empty.png" mode="aspectFit"></image>
			<text>暂无收藏内容</text>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';

	export default {
		data() {
			return {
				collectionList: [],
				page: 1,
				pageSize: 10,
				isLoading: false,
				hasMore: true,
				userInfo: null,
				loadMoreStatus: 'more',
				loadMoreText: {
					contentdown: '上拉加载更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多了'
				}
			}
		},
		onLoad() {
			this.getUserInfo();
			this.loadCollectionList();
		},
		methods: {
			// 获取用户信息
			async getUserInfo() {
				try {
					const userInfoStr = uni.getStorageSync('userInfo');
					if (!userInfoStr) {
						this.userInfo = null;
						return;
					}
					this.userInfo = JSON.parse(userInfoStr);
				} catch (error) {
					console.error('获取用户信息失败:', error);
					this.userInfo = null;
				}
			},

			// 加载收藏列表
			async loadCollectionList() {
				if (this.isLoading || !this.hasMore) return;
				
				try {
					this.isLoading = true;
					this.loadMoreStatus = 'loading';

					const params = {
						userId: this.userInfo.id,
						type: 1,  // 1-帖子收藏
						page: this.page,
						pageSize: this.pageSize
					};

					const res = await api.user.getUserFavorites(params);
					
					if (res && res.code === 200) {
						const newList = res.data.list || [];
						
						// 更新列表数据
						if (this.page === 1) {
							this.collectionList = newList;
						} else {
							this.collectionList = [...this.collectionList, ...newList];
						}

						// 更新加载状态
						this.hasMore = this.collectionList.length < res.data.total;
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
					} else {
						this.loadMoreStatus = 'more';
						uni.showToast({
							title: res?.msg || '加载失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载收藏列表失败:', error);
					this.loadMoreStatus = 'more';
					uni.showToast({
						title: '加载失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					this.isLoading = false;
				}
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '未知时间';

				const date = new Date(timestamp);
				const now = new Date();
				const diff = now - date;

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
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
				}
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 跳转到帖子详情
			goToDetail(post) {
				uni.navigateTo({
					url: `/pages/post/detail?id=${post.id}`
				});
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1;
			this.hasMore = true;
			this.loadCollectionList().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		// 上拉加载更多
		onReachBottom() {
			if (this.hasMore) {
				this.page++;
				this.loadCollectionList();
			}
		}
	}
</script>

<style lang="scss">
	.collection {
		min-height: 100vh;
		background-color: #f5f6fa;
		padding-top: 88rpx;

		.nav-bar {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 88rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			padding: 0 30rpx;
			z-index: 100;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			.back {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.title {
				flex: 1;
				text-align: center;
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
		}

		.collection-list {
			padding: 20rpx;

			.collection-item {
				background-color: #fff;
				border-radius: 16rpx;
				padding: 30rpx;
				margin-bottom: 20rpx;
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.98);
				}

				.post-info {
					flex: 1;
					margin-right: 20rpx;

					.post-title {
						font-size: 30rpx;
						font-weight: 500;
						color: #333;
						margin-bottom: 16rpx;
						line-height: 1.4;
					}

					.post-meta {
						display: flex;
						align-items: center;
						justify-content: space-between;

						.category {
							font-size: 24rpx;
							color: #4a90e2;
							background-color: rgba(74, 144, 226, 0.1);
							padding: 4rpx 16rpx;
							border-radius: 20rpx;
						}

						.stats {
							display: flex;
							align-items: center;

							.stat-item {
								display: flex;
								align-items: center;
								margin-left: 20rpx;
								font-size: 24rpx;
								color: #999;

								uni-icons {
									margin-right: 4rpx;
								}
							}
						}
					}
				}

				.collection-time {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.load-more {
			padding: 20rpx 0;
		}

		.empty {
			padding: 100rpx 0;
			display: flex;
			flex-direction: column;
			align-items: center;

			image {
				width: 200rpx;
				height: 200rpx;
				margin-bottom: 20rpx;
			}

			text {
				font-size: 28rpx;
				color: #999;
			}
		}
	}
</style> 