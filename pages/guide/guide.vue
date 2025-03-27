<template>
	<view class="guide-container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
			</view>
			<text class="title">景点导览</text>
		</view>

		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="search-box">
				<uni-icons type="search" size="20" color="#666"></uni-icons>
				<input 
					type="text" 
					v-model="searchKeyword" 
					placeholder="搜索景点" 
					@input="handleSearch"
				/>
			</view>
		</view>

		<!-- 分类筛选 -->
		<scroll-view 
			class="category-scroll" 
			scroll-x="true"
			:show-scrollbar="false"
			:scroll-with-animation="true"
			@touchmove.stop="() => {}"
		>
			<view class="category-list">
				<view 
					v-for="(item, index) in categories" 
					:key="index"
					:class="['category-item', { active: currentCategory === item.id }]"
					@tap="selectCategory(item.id)"
				>
					{{ item.name }}
				</view>
			</view>
		</scroll-view>

		<!-- 景点列表 -->
		<scroll-view 
			class="spots-scroll" 
			scroll-y="true" 
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
			:scroll-anchoring="true"
			@touchmove.stop.prevent="() => {}"
		>
			<view class="spots-list" @touchmove.stop="() => {}">
				<view v-if="isLoading && spots.length === 0" class="loading-container">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>
				<view 
					v-for="(spot, index) in filteredSpots" 
					:key="index"
					class="spot-item"
					@tap="navigateToDetail(spot.id)"
				>
					<image :src="getImageUrl(spot.imageUrl)" mode="aspectFill" class="spot-image"></image>
					<view class="spot-info">
						<text class="spot-name">{{ spot.name }}</text>
						<text class="spot-desc">{{ spot.description }}</text>
						<view class="spot-meta">
							<view class="spot-rating">
								<uni-icons type="star-filled" size="14" color="#FFB800"></uni-icons>
								<text>{{ generateRating(spot) }}</text>
							</view>
							<view class="spot-distance">
								<uni-icons type="location" size="14" color="#666"></uni-icons>
								<text>{{ getRandomDistance() }}km</text>
							</view>
						</view>
					</view>
				</view>
				<view v-if="spots.length === 0 && !isLoading" class="empty-tip">
					<image src="/static/empty.png" mode="aspectFit"></image>
					<text>暂无景点数据</text>
				</view>
			</view>
			<uni-load-more :status="loadMoreStatus"></uni-load-more>
		</scroll-view>
	</view>
</template>

