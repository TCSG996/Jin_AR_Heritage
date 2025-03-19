<template>
	<view class="my">
		<!-- 顶部内容开始 -->
		<view class="background">
			<!-- 背景遮罩 -->
			<view class="backdrop-overlay"></view>
			<view class="user" @tap="goToUserInfo">
				<view class="avatar-container">
					<image class="avatar" :src="userInfo && userInfo.avatar ? userInfo.avatar : '/static/logo.png'"
						mode="aspectFill"></image>
					<view class="avatar-border"></view>
				</view>
				<view class="message">
					<view class="name">{{ userInfo ? userInfo.nickname || userInfo.username : '游客' }}</view>
					<view class="ID">ID：000000
						<!-- {{ userInfo ? userInfo.id || '未登录' : '未登录' }} -->
					</view>
				</view>
				<view class="userinfo">
					<uni-icons type="right" size="18" color="#FFFFFF"></uni-icons>
				</view>
			</view>
		</view>
		<!-- 顶部内容结束 -->

		<!-- 选择列表开始 -->
		<view class="list">
			<view class="one" hover-class="item-hover" @tap="goToCollection">
				<view class="left">
					<view class="icon-wrapper">
						<uni-icons type="star" size="24" color="#333"></uni-icons>
					</view>
					<view class="text">收藏</view>
				</view>
				<view class="right">
					<text class="count" v-if="collectionCount > 0">{{ collectionCount }}</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
			<view class="one" hover-class="item-hover" @tap="goToOrders">
				<view class="left">
					<view class="icon-wrapper">
						<uni-icons type="list" size="24" color="#333"></uni-icons>
					</view>
					<view class="text">订单</view>
				</view>
				<view class="right">
					<text class="count" v-if="orderCount > 0">{{ orderCount }}</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
			<view class="one" hover-class="item-hover" @tap="goToSettings">
				<view class="left">
					<view class="icon-wrapper">
						<uni-icons type="gear" size="24" color="#333"></uni-icons>
					</view>
					<view class="text">设置</view>
				</view>
				<view class="right">
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>
		<!-- 选择列表结束 -->

		<!-- 加载状态 -->
		<view class="loading" v-if="isLoading">
			<uni-load-more status="loading" :iconSize="18"
				:contentText="{contentdown: '加载中...',contentrefresh: '加载中...',contentnomore: '没有更多数据了'}" />
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';

	export default {
		data() {
			return {
				userInfo: null,
				isLoading: false,
				collectionCount: 0,
				orderCount: 0
			}
		},
		onLoad() {
			this.getUserInfo();
		},
		onShow() {
			// 每次显示页面时重新获取用户信息
			this.getUserInfo();

			// 检查是否从登录页返回
			const pages = getCurrentPages();
			const currentPage = pages[pages.length - 1];
			if (currentPage && currentPage.route.includes('my')) {
				// 延迟一下再次获取用户信息，确保登录后的数据已经保存到本地存储
				setTimeout(() => {
					this.getUserInfo();
				}, 500);
			}

			// 获取收藏和订单数量
			if (this.userInfo) {
				this.getMockData();
			}
		},
		methods: {
			// 获取模拟数据
			getMockData() {
				// 模拟延迟加载效果
				setTimeout(() => {
					// 模拟收藏数量（1-99之间的随机数）
					this.collectionCount = Math.floor(Math.random() * 99) + 1;
					// 模拟订单数量（1-20之间的随机数）
					this.orderCount = Math.floor(Math.random() * 20) + 1;
				}, 500);
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

							// 获取收藏和订单数量
							this.getMockData();
						} else {
							// console.log('用户信息不包含必要的基本信息');
							uni.removeStorageSync('userInfo');
							this.userInfo = null;
						}
					} catch (parseError) {
						console.error('解析用户信息失败:', parseError);
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

			// 跳转到用户信息页面
			goToUserInfo() {
				if (!this.userInfo) {
					uni.navigateTo({
						url: '/pages/login/login'
					});
					return;
				}
				uni.navigateTo({
					url: '/pages/my/userInfo'
				});
			},

			// 跳转到收藏页面
			goToCollection() {
				if (!this.checkLogin()) return;
				uni.showToast({
					title: '收藏功能开发中',
					icon: 'none'
				});
			},

			// 跳转到订单页面
			goToOrders() {
				if (!this.checkLogin()) return;
				uni.showToast({
					title: '订单功能开发中',
					icon: 'none'
				});
			},

			// 跳转到设置页面
			goToSettings() {
				if (!this.checkLogin()) return;
				uni.navigateTo({
					url: '/pages/my/settings'
				});
			},

			// 检查登录状态
			checkLogin() {
				if (!this.userInfo) {
					uni.showModal({
						title: '提示',
						content: '请先登录',
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
			}
		}
	}
</script>

<style lang="scss">
	.my {
		background-color: #f5f6fa;
		min-height: 100vh;
		position: relative;

		.background {
			background-image: url('/static/subscribe/4.jpg');
			width: 100%;
			height: 480rpx;
			background-size: cover;
			background-position: center;
			position: relative;
			overflow: hidden;

			// 背景遮罩
			.backdrop-overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
				backdrop-filter: blur(5px);
			}

			.user {
				position: relative;
				z-index: 1;
				display: flex;
				align-items: center;
				padding: 120rpx 50rpx;

				.avatar-container {
					position: relative;
					width: 180rpx;
					height: 180rpx;

					.avatar {
						width: 160rpx;
						height: 160rpx;
						border-radius: 50%;
						border: 4rpx solid rgba(255, 255, 255, 0.9);
						box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
						position: absolute;
						top: 10rpx;
						left: 10rpx;
						z-index: 2;
					}

					.avatar-border {
						position: absolute;
						top: 0;
						left: 0;
						width: 180rpx;
						height: 180rpx;
						border-radius: 50%;
						background: linear-gradient(135deg, #4a90e2, #57b6e9, #4a90e2);
						z-index: 1;
						animation: rotate 8s linear infinite;
					}
				}

				.message {
					flex: 1;
					margin-left: 30rpx;

					.name {
						font-size: 36rpx;
						font-weight: 600;
						color: #FFFFFF;
						text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
						margin-bottom: 12rpx;
					}

					.ID {
						font-size: 26rpx;
						color: rgba(255, 255, 255, 0.9);
						text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
					}
				}

				.userinfo {
					width: 60rpx;
					height: 60rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}

		.list {
			margin: -60rpx 30rpx 0;
			position: relative;
			z-index: 2;

			.one {
				margin-bottom: 20rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				background-color: rgba(255, 255, 255, 0.98);
				border-radius: 20rpx;
				height: 100rpx;
				padding: 0 30rpx;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
				transition: all 0.3s ease;

				.left {
					display: flex;
					align-items: center;

					image {
						width: 40rpx;
						height: 40rpx;
						margin-right: 20rpx;
					}

					.icon-wrapper {
						width: 40rpx;
						height: 40rpx;
						margin-right: 20rpx;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.text {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}
				}

				.right {
					display: flex;
					align-items: center;
					opacity: 0.6;

					.count {
						font-size: 24rpx;
						color: #666;
						margin-right: 8rpx;
					}
				}
			}
		}

		.loading {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 999;
		}
	}

	// 点击效果
	.item-hover {
		transform: scale(0.98);
		background-color: #f9f9f9;
	}

	// 头像旋转动画
	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>