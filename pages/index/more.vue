<template>
	<view class="more-container">
		<!-- 页面背景装饰 -->
		<view class="page-backdrop">
			<view class="cloud-1"></view>
			<view class="cloud-2"></view>
			<view class="mountain"></view>
			<view class="pattern-overlay"></view>
		</view>

		<!-- 页面标题区 -->
		<view class="page-header" :style="{paddingTop: statusBarHeight + 'px'}">
			<!-- 返回按钮 -->
			<view class="back-btn" @tap="goBack">
				<view class="back-icon"></view>
				<text>返回</text>
			</view>

			<!-- 页面标题 -->
			<view class="page-title">
				<text class="title-text">热门景点</text>
				<view class="subtitle-container">
					<text class="subtitle-text">探索晋韵古建筑之美</text>
					<view class="title-decoration"></view>
				</view>
			</view>
		</view>

		<!-- 景点列表 -->
		<scroll-view class="attractions-list" 
			:style="{ height: `calc(100vh - ${statusBarHeight + headerHeight}px)` }" 
			scroll-y="true" 
			@scrolltolower="loadMore" 
			refresher-enabled 
			@refresherrefresh="onRefresh"
			:refresher-triggered="isRefreshing">
			<view class="scroll-tip">下拉刷新</view>
			<view class="attractions-content">
				<view class="attraction-item" v-for="(item, index) in filteredAttractions" :key="index"
					@tap="goToDetail(item.id)">
					<image class="attraction-image" :src="item.image" mode="aspectFill"></image>
					<view class="overlay-gradient"></view>
					<view class="attraction-info">
						<view class="attraction-title">{{ item.name }}</view>
						<view class="attraction-desc">{{ item.description }}</view>
						<view class="attraction-meta">
							<view class="location">
								<uni-icons type="location" size="14" color="#8B4513"></uni-icons>
								<text>{{ item.location || '山西省' }}</text>
							</view>
							<view class="rating">
								<uni-icons type="star-filled" size="14" color="#8B4513"></uni-icons>
								<text>{{ item.rating }}</text>
							</view>
						</view>
					</view>
					<view class="item-decoration"></view>
					<view class="corner-fold"></view>
				</view>

				<!-- 加载更多 -->
				<view class="loading-more" v-if="isLoading">
					<view class="loading-spinner"></view>
					<text>正在加载更多景点...</text>
				</view>
				<view class="no-more" v-if="noMore">
					<view class="divider"></view>
					<text>已经到达页面底部</text>
					<view class="divider"></view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import api from '@/api/index.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				headerHeight: 180, // 标题区域的默认高度
				isRefreshing: false,
				isLoading: false,
				noMore: false,
				page: 1,
				baseURL: 'http://192.168.194.9:8080',
				attractions: [],
				filteredAttractions: []
			}
		},
		onLoad() {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight
			this.loadAttractions()
		},
		mounted() {
			// 动态计算标题区域高度
			this.$nextTick(() => {
				// 延迟执行，确保组件完全渲染
				setTimeout(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('.page-header').boundingClientRect(data => {
						if (data) {
							// 计算标题区高度并添加边距
							this.headerHeight = data.height + 20;
							console.log('标题区域高度:', this.headerHeight);
						}
					}).exec();
				}, 100);
			});
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack({
					delta: 1
				})
			},

			// 下拉刷新
			async onRefresh() {
				try {
					this.isRefreshing = true
					this.page = 1
					this.attractions = []
					await this.loadAttractions()
					uni.showToast({
						title: '刷新成功',
						icon: 'success',
						duration: 1500
					})
				} catch (error) {
					console.error('刷新失败:', error)
					uni.showToast({
						title: '刷新失败，请重试',
						icon: 'none'
					})
				} finally {
					this.isRefreshing = false
				}
			},

			// 加载景点数据
			async loadAttractions() {
				try {
					this.isLoading = true
					const response = await api.user.home()
					console.log('API响应数据:', response)

					if (response.code === 200 || response.code === 0) {
						// 从 featuredBuildings 获取景点数据
						const newAttractions = response.data?.featuredBuildings || []

						// 转换数据格式以匹配模板需求
						const formattedAttractions = newAttractions.map(item => {
							// 确保图片路径有效，处理不同情况的URL
							const defaultImage = '/static/spot-default.png';
							let imageUrl = defaultImage;

							if (item.arModelUrl) {
								// 如果已经是绝对URL
								if (item.arModelUrl.startsWith('http')) {
									imageUrl = item.arModelUrl;
								}
								// 如果是相对路径
								else {
									imageUrl = `${this.baseURL}${item.arModelUrl}`;
								}
							}

							return {
								id: item.id,
								name: item.name,
								description: item.description || '暂无描述',
								image: imageUrl,
								location: item.location || '山西省太原市',
								rating: ((Math.random() * 0.5) + 4.5).toFixed(1)
							};
						})

						// 如果是第一页，直接替换数据
						if (this.page === 1) {
							this.attractions = formattedAttractions
						} else {
							// 否则追加数据
							this.attractions = [...this.attractions, ...formattedAttractions]
						}

						this.filteredAttractions = this.attractions

						// 判断是否还有更多数据
						this.noMore = newAttractions.length < 10

						// 页码加1
						if (!this.noMore) {
							this.page++
						}
					} else {
						uni.showToast({
							title: response.msg || '获取数据失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('加载景点数据失败:', error)
					uni.showToast({
						title: error.message || '加载失败，请重试',
						icon: 'none'
					})
				} finally {
					this.isLoading = false
				}
			},

			// 加载更多
			loadMore() {
				if (!this.isLoading && !this.noMore) {
					this.loadAttractions()
				}
			},

			// 跳转到详情页
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/index/heritage/detail?id=${id}`
				})
			}
		}
	}
</script>

<style lang="scss">
	.more-container {
		min-height: 100vh;
		background-color: #f8f4eb; // 与首页保持一致的米色背景
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding-bottom: env(safe-area-inset-bottom); // 增加对全面屏设备的支持

		// 页面背景装饰
		.page-backdrop {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 320rpx; // 增加高度使背景更加突出
			background: linear-gradient(135deg,
					#4a5d80 0%,
					#647899 25%,
					#7a8ba8 50%,
					#8a99b2 75%,
					#9aa7bd 100%);
			box-shadow: 0 6rpx 30rpx rgba(0, 0, 0, 0.15);
			overflow: hidden;
			z-index: 1;
			border-bottom-left-radius: 30rpx;
			border-bottom-right-radius: 30rpx;

			&::after {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
				background-size: 24rpx 24rpx;
				animation: twinkle 5s ease-in-out infinite;
				opacity: 0.6;
			}

			.pattern-overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				/* 使用重复渐变替代图片，避免图片路径错误 */
				background-image:
					repeating-linear-gradient(45deg,
						rgba(255, 255, 255, 0.05) 0px,
						rgba(255, 255, 255, 0.05) 2px,
						transparent 2px,
						transparent 12px);
				opacity: 0.5;
				mix-blend-mode: overlay;
			}

			.cloud-1,
			.cloud-2 {
				position: absolute;
				border-radius: 50px;
				background: rgba(255, 255, 255, 0.1);
				backdrop-filter: blur(2px);
			}

			.cloud-1 {
				width: 180rpx;
				height: 60rpx;
				top: 40rpx;
				right: 60rpx;
				animation: floatCloud 15s ease-in-out infinite;

				&::before,
				&::after {
					content: '';
					position: absolute;
					border-radius: 50%;
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(2px);
				}

				&::before {
					width: 80rpx;
					height: 80rpx;
					top: -30rpx;
					left: 20rpx;
				}

				&::after {
					width: 60rpx;
					height: 60rpx;
					top: -20rpx;
					right: 30rpx;
				}
			}

			.cloud-2 {
				width: 160rpx;
				height: 50rpx;
				top: 120rpx;
				left: 80rpx;
				animation: floatCloud 18s ease-in-out 2s infinite reverse;

				&::before,
				&::after {
					content: '';
					position: absolute;
					border-radius: 50%;
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(2px);
				}

				&::before {
					width: 70rpx;
					height: 70rpx;
					top: -25rpx;
					left: 15rpx;
				}

				&::after {
					width: 50rpx;
					height: 50rpx;
					top: -15rpx;
					right: 25rpx;
				}
			}

			.mountain {
				position: absolute;
				bottom: -30rpx;
				right: 100rpx;
				width: 0;
				height: 0;
				border-style: solid;
				border-width: 0 120rpx 100rpx 120rpx;
				border-color: transparent transparent rgba(255, 255, 255, 0.05) transparent;
			}
		}

		// 页面头部区域
		.page-header {
			position: relative;
			width: 100%;
			z-index: 2;
			padding-bottom: 30rpx;
			flex-shrink: 0;
			overflow: hidden;
			
			// 添加底部渐变阴影
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				height: 6rpx;
				background: linear-gradient(to right, 
					rgba(255, 255, 255, 0.1), 
					rgba(255, 255, 255, 0.4), 
					rgba(255, 255, 255, 0.1));
				border-radius: 3rpx;
				opacity: 0.7;
			}

			// 返回按钮
			.back-btn {
				position: absolute;
				left: 30rpx;
				top: 20rpx;
				display: flex;
				align-items: center;
				height: 64rpx;
				padding: 0 24rpx;
				background: rgba(255, 255, 255, 0.25);
				border-radius: 32rpx;
				backdrop-filter: blur(10px);
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
				z-index: 3;
				transition: all 0.25s ease;

				&:active {
					transform: scale(0.92);
					background: rgba(255, 255, 255, 0.3);
				}

				.back-icon {
					width: 24rpx;
					height: 24rpx;
					border-left: 4rpx solid rgba(255, 255, 255, 0.9);
					border-bottom: 4rpx solid rgba(255, 255, 255, 0.9);
					transform: rotate(45deg);
					margin-right: 12rpx;
					margin-left: -4rpx;
				}

				text {
					font-size: 28rpx;
					color: rgba(255, 255, 255, 0.95);
					letter-spacing: 2rpx;
					font-weight: 500;
				}
			}

			// 页面标题
			.page-title {
				padding: 120rpx 40rpx 20rpx;
				position: relative;

				.title-text {
					display: block;
					font-size: 48rpx;
					font-weight: 600;
					color: #ffffff;
					text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.35);
					margin-bottom: 16rpx;
					letter-spacing: 4rpx;
					position: relative;
					display: inline-block;
					
					// 添加装饰效果
					&::before {
						content: '';
						position: absolute;
						top: -10rpx;
						left: -10rpx;
						width: 30rpx;
						height: 30rpx;
						border-top: 3rpx solid rgba(255, 255, 255, 0.6);
						border-left: 3rpx solid rgba(255, 255, 255, 0.6);
						opacity: 0.7;
					}
				}

				.subtitle-container {
					display: flex;
					align-items: center;
					margin-top: 8rpx;

					.subtitle-text {
						font-size: 28rpx;
						color: rgba(255, 255, 255, 0.9);
						text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.25);
						position: relative;
						max-width: 70%;
						
						&::after {
							content: '';
							position: absolute;
							bottom: -16rpx;
							left: 0;
							width: 80rpx;
							height: 2px;
							background: linear-gradient(to right, rgba(255, 255, 255, 0.8), transparent);
							border-radius: 1px;
						}
					}

					.title-decoration {
						flex: 1;
						height: 1px;
						background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
						margin-left: 30rpx;
						opacity: 0.8;
					}
				}
			}
		}

		// 景点列表
		.attractions-list {
			position: relative;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 3;
			flex: 1;
			border-top-left-radius: 30rpx;
			border-top-right-radius: 30rpx;
			margin-top: 10rpx;
			background-color: rgba(248, 244, 235, 0.5);
			overflow: hidden;
			box-shadow: 0 -6rpx 20rpx rgba(0, 0, 0, 0.05);

			.scroll-tip {
				text-align: center;
				padding: 20rpx 0;
				color: rgba(139, 69, 19, 0.5);
				font-size: 24rpx;
				position: relative;
				margin-bottom: 10rpx;
				
				// 添加下拉指示图标
				&::before {
					content: '↓';
					position: absolute;
					left: calc(50% - 60rpx);
					color: rgba(139, 69, 19, 0.5);
					animation: bounceDown 1.5s ease-in-out infinite;
				}
				
				&::after {
					content: '↓';
					position: absolute;
					right: calc(50% - 60rpx);
					color: rgba(139, 69, 19, 0.5);
					animation: bounceDown 1.5s ease-in-out infinite;
				}
			}

			.attractions-content {
				padding: 30rpx;
				padding-bottom: 80rpx;

				.attraction-item {
					background-color: #fff;
					border-radius: 24rpx;
					margin-bottom: 36rpx;
					overflow: hidden;
					box-shadow: 0 10rpx 36rpx rgba(0, 0, 0, 0.1);
					position: relative;
					transition: all 0.35s ease;

					// 中国风纹理背景
					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						background-image: radial-gradient(rgba(139, 69, 19, 0.02) 1px, transparent 1px);
						background-size: 20rpx 20rpx;
						opacity: 0.5;
						pointer-events: none;
					}

					&:active {
						transform: translateY(6rpx) scale(0.98);
						box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.06);
					}

					.attraction-image {
						width: 100%;
						height: 380rpx;
						object-fit: cover;
						box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
					}

					.overlay-gradient {
						position: absolute;
						bottom: 0;
						left: 0;
						right: 0;
						height: 100rpx;
						background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3));
						z-index: 1;
						pointer-events: none;
						opacity: 0.5;
					}

					.attraction-info {
						padding: 32rpx;
						position: relative;
						background: linear-gradient(to bottom, #fff, rgba(255, 250, 240, 0.5));

						.attraction-title {
							font-size: 36rpx;
							font-weight: bold;
							color: #333;
							margin-bottom: 16rpx;
							position: relative;
							padding-left: 20rpx;

							// 标题装饰线
							&::before {
								content: '';
								position: absolute;
								left: 0;
								top: 8rpx;
								bottom: 8rpx;
								width: 6rpx;
								background: linear-gradient(to bottom, #8B4513, #D2691E);
								border-radius: 3rpx;
							}
						}

						.attraction-desc {
							font-size: 28rpx;
							color: #666;
							margin-bottom: 22rpx;
							line-height: 1.5;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
						}

						.attraction-meta {
							display: flex;
							align-items: center;
							justify-content: space-between;
							border-top: 1px dashed rgba(139, 69, 19, 0.1);
							padding-top: 20rpx;

							.location,
							.rating {
								display: flex;
								align-items: center;
								font-size: 26rpx;
								color: #8B4513;
								background: rgba(139, 69, 19, 0.05);
								padding: 8rpx 16rpx;
								border-radius: 20rpx;

								&:active {
									background: rgba(139, 69, 19, 0.1);
								}

								text {
									margin-left: 8rpx;
								}
							}
						}
					}

					// 角落折叠效果
					.corner-fold {
						position: absolute;
						top: 0;
						right: 0;
						width: 60rpx;
						height: 60rpx;
						background: linear-gradient(135deg, transparent 50%, rgba(139, 69, 19, 0.08) 50%);
						z-index: 2;
						transform-origin: top right;
						transition: all 0.3s ease;
					}

					&:active .corner-fold {
						transform: scale(1.2);
					}

					// 卡片右侧传统装饰元素
					.item-decoration {
						position: absolute;
						right: 0;
						bottom: 0;
						width: 36rpx;
						height: 36rpx;
						background-image: radial-gradient(circle at right bottom, #8B4513 0%, transparent 70%);
						opacity: 0.15;
					}
				}
			}
		}

		.loading-more,
		.no-more {
			text-align: center;
			padding: 30rpx;
			color: #8B4513;
			font-size: 28rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			opacity: 0.8;

			.loading-spinner {
				width: 40rpx;
				height: 40rpx;
				border: 3rpx solid rgba(139, 69, 19, 0.2);
				border-top-color: rgba(139, 69, 19, 0.8);
				border-radius: 50%;
				margin-right: 16rpx;
				animation: spin 1.2s linear infinite;
			}

			.divider {
				width: 90rpx;
				height: 1px;
				background: linear-gradient(to right, transparent, rgba(139, 69, 19, 0.3), transparent);
				margin: 0 20rpx;
			}
		}
	}

	// 动画
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes twinkle {

		0%,
		100% {
			opacity: 0.4;
		}

		50% {
			opacity: 0.8;
		}
	}

	@keyframes floatCloud {

		0%,
		100% {
			transform: translateY(0) translateX(0);
		}

		50% {
			transform: translateY(-10rpx) translateX(10rpx);
		}
	}

	// 添加下拉箭头动画
	@keyframes bounceDown {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(5rpx);
		}
	}
</style>