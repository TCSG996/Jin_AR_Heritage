<template>
	<view class="index">
		<!-- 背景图 -->
		<view class="backdrop">
			<view class="overlay"></view>
			<view class="welcome-text">
				<text class="main-text">晋韵古建</text>
				<text class="sub-text">探索传统建筑之美</text>
			</view>
		</view>

		<!-- 搜索框组件开始 -->
		<uni-search-bar class="custom-search" placeholder="搜索景点、文物、活动" @confirm="search" @input="input"
			:radius="90" bgColor="rgba(255, 255, 255, 0.98)" cancelButton="none"></uni-search-bar>
		<!-- 搜索框组件结束 -->

		<!-- 功能区域模块开始 -->
		<view class="feature">
			<!-- 功能项 -->
			<view class="home" v-for="(item, index) in features" :key="index" @tap="handleFeatureClick(item)">
				<view class="icon-wrapper">
					<image :src="item.icon" mode="aspectFit"></image>
				</view>
				<view class="text">{{ item.text }}</view>
			</view>
		</view>
		<!-- 功能区域模块结束 -->

		<!-- 热门经典模块开始 -->
		<view class="hot">
			<!-- 标题 -->
			<view class="title">
				<view class="left">
					<text class="icon">📍</text>
					热门景点
				</view>
				<view class="right" @tap="gteMore">
					<text>更多景点</text>
					<uni-icons type="right" size="14" color="#666"></uni-icons>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-container" v-if="isLoading">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 列表 -->
			<view class="list" v-else>
				<view class="one" v-for="(item, index) in hotSpots" :key="index" @tap="viewSpot(item)">
					<view class="left">
						<image :src="`${baseURL}${item.image}`" mode="aspectFill"></image>
						<view class="tag" v-if="index < 3">TOP {{ index + 1 }}</view>
					</view>
					<view class="content">
						<text class="name">{{ item.name }}</text>
						<text class="desc">{{ item.desc }}</text>
						<view class="meta">
							<view class="rating">
								<uni-icons type="star-filled" size="12" color="#ff9900"></uni-icons>
								<text>{{ (4 + Math.random()).toFixed(1) }}</text>
							</view>
							<view class="visits">
								<uni-icons type="eye" size="12" color="#666"></uni-icons>
								<text>{{ Math.floor(Math.random() * 1000) + 500 }}</text>
							</view>
						</view>
					</view>
					<view class="right">
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</view>

				<!-- 无数据提示 -->
				<view class="empty-tip" v-if="hotSpots.length === 0">
					<image src="/static/empty.png" mode="aspectFit"></image>
					<text>暂无热门景点数据</text>
				</view>
			</view>
		</view>
		<!-- 热门经典模块结束 -->

		<!-- 底部装饰 -->
		<view class="bottom-decor"></view>
	</view>
</template>

