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
				<view 
					v-for="(spot, index) in filteredSpots" 
					:key="index"
					class="spot-item"
					@tap="navigateToDetail(spot.id)"
				>
					<image :src="spot.image" mode="aspectFill" class="spot-image"></image>
					<view class="spot-info">
						<text class="spot-name">{{ spot.name }}</text>
						<text class="spot-desc">{{ spot.description }}</text>
						<view class="spot-meta">
							<view class="spot-rating">
								<uni-icons type="star-filled" size="14" color="#FFB800"></uni-icons>
								<text>{{ spot.rating }}</text>
							</view>
							<view class="spot-distance">
								<uni-icons type="location" size="14" color="#666"></uni-icons>
								<text>{{ spot.distance }}km</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<uni-load-more :status="loadMoreStatus"></uni-load-more>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 0,
				searchKeyword: '',
				currentCategory: 0,
				isRefreshing: false,
				loadMoreStatus: 'more',
				page: 1,
				categories: [
					{ id: 0, name: '全部' },
					{ id: 1, name: '寺庙' },
					{ id: 2, name: '古建筑' },
					{ id: 3, name: '古城墙' },
					{ id: 4, name: '古街巷' },
					{ id: 5, name: '古村落' }
				],
				spots: [
					{
						id: 1,
						name: '双塔寺',
						description: '始建于北魏，是中国现存最古老的砖塔之一',
						image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.RosxJuZmIW9TH8hyGxrSdAHaEK?w=295&h=180&c=7&r=0&o=5&pid=1.7',
						rating: 4.8,
						distance: 2.5,
						category: 1
					},
					{
						id: 2,
						name: '平遥古城',
						description: '中国保存最为完整的古城墙，UNESCO世界文化遗产',
						image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.08mviyqVC5Z3HQojVhR5vAHaFj?w=243&h=183&c=7&r=0&o=5&pid=1.7',
						rating: 4.9,
						distance: 5.1,
						category: 2
					},
					{
						id: 3,
						name: '乔家大院',
						description: '清代著名商人乔致庸的宅院，晋商文化的典范',
						image: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.1Euuw0IB4b4mr_kD7Ed-AgHaFj?w=240&h=180&c=7&r=0&o=5&pid=1.7',
						rating: 4.7,
						distance: 3.2,
						category: 2
					},
					{
						id: 4,
						name: '王家大院',
						description: '清代巨商王家的私人宅院，展现晋商的辉煌',
						image: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.YQnuj09esuVfgxteWCckCQAAAA?w=262&h=189&c=7&r=0&o=5&pid=1.7',
						rating: 4.6,
						distance: 4.8,
						category: 2
					}
				]
			}
		},
		computed: {
			filteredSpots() {
				return this.spots.filter(spot => {
					const matchCategory = this.currentCategory === 0 || spot.category === this.currentCategory;
					const matchKeyword = spot.name.includes(this.searchKeyword) || 
									   spot.description.includes(this.searchKeyword);
					return matchCategory && matchKeyword;
				});
			}
		},
		onLoad() {
			// 获取状态栏高度
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			handleSearch(e) {
				this.searchKeyword = e.detail.value;
			},
			selectCategory(categoryId) {
				this.currentCategory = categoryId;
			},
			async loadMore() {
				if (this.loadMoreStatus !== 'more') return;
				
				this.loadMoreStatus = 'loading';
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				// 模拟加载更多数据
				if (this.page < 3) {
					const newSpots = this.spots.map(spot => ({
						...spot,
						id: spot.id + this.page * 4
					}));
					this.spots = [...this.spots, ...newSpots];
					this.page++;
					this.loadMoreStatus = 'more';
				} else {
					this.loadMoreStatus = 'noMore';
				}
			},
			async onRefresh() {
				this.isRefreshing = true;
				await new Promise(resolve => setTimeout(resolve, 1000));
				this.page = 1;
				this.loadMoreStatus = 'more';
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