<template>
	<view class="category-container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">{{ categoryName }}</text>
		</view>

		<!-- 商品列表 -->
		<scroll-view class="product-list" scroll-y="true" 
			:style="{ height: `calc(100vh - ${statusBarHeight + 88}px)`, paddingTop: statusBarHeight + 47 + 'px' }"
			@scrolltolower="loadMore"
			refresher-enabled
			@refresherrefresh="onRefresh"
			:refresher-triggered="isRefreshing">
			
			<view class="grid-list">
				<view class="product-item" v-for="(item, index) in products" :key="index" @tap="goToDetail(item.id)">
					<image :src="item.image" mode="aspectFill"></image>
					<view v-if="isNew(item.id)" class="new-tag">新品</view>
					<view class="product-info">
						<view class="product-name">{{ item.name }}</view>
						<view class="product-desc">{{ item.description }}</view>
						<view class="product-price">
							<text class="price">¥{{ item.price }}</text>
							<text class="sales">已售 {{ item.sales }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-more" v-if="isLoading">
				<uni-icons type="spinner-cycle" size="20" color="#666"></uni-icons>
				<text>加载中...</text>
			</view>
			<view class="no-more" v-if="noMore">没有更多商品了</view>
		</scroll-view>
	</view>
</template>

<script>
	import { categories, getCategoryProducts } from '@/static/mock/mall.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				categoryId: null,
				categoryName: '',
				products: [],
				page: 1,
				pageSize: 10,
				isLoading: false,
				noMore: false,
				isRefreshing: false
			}
		},
		onLoad(options) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight

			// 获取分类ID和名称
			if (options.id) {
				this.categoryId = Number(options.id)
				const category = categories.find(item => item.id === this.categoryId)
				this.categoryName = category ? category.name : '商品分类'
				this.loadProducts()
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},

			// 判断是否为新品
			isNew(id) {
				return id >= 300 && id < 400
			},

			// 下拉刷新
			async onRefresh() {
				this.isRefreshing = true
				this.page = 1
				await this.loadProducts()
				this.isRefreshing = false
			},

			// 加载商品数据
			async loadProducts() {
				if (this.isLoading) return

				try {
					this.isLoading = true
					// 模拟网络延迟
					await new Promise(resolve => setTimeout(resolve, 500))

					const response = getCategoryProducts(this.categoryId, this.page, this.pageSize)
					if (response.code === 200) {
						const { list, hasMore } = response.data
						
						// 如果是第一页，替换数据，否则追加数据
						if (this.page === 1) {
							this.products = list
						} else {
							this.products = [...this.products, ...list]
						}
						
						// 更新是否还有更多数据的状态
						this.noMore = !hasMore
						
						// 如果还有更多数据，页码加1
						if (hasMore) {
							this.page++
						}
					} else {
						uni.showToast({
							title: response.msg || '获取数据失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					})
				} finally {
					this.isLoading = false
				}
			},

			// 加载更多
			loadMore() {
				if (!this.isLoading && !this.noMore) {
					this.loadProducts()
				}
			},

			// 跳转到商品详情
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/mall/detail?id=${id}`
				})
			}
		}
	}
</script>

<style lang="scss">
	.category-container {
		min-height: 100vh;
		background-color: #f5f6fa;
		position: relative;

		.header {
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			z-index: 100;
			height: 88rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			padding: 0 30rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

			.back-btn {
				padding: 20rpx;
				margin-left: -20rpx;
			}

			.title {
				flex: 1;
				text-align: center;
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-right: 44rpx;
			}
		}

		.product-list {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			background-color: #f5f6fa;

			.grid-list {
				display: flex;
				flex-wrap: wrap;
				padding: 20rpx;

				.product-item {
					position: relative;
					width: calc(50% - 20rpx);
					margin: 10rpx;
					background-color: #fff;
					border-radius: 16rpx;
					overflow: hidden;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

					image {
						width: 100%;
						height: 240rpx;
						object-fit: cover;
					}

					.new-tag {
						position: absolute;
						top: 10rpx;
						right: 10rpx;
						background: linear-gradient(135deg, #ff9800, #ff5722);
						color: #fff;
						font-size: 20rpx;
						padding: 4rpx 12rpx;
						border-radius: 20rpx;
					}

					.product-info {
						padding: 16rpx;

						.product-name {
							font-size: 26rpx;
							color: #333;
							margin-bottom: 8rpx;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						.product-desc {
							font-size: 24rpx;
							color: #666;
							margin-bottom: 8rpx;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
						}

						.product-price {
							display: flex;
							align-items: center;
							justify-content: space-between;

							.price {
								font-size: 28rpx;
								color: #e74c3c;
								font-weight: 600;
							}

							.sales {
								font-size: 22rpx;
								color: #999;
							}
						}
					}
				}
			}

			.loading-more,
			.no-more {
				text-align: center;
				padding: 30rpx;
				color: #999;
				font-size: 26rpx;

				.uni-icons {
					margin-right: 10rpx;
				}
			}
		}
	}
</style> 