<script>
	import api from '@/api/index.js';
	export default {
		data() {
			return {
				hotSpots: [], // 热门景点数据
				isLoading: false, // 加载状态
				searchValue: '', // 搜索值
				baseURL: 'http://192.168.194.9:8080',
				features: [{
						icon: '/static/index/guide.png',
						text: '景点导览',
						path: '/pages/guide/guide'
					},
					{
						icon: '/static/index/AR.png',
						text: 'AR体验',
						path: '/pages/AR/AR'
					},
					{
						icon: '/static/index/heritage.png',
						text: '文物展示',
						path: '/pages/heritage/list'
					},
					{
						icon: '/static/index/book.png',
						text: '预约讲解',
						path: '/pages/booking/guide'
					},
					{
						icon: '/static/index/activity.png',
						text: '文化活动',
						path: '/pages/activity/list'
					}
				]
			}
		},
		onLoad() {
			this.getHomeData();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getHomeData();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			// 获取首页数据
			getHomeData() {
				this.isLoading = true;

				// 使用API接口获取首页数据
				api.user.home()
					.then(res => {
						console.log('首页数据:', res);
						if (res && res.code === 200 && res.data && res.data.featuredBuildings) {
							// 获取成功，更新热门景点数据
							this.hotSpots = res.data.featuredBuildings.map(spot => ({
								id: spot.id,
								name: spot.name,
								desc: spot.description,
								image: spot.arModelUrl || '/static/spot-default.png'
							}));
						} else {
							// 获取失败，显示提示
							uni.showToast({
								title: res?.msg || '获取数据失败',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						// 请求出错
						console.error('请求首页数据出错:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					})
					.finally(() => {
						this.isLoading = false;
						// 停止下拉刷新动画
						uni.stopPullDownRefresh();
					});
			},

			// 搜索功能
			search(e) {
				console.log('搜索:', e.value);
				uni.navigateTo({
					url: `/pages/search/index?keyword=${e.value}`
				});
			},

			// 输入事件
			input(e) {
				this.searchValue = e.value;
			},

			// 处理功能点击
			handleFeatureClick(item) {
				uni.navigateTo({
					url: item.path
				});
			},

			// 查看景点详情
			viewSpot(spot) {
				console.log('查看景点:', spot);
				uni.navigateTo({
					url: `/pages/spot/detail?id=${spot.id}`
				});
			},

			// 查看更多景点
			gteMore() {
				uni.navigateTo({
					url: '/pages/index/more'
				})
			}
		}
	}
</script>

<style lang="scss">
	.index {
		background-color: #f5f6fa;
		min-height: 100vh;
		position: relative;
		overflow: hidden;

		.backdrop {
			background: linear-gradient(135deg, 
				#2c3448 0%,    // 深邃的藏青色
				#3a4a66 25%,   // 暗蓝灰色
				#4a5d80 50%,   // 青灰色
				#647899 75%,   // 淡蓝灰色
				#7a8ba8 100%   // 浅灰蓝色
			);
			width: 100%;
			height: 480rpx;
			border-bottom-left-radius: 60rpx;
			border-bottom-right-radius: 60rpx;
			position: relative;
			overflow: hidden;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);

			// 顶部装饰图案
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 120rpx;
				background: linear-gradient(to bottom,
					rgba(255, 255, 255, 0.1) 0%,
					rgba(255, 255, 255, 0.05) 50%,
					transparent 100%
				);
				backdrop-filter: blur(5px);
			}

			// 光晕效果
			&::after {
				content: '';
				position: absolute;
				top: -50%;
				left: -50%;
				right: -50%;
				bottom: -50%;
				background: radial-gradient(circle at center, 
					rgba(255, 255, 255, 0.15) 0%,
					rgba(255, 255, 255, 0.1) 25%,
					transparent 50%
				);
				animation: rotateGradient 15s linear infinite;
			}

			.overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				overflow: hidden;

				// 第一层装饰：波浪纹
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: -100%;
					width: 200%;
					height: 200%;
					background: repeating-linear-gradient(
						45deg,
						rgba(255, 255, 255, 0.05) 0%,
						rgba(255, 255, 255, 0.05) 1px,
						transparent 1px,
						transparent 10px
					);
					animation: moveWave 20s linear infinite;
				}

				// 第二层装饰：点状纹理
				&::after {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-image: radial-gradient(
						rgba(255, 255, 255, 0.1) 1px,
						transparent 1px
					);
					background-size: 20rpx 20rpx;
					animation: twinkle 4s ease-in-out infinite;
				}
			}

			.welcome-text {
				position: absolute;
				top: 60rpx;
				left: 40rpx;
				z-index: 2;
				
				.main-text {
					font-size: 56rpx;
					color: #ffffff;
					font-weight: 600;
					text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
					display: block;
					margin-bottom: 20rpx;
					letter-spacing: 8rpx;
					position: relative;
					animation: fadeInUp 0.8s ease-out;
					
					&::after {
						content: '';
						position: absolute;
						bottom: -10rpx;
						left: 0;
						width: 140rpx;
						height: 6rpx;
						background: linear-gradient(to right, 
							rgba(255, 255, 255, 0.9),
							rgba(255, 255, 255, 0)
						);
						border-radius: 6rpx;
					}
				}
				
				.sub-text {
					font-size: 30rpx;
					color: rgba(255, 255, 255, 0.9);
					text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
					letter-spacing: 4rpx;
					position: relative;
					padding-left: 24rpx;
					animation: fadeInUp 0.8s ease-out 0.2s both;
					
					&::before {
						content: '';
						position: absolute;
						top: 50%;
						left: 0;
						width: 8rpx;
						height: 8rpx;
						background: #ffffff;
						border-radius: 50%;
						opacity: 0.8;
						transform: translateY(-50%);
					}
				}
			}
		}

		.custom-search {
			position: relative;
			width: 670rpx;
			margin: -280rpx auto 0;
			z-index: 10;

			:deep(.uni-searchbar) {
				background-color: rgba(255, 255, 255, 0.98) !important;
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
				border-radius: 90rpx;
				padding: 0 20rpx;
				
				.uni-searchbar__box {
					border-width: 0;
				}
			}
		}

		.feature {
			margin: 100rpx 30rpx 0;
			padding: 40rpx 20rpx;
			background-color: rgba(255, 255, 255, 0.98);
			border-radius: 24rpx;
			box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			position: relative;
			z-index: 5;

			.home {
				width: 20%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				position: relative;
				padding: 16rpx 0;

				&:active {
					transform: scale(0.92);
				}

				.icon-wrapper {
					width: 88rpx;
					height: 88rpx;
					background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(126, 214, 223, 0.1));
					border-radius: 24rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 12rpx;
					transition: all 0.3s ease;
					
					image {
						width: 48rpx;
						height: 48rpx;
					}
				}

				.text {
					font-size: 24rpx;
					color: #333;
					text-align: center;
					font-weight: 500;
				}

				&:active .icon-wrapper {
					transform: translateY(-4rpx);
					box-shadow: 0 8rpx 16rpx rgba(74, 144, 226, 0.15);
				}
			}
		}

		.hot {
			margin: 40rpx 30rpx;
			padding: 20rpx 0;

			.title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;
				padding: 0 10rpx;

				.left {
					font-size: 36rpx;
					font-weight: 600;
					color: #333;
					display: flex;
					align-items: center;

					.icon {
						margin-right: 12rpx;
						font-size: 40rpx;
					}
				}

				.right {
					display: flex;
					align-items: center;
					font-size: 26rpx;
					color: #666;
					padding: 12rpx 20rpx;
					border-radius: 20rpx;
					background: rgba(74, 144, 226, 0.1);
					transition: all 0.3s ease;

					text {
						margin-right: 4rpx;
					}

					&:active {
						background: rgba(74, 144, 226, 0.2);
						transform: scale(0.95);
					}
				}
			}

			.loading-container {
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 40rpx 0;

				.loading-spinner {
					width: 40rpx;
					height: 40rpx;
					border: 4rpx solid rgba(74, 144, 226, 0.2);
					border-top-color: rgba(74, 144, 226, 0.8);
					border-radius: 50%;
					animation: spin 1s linear infinite;
				}

				.loading-text {
					margin-left: 16rpx;
					font-size: 26rpx;
					color: #666;
				}
			}

			.list {
				.one {
					margin-bottom: 24rpx;
					display: flex;
					align-items: center;
					background-color: #ffffff;
					padding: 20rpx;
					border-radius: 20rpx;
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
					transition: all 0.3s ease;

					&:active {
						transform: translateY(2rpx);
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
					}

					.left {
						margin-right: 24rpx;
						position: relative;

						image {
							width: 200rpx;
							height: 150rpx;
							border-radius: 16rpx;
							object-fit: cover;
						}

						.tag {
							position: absolute;
							top: 12rpx;
							left: 12rpx;
							background: linear-gradient(135deg, #ff9900, #ff6b6b);
							color: #fff;
							font-size: 20rpx;
							padding: 4rpx 12rpx;
							border-radius: 8rpx;
							font-weight: 500;
						}
					}

					.content {
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						height: 150rpx;
						padding: 8rpx 0;

						.name {
							font-size: 32rpx;
							font-weight: 600;
							color: #333;
							margin-bottom: 8rpx;
						}

						.desc {
							font-size: 24rpx;
							color: #666;
							line-height: 1.4;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
						}

						.meta {
							display: flex;
							align-items: center;
							margin-top: 12rpx;
							
							.rating, .visits {
								display: flex;
								align-items: center;
								font-size: 22rpx;
								color: #666;
								margin-right: 20rpx;
								
								text {
									margin-left: 4rpx;
								}
							}
						}
					}

					.right {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 60rpx;
						opacity: 0.6;
					}
				}

				.empty-tip {
					margin-top: 60rpx;
					display: flex;
					flex-direction: column;
					align-items: center;
					
					image {
						width: 240rpx;
						height: 240rpx;
						margin-bottom: 20rpx;
					}
					
					text {
						font-size: 26rpx;
						color: #999;
					}
				}
			}
		}

		.bottom-decor {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			height: 120rpx;
			background: linear-gradient(to top, rgba(245, 246, 250, 1), rgba(245, 246, 250, 0));
			pointer-events: none;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes rotateGradient {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes moveWave {
		0% {
			transform: translateX(0) translateY(0);
		}
		100% {
			transform: translateX(50%) translateY(-50%);
		}
	}

	@keyframes twinkle {
		0%, 100% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>