<template>
	<view class="index">
		<!-- 背景图 -->
		<view class="backdrop">
			<view class="overlay"></view>
			<view class="welcome-text">
				<text class="main-text">晋韵古建</text>
				<text class="sub-text">探索传统建筑之美</text>
			</view>
			<!-- 中国风装饰元素 -->
			<view class="chinese-decoration">
				<view class="cloud-1"></view>
				<view class="cloud-2"></view>
				<view class="mountain-1"></view>
				<view class="mountain-2"></view>
			</view>
		</view>

		<!-- 搜索框组件开始 -->
		<uni-search-bar class="custom-search" placeholder="搜索景点、文物、活动" @confirm="search" @input="input" :radius="90"
			bgColor="rgba(255, 255, 255, 0.98)" cancelButton="none"></uni-search-bar>
		<!-- 搜索框组件结束 -->

		<!-- 功能区域模块开始 -->
		<view class="features">
			<!-- 功能项 -->
			<view class="one" v-for="(item, index) in features" :key="index" @tap="handleFeatureClick(item)">
				<view class="icon-wrapper" :class="`icon-${index}`">
					<image :src="item.icon" mode="aspectFit"></image>
				</view>
				<view class="text">{{ item.text }}</view>
			</view>
		</view>
		<!-- 功能区域模块结束 -->

		<!-- 热门经典模块开始 -->
		<view class="hot-spots">
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
						<image :src="getImageUrl(item.image)" mode="aspectFill"></image>
						<view class="tag" v-if="index < 3">TOP {{ index + 1 }}</view>
					</view>
					<view class="right">
						<view class="title">{{ item.name }}</view>
						<view class="desc">{{ item.desc }}</view>
						<view class="meta">
							<view class="rating">
								<uni-icons type="star-filled" size="12" color="#ff9900"></uni-icons>
								<text>{{ getRating(item) }}</text>
							</view>
							<view class="visits">
								<uni-icons type="eye" size="12" color="#666"></uni-icons>
								<text>{{ getVisitCount(item) }}</text>
							</view>
						</view>
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
				// 缓存评分和访问量，避免重复计算
				ratingsCache: {},
				visitsCache: {},
				features: [{
						icon: '/static/index/guide.png',
						text: '景点导览',
						path: '/pages/guide/guide'
					},
					{
						icon: '/static/index/AR.png',
						text: 'AR体验',
						path: '/pages/index/AR'
					},
					{
						icon: '/static/index/heritage.png',
						text: '文物展示',
						path: '/pages/index/heritage/list'
					},
					{
						icon: '/static/index/book.png',
						text: '景点预约',
						path: '/pages/index/booking/booking'
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
			// 预先生成缓存数据
			this.generateCacheData();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getHomeData(true);
		},
		methods: {
			// 获取首页数据
			getHomeData(isPullDown = false) {
				if (!isPullDown) {
					this.isLoading = true;
				}

				// 使用API接口获取首页数据
				api.user.home()
					.then(res => {
						console.log('首页数据:', res);
						if (res && res.code === 200 && res.data && res.data.featuredBuildings) {
							// 获取成功，更新热门景点数据
							this.hotSpots = res.data.featuredBuildings.map(spot => {
								const defaultImage = '/static/spot-default.png';
								let imageUrl = defaultImage;
								
								if (spot.imageUrl) {
									// 使用imageUrl作为图片路径，而不是arModelUrl
									imageUrl = spot.imageUrl.startsWith('http') ? 
										spot.imageUrl : 
										`${this.baseURL}${spot.imageUrl}`;
								}
								
								// 确保ID是数字类型，这对于detail页面很重要
								const numericId = parseInt(spot.id);
								
								return {
									id: numericId || spot.id, // 使用解析后的数字ID，如果解析失败则使用原始ID
									name: spot.name || '未命名景点',
									desc: spot.description || '暂无描述信息',
									image: imageUrl
								};
							});
							
							// 成功获取数据显示提示
							if (isPullDown) {
								uni.showToast({
									title: '刷新成功',
									icon: 'success'
								});
							}
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
			
			// 生成并缓存评分和访问数据，避免每次渲染时重新计算
			generateCacheData() {
				// 每次加载页面时重置缓存
				this.ratingsCache = {};
				this.visitsCache = {};
				
				// 为常用ID预先生成数据
				const commonIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
				commonIds.forEach(id => {
					this.ratingsCache[id] = (4 + Math.random() * 0.8).toFixed(1);
					this.visitsCache[id] = Math.floor(Math.random() * 1000) + 500;
				});
			},
			
			// 获取景点评分
			getRating(item) {
				if (!this.ratingsCache[item.id]) {
					this.ratingsCache[item.id] = (4 + Math.random() * 0.8).toFixed(1);
				}
				return this.ratingsCache[item.id];
			},
			
			// 获取景点访问量
			getVisitCount(item) {
				if (!this.visitsCache[item.id]) {
					this.visitsCache[item.id] = Math.floor(Math.random() * 1000) + 500;
				}
				return this.visitsCache[item.id];
			},
			
			// 获取图片URL，并处理错误情况
			getImageUrl(imageUrl) {
				// 使用默认图片作为备选
				return imageUrl || '/static/spot-default.png';
			},

			// 搜索功能
			search(e) {
				console.log('搜索:', e.value);
				if (!e.value.trim()) {
					uni.showToast({
						title: '请输入搜索关键词',
						icon: 'none'
					});
					return;
				}
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
				console.log('查看景点:', spot, 'ID类型:', typeof spot.id);
				uni.navigateTo({
					url: `/pages/index/heritage/detail?id=${spot.id}`
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

<style scoped lang="scss">
	.index {
		background-color: #f8f4eb; // 更温和的米色背景
		min-height: 100vh;
		position: relative;
		overflow: hidden;

		.backdrop {
			background: linear-gradient(135deg,
					#4a5d80 0%,
					#647899 25%,
					#7a8ba8 50%,
					#8a99b2 75%,
					#9aa7bd 100%);
			width: 100%;
			height: 500rpx; // 稍微增高背景
			border-bottom-left-radius: 70rpx;
			border-bottom-right-radius: 70rpx;
			position: relative;
			overflow: hidden;
			box-shadow: 0 6rpx 30rpx rgba(0, 0, 0, 0.2);

			// 顶部装饰图案
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 140rpx;
				background: linear-gradient(to bottom,
						rgba(255, 255, 255, 0.15) 0%,
						rgba(255, 255, 255, 0.08) 50%,
						transparent 100%);
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
						rgba(255, 255, 255, 0.18) 0%,
						rgba(255, 255, 255, 0.12) 25%,
						transparent 50%);
				animation: rotateGradient 20s linear infinite;
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
					background: repeating-linear-gradient(45deg,
							rgba(255, 255, 255, 0.07) 0%,
							rgba(255, 255, 255, 0.07) 1px,
							transparent 1px,
							transparent 12px);
					animation: moveWave 25s linear infinite;
				}

				// 第二层装饰：点状纹理
				&::after {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px,
							transparent 1px);
					background-size: 24rpx 24rpx;
					animation: twinkle 5s ease-in-out infinite;
				}
			}

			.welcome-text {
				position: absolute;
				top: 70rpx;
				left: 50rpx;
				z-index: 2;

				.main-text {
					font-size: 64rpx;
					color: #ffffff;
					font-weight: 600;
					text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.35);
					display: block;
					margin-bottom: 26rpx;
					letter-spacing: 10rpx;
					position: relative;
					animation: fadeInUp 0.9s ease-out;

					&::after {
						content: '';
						position: absolute;
						bottom: -12rpx;
						left: 0;
						width: 160rpx;
						height: 6rpx;
						background: linear-gradient(to right,
								rgba(255, 255, 255, 0.95),
								rgba(255, 255, 255, 0));
						border-radius: 6rpx;
					}
				}

				.sub-text {
					font-size: 32rpx;
					color: rgba(255, 255, 255, 0.95);
					text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.25);
					letter-spacing: 6rpx;
					position: relative;
					padding-left: 30rpx;
					animation: fadeInUp 0.9s ease-out 0.25s both;

					&::before {
						content: '';
						position: absolute;
						top: 50%;
						left: 0;
						width: 10rpx;
						height: 10rpx;
						background: #ffffff;
						border-radius: 50%;
						opacity: 0.9;
						transform: translateY(-50%);
					}
				}
			}

			// 中国风装饰元素
			.chinese-decoration {
				position: absolute;
				width: 100%;
				height: 100%;
				pointer-events: none;

				.cloud-1,
				.cloud-2 {
					position: absolute;
					width: 220rpx;
					height: 80rpx;
					border-radius: 50px;
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(2px);
				}

				.cloud-1 {
					top: 60rpx;
					right: 80rpx;
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
						width: 100rpx;
						height: 100rpx;
						top: -40rpx;
						left: 20rpx;
					}

					&::after {
						width: 80rpx;
						height: 80rpx;
						top: -30rpx;
						right: 40rpx;
					}
				}

				.cloud-2 {
					top: 180rpx;
					left: -30rpx;
					width: 180rpx;
					height: 60rpx;
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
						width: 80rpx;
						height: 80rpx;
						top: -30rpx;
						left: 10rpx;
					}

					&::after {
						width: 60rpx;
						height: 60rpx;
						top: -20rpx;
						right: 30rpx;
					}
				}

				.mountain-1,
				.mountain-2 {
					position: absolute;
					bottom: 0;
					width: 0;
					height: 0;
					border-style: solid;
				}

				.mountain-1 {
					right: 150rpx;
					border-width: 0 150rpx 120rpx 150rpx;
					border-color: transparent transparent rgba(255, 255, 255, 0.05) transparent;
				}

				.mountain-2 {
					right: -30rpx;
					border-width: 0 120rpx 180rpx 120rpx;
					border-color: transparent transparent rgba(255, 255, 255, 0.04) transparent;
				}
			}
		}

		.custom-search {
			position: relative;
			width: 680rpx;
			margin: -280rpx auto 0;
			z-index: 10;

			:deep(.uni-searchbar) {
				background-color: rgba(255, 255, 255, 0.98) !important;
				box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
				border-radius: 90rpx;
				padding: 0 20rpx;
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.98);
				}

				.uni-searchbar__box {
					border-width: 0;
				}
			}
		}

		.features {
			margin: 110rpx 30rpx 0;
			padding: 46rpx 20rpx;
			background-color: rgba(255, 255, 255, 0.98);
			border-radius: 30rpx;
			box-shadow: 0 15rpx 40rpx rgba(102, 51, 0, 0.08);
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			position: relative;
			z-index: 5;

			// 中国风装饰图案
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 60rpx;
				background: linear-gradient(to bottom,
						rgba(139, 69, 19, 0.05),
						transparent);
				border-top-left-radius: 30rpx;
				border-top-right-radius: 30rpx;
				z-index: -1;
			}

			.one {
				width: 20%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				transition: all 0.35s ease;
				position: relative;
				padding: 20rpx 0;

				&:active {
					transform: scale(0.92);
				}

				.icon-wrapper {
					width: 110rpx;
					height: 110rpx;
					background: linear-gradient(145deg, rgba(139, 69, 19, 0.08), rgba(139, 69, 19, 0.05));
					border-radius: 30rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 18rpx;
					transition: all 0.35s ease;
					position: relative;
					overflow: hidden;
					box-shadow: 0 8rpx 16rpx rgba(139, 69, 19, 0.1);

					// 图标背景光效
					&::after {
						content: '';
						position: absolute;
						top: -50%;
						left: -50%;
						width: 200%;
						height: 200%;
						background: radial-gradient(circle at center,
								rgba(255, 255, 255, 0.3) 0%,
								transparent 70%);
						opacity: 0;
						transform: scale(1.5);
						transition: opacity 0.5s ease, transform 0.5s ease;
					}
					
					// 图标脉冲动画
					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						border-radius: 30rpx;
						background-color: rgba(255, 255, 255, 0.4);
						opacity: 0;
						transform: scale(0.8);
						animation: iconPulse 3s infinite;
					}

					// 为每个图标添加不同样式
					&.icon-0 {
						background: linear-gradient(145deg, rgba(65, 105, 225, 0.1), rgba(65, 105, 225, 0.05));
						
						&::before {
							background-color: rgba(65, 105, 225, 0.2);
							animation-delay: 0s;
						}
					}

					&.icon-1 {
						background: linear-gradient(145deg, rgba(50, 205, 50, 0.1), rgba(50, 205, 50, 0.05));
						
						&::before {
							background-color: rgba(50, 205, 50, 0.2);
							animation-delay: 0.5s;
						}
					}

					&.icon-2 {
						background: linear-gradient(145deg, rgba(139, 69, 19, 0.1), rgba(139, 69, 19, 0.05));
						
						&::before {
							background-color: rgba(139, 69, 19, 0.2);
							animation-delay: 1s;
						}
					}

					&.icon-3 {
						background: linear-gradient(145deg, rgba(255, 69, 0, 0.1), rgba(255, 69, 0, 0.05));
						
						&::before {
							background-color: rgba(255, 69, 0, 0.2);
							animation-delay: 1.5s;
						}
					}

					&.icon-4 {
						background: linear-gradient(145deg, rgba(148, 0, 211, 0.1), rgba(148, 0, 211, 0.05));
						
						&::before {
							background-color: rgba(148, 0, 211, 0.2);
							animation-delay: 2s;
						}
					}

					image {
						width: 58rpx;
						height: 58rpx;
						transition: all 0.35s ease;
						z-index: 1;
					}
				}

				.text {
					font-size: 26rpx;
					color: #333;
					text-align: center;
					font-weight: 500;
				}

				&:active .icon-wrapper {
					transform: translateY(-8rpx);
					box-shadow: 0 12rpx 20rpx rgba(139, 69, 19, 0.15);

					&::after {
						opacity: 1;
						transform: scale(1);
					}

					image {
						transform: scale(1.1);
					}
				}
			}
		}

		.hot-spots {
			margin: 50rpx 30rpx;
			padding: 20rpx 0;

			.title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 30rpx;
				padding: 0 10rpx;

				.left {
					font-size: 38rpx;
					font-weight: 600;
					color: #333;
					display: flex;
					align-items: center;
					text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.08);

					.icon {
						margin-right: 12rpx;
						font-size: 42rpx;
					}
				}

				.right {
					display: flex;
					align-items: center;
					font-size: 26rpx;
					color: #666;
					padding: 14rpx 22rpx;
					border-radius: 25rpx;
					background: linear-gradient(to right, rgba(139, 69, 19, 0.1), rgba(139, 69, 19, 0.05));
					transition: all 0.3s ease;
					box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.1);

					text {
						margin-right: 6rpx;
					}

					&:active {
						background: linear-gradient(to right, rgba(139, 69, 19, 0.15), rgba(139, 69, 19, 0.1));
						transform: scale(0.95);
						box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.08);
					}
				}
			}

			.loading-container {
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 60rpx 0;

				.loading-spinner {
					width: 46rpx;
					height: 46rpx;
					border: 4rpx solid rgba(139, 69, 19, 0.2);
					border-top-color: rgba(139, 69, 19, 0.8);
					border-radius: 50%;
					animation: spin 1.2s linear infinite;
				}

				.loading-text {
					margin-left: 20rpx;
					font-size: 28rpx;
					color: #666;
				}
			}

			.list {
				.one {
					display: flex;
					background-color: #fff;
					border-radius: 20rpx;
					padding: 24rpx;
					margin-bottom: 32rpx;
					position: relative;
					box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
					overflow: hidden;
					border: 1px solid rgba(0, 0, 0, 0.05);
					
					.left {
						position: relative;
						width: 230rpx;
						height: 170rpx;
						border-radius: 20rpx;
						overflow: hidden;
						background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
						
						&::before {
							content: '';
							position: absolute;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							background: linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%);
							z-index: 1;
						}

						image {
							width: 100%;
							height: 100%;
							transition: transform 0.3s ease;
						}

						.tag {
							position: absolute;
							top: 12rpx;
							left: 12rpx;
							background: linear-gradient(135deg, #8B4513, #D2691E);
							color: #fff;
							font-size: 20rpx;
							padding: 6rpx 14rpx;
							border-radius: 8rpx;
							font-weight: 500;
							box-shadow: 0 4rpx 8rpx rgba(139, 69, 19, 0.3);
							z-index: 2;
						}
					}

					.right {
						flex: 1;
						padding-left: 24rpx;
						position: relative;
						height: 170rpx;
						display: flex;
						flex-direction: column;

						.title {
							font-size: 34rpx;
							font-weight: 600;
							color: #333;
							margin-bottom: 8rpx;
						}

						.desc {
							font-size: 24rpx;
							color: #666;
							margin-top: 4rpx;
							margin-bottom: 16rpx;
							line-height: 1.4;
							min-height: 68rpx;
							max-height: 68rpx;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						.meta {
							display: flex;
							align-items: center;
							font-size: 22rpx;
							
							.rating {
								display: flex;
								align-items: center;
								margin-right: 20rpx;
								color: #ff9900;
								
								text {
									margin-left: 4rpx;
								}
							}
							
							.visits {
								display: flex;
								align-items: center;
								color: #666;
								
								text {
									margin-left: 4rpx;
								}
							}
						}
					}
					
					&:active {
						transform: scale(0.98);
						transition: transform 0.2s ease;
					}
				}

				.empty-tip {
					margin-top: 80rpx;
					display: flex;
					flex-direction: column;
					align-items: center;

					image {
						width: 280rpx;
						height: 280rpx;
						margin-bottom: 30rpx;
						opacity: 0.8;
					}

					text {
						font-size: 28rpx;
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
			height: 140rpx;
			background: linear-gradient(to top, rgba(248, 244, 235, 1), rgba(248, 244, 235, 0));
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

		0%,
		100% {
			opacity: 0.4;
		}

		50% {
			opacity: 0.8;
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes floatCloud {

		0%,
		100% {
			transform: translateY(0) translateX(0);
		}

		50% {
			transform: translateY(-15rpx) translateX(15rpx);
		}
	}

	// 添加新的动画
	@keyframes iconPulse {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		20% {
			opacity: 0.4;
		}
		50% {
			opacity: 0;
			transform: scale(1.2);
		}
		100% {
			opacity: 0;
			transform: scale(0.8);
		}
	}

	// 功能区
	.features {
		padding: 20rpx 30rpx 10rpx;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;

		.one {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin-bottom: 20rpx;
			
			@keyframes pulse {
				0% {
					box-shadow: 0 5rpx 15rpx rgba(139, 69, 19, 0.2);
				}
				50% {
					box-shadow: 0 8rpx 25rpx rgba(139, 69, 19, 0.4);
				}
				100% {
					box-shadow: 0 5rpx 15rpx rgba(139, 69, 19, 0.2);
				}
			}

			.icon-wrapper {
				width: 110rpx;
				height: 110rpx;
				background: linear-gradient(135deg, #fff5e6, #fff);
				border-radius: 30rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 12rpx;
				position: relative;
				box-shadow: 0 5rpx 15rpx rgba(139, 69, 19, 0.2);
				animation: pulse 3s infinite ease-in-out;
				transition: all 0.3s ease;
				
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.8), transparent 70%);
					border-radius: 30rpx;
					z-index: 1;
				}
				
				&::after {
					content: '';
					position: absolute;
					top: 2rpx;
					left: 2rpx;
					right: 2rpx;
					height: 50%;
					background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent);
					border-radius: 28rpx 28rpx 50% 50%;
					z-index: 1;
				}

				image {
					width: 64rpx;
					height: 64rpx;
					z-index: 2;
					transition: transform 0.2s ease;
				}
				
				&:active {
					transform: scale(0.95);
					box-shadow: 0 3rpx 10rpx rgba(139, 69, 19, 0.15);
					
					image {
						transform: scale(0.9);
					}
				}
			}

			.text {
				font-size: 24rpx;
				color: #333;
				margin-top: 8rpx;
				font-weight: 500;
			}
			
			&:nth-child(1) .icon-wrapper { animation-delay: 0s; }
			&:nth-child(2) .icon-wrapper { animation-delay: 0.6s; }
			&:nth-child(3) .icon-wrapper { animation-delay: 1.2s; }
			&:nth-child(4) .icon-wrapper { animation-delay: 1.8s; }
			&:nth-child(5) .icon-wrapper { animation-delay: 2.4s; }
		}
	}
</style>