<script>
	import api from '@/api/index.js';
	
	export default {
		data() {
			return {
				statusBarHeight: 0,
				searchKeyword: '',
				currentCategory: 0,
				isRefreshing: false,
				isLoading: false,
				loadMoreStatus: 'more',
				page: 1,
				pageSize: 10,
				total: 0,
				baseURL: 'http://192.168.194.9:8080',
				categories: [
					{ id: 0, name: '全部' },
					{ id: 1, name: '寺庙' },
					{ id: 2, name: '古建筑' },
					{ id: 3, name: '古城墙' },
					{ id: 4, name: '古街巷' },
					{ id: 5, name: '古村落' }
				],
				spots: [],
				// 缓存评分
				ratingsCache: {}
			}
		},
		computed: {
			filteredSpots() {
				if (!this.searchKeyword.trim()) {
					return this.spots;
				}
				return this.spots.filter(spot => {
					return spot.name.includes(this.searchKeyword) || 
						   (spot.description && spot.description.includes(this.searchKeyword));
				});
			}
		},
		onLoad() {
			// 获取状态栏高度
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
			// 加载景点数据
			this.loadBuildingsData();
		},
		methods: {
			// 加载建筑数据
			async loadBuildingsData() {
				this.isLoading = true;
				
				try {
					// 构建请求参数
					const params = {
						page: this.page,
						size: this.pageSize
					};
					
					// 如果选择了特定分类，添加分类筛选
					if (this.currentCategory !== 0) {
						params.category = this.currentCategory;
					}
					
					const res = await api.user.getBuildings(params);
					
					console.log('建筑数据响应:', res);
					
					if (res.code === 200 && res.data) {
						// 如果是第一页，替换数据；否则追加数据
						if (this.page === 1) {
							this.spots = res.data;
						} else {
							this.spots = [...this.spots, ...res.data];
						}
						
						// 更新总数
						if (res.total !== undefined) {
							this.total = res.total;
						}
						
						// 判断是否还有更多数据
						this.loadMoreStatus = this.spots.length < this.total ? 'more' : 'noMore';
					} else {
						uni.showToast({
							title: res.msg || '获取景点数据失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载景点数据失败:', error);
					uni.showToast({
						title: '网络请求失败，请重试',
						icon: 'none'
					});
				} finally {
					this.isLoading = false;
				}
			},
			
			// 获取图片URL
			getImageUrl(imageUrl) {
				if (!imageUrl) {
					return '/static/spot-default.png';
				}
				
				if (imageUrl.startsWith('http')) {
					return imageUrl;
				}
				
				return `${this.baseURL}${imageUrl}`;
			},
			
			// 生成随机评分
			generateRating(spot) {
				// 使用缓存，避免每次渲染时评分变化
				if (!this.ratingsCache[spot.id]) {
					this.ratingsCache[spot.id] = (4 + Math.random() * 0.9).toFixed(1);
				}
				return this.ratingsCache[spot.id];
			},
			
			// 生成随机距离（实际项目中应使用真实地理位置计算）
			getRandomDistance() {
				return (Math.random() * 10).toFixed(1);
			},
			
			goBack() {
				uni.navigateBack();
			},
			
			handleSearch(e) {
				this.searchKeyword = e.detail.value;
			},
			
			selectCategory(categoryId) {
				if (this.currentCategory === categoryId) return;
				
				this.currentCategory = categoryId;
				this.page = 1;
				this.spots = [];
				this.loadBuildingsData();
			},
			
			async loadMore() {
				if (this.loadMoreStatus !== 'more' || this.isLoading) return;
				
				this.loadMoreStatus = 'loading';
				this.page++;
				await this.loadBuildingsData();
			},
			
			async onRefresh() {
				this.isRefreshing = true;
				this.page = 1;
				await this.loadBuildingsData();
				this.isRefreshing = false;
			},
			
			navigateToDetail(spotId) {
				uni.navigateTo({
					url: `/pages/guide/detail?id=${spotId}`
				});
			}
		}
	}
</script>

<style lang="scss">
	.guide-container {
		min-height: 100vh;
		background-color: #f8f8f8;

		.header {
			background: linear-gradient(135deg, #4A5568, #2D3748);
			padding: 10px 20px;
			display: flex;
			align-items: center;
			height: 44px;
			position: relative;

			.back-btn {
				width: 40px;
				height: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
				position: absolute;
				left: 5px;
			}

			.title {
				color: #fff;
				font-size: 18px;
				font-weight: bold;
				width: 100%;
				text-align: center;
			}
		}

		.search-section {
			padding: 12px 16px;
			background-color: #fff;

			.search-box {
				background-color: #f5f5f5;
				border-radius: 8px;
				padding: 8px 12px;
				display: flex;
				align-items: center;
				gap: 8px;

				input {
					flex: 1;
					font-size: 14px;
					color: #333;
				}
			}
		}

		.category-scroll {
			background-color: #fff;
			padding: 12px 0;
			white-space: nowrap;
			border-bottom: 1px solid #eee;
			position: relative;
			z-index: 10;
			touch-action: pan-x;

			.category-list {
				padding: 0 16px;
				display: inline-flex;
				gap: 12px;

				.category-item {
					padding: 6px 16px;
					border-radius: 16px;
					font-size: 14px;
					color: #666;
					background-color: #f5f5f5;
					transition: all 0.3s;
					-webkit-tap-highlight-color: transparent;

					&.active {
						background-color: #4A5568;
						color: #fff;
					}
				}
			}
		}

		.spots-scroll {
			height: calc(100vh - 44px - var(--status-bar-height));

			.loading-container {
				padding: 40px 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				
				.loading-spinner {
					width: 40px;
					height: 40px;
					border: 3px solid #f3f3f3;
					border-top: 3px solid #4A5568;
					border-radius: 50%;
					animation: spin 1s linear infinite;
					margin-bottom: 10px;
				}
				
				.loading-text {
					color: #666;
					font-size: 14px;
				}
				
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			}
			
			.empty-tip {
				padding: 60px 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				
				image {
					width: 120px;
					height: 120px;
					margin-bottom: 16px;
					opacity: 0.6;
				}
				
				text {
					color: #999;
					font-size: 14px;
				}
			}

			.spots-list {
				padding: 16px;

				.spot-item {
					background-color: #fff;
					border-radius: 16px;
					margin-bottom: 20px;
					overflow: hidden;
					box-shadow: 0 4px 12px rgba(0,0,0,0.08);
					transition: transform 0.3s ease;
					position: relative;
					will-change: transform;
					touch-action: pan-y;
					-webkit-tap-highlight-color: transparent;
					
					&:active {
						transform: scale(0.98);
					}

					.spot-image {
						width: 100%;
						height: 200px;
						position: relative;
						
						&::after {
							content: '';
							position: absolute;
							bottom: 0;
							left: 0;
							right: 0;
							height: 40px;
							background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
						}
					}

					.spot-info {
						padding: 16px;

						.spot-name {
							font-size: 18px;
							font-weight: bold;
							color: #333;
							margin-bottom: 8px;
						}

						.spot-desc {
							font-size: 14px;
							color: #666;
							margin-bottom: 12px;
							display: -webkit-box;
							-webkit-line-clamp: 2;
							-webkit-box-orient: vertical;
							overflow: hidden;
							line-height: 1.5;
						}

						.spot-meta {
							display: flex;
							align-items: center;
							gap: 20px;

							.spot-rating, .spot-distance {
								display: flex;
								align-items: center;
								gap: 6px;
								font-size: 13px;
								color: #666;
							}
							
							.spot-rating {
								color: #FFB800;
								font-weight: 500;
							}
						}
					}
				}
			}
		}
	}
</style> 