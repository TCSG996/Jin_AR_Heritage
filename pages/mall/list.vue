<template>
	<view class="list-container">
		<!-- 顶部标题栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">{{ pageTitle }}</text>
		</view>

		<!-- 商品列表 -->
		<scroll-view class="product-list" 
			:style="{ height: `calc(100vh - ${statusBarHeight + 88}px)`, top: statusBarHeight + 47 + 'px' }"
			scroll-y="true"
			@scrolltolower="loadMore"
			refresher-enabled
			@refresherrefresh="onRefresh"
			:refresher-triggered="isRefreshing">
			
			<!-- 网格布局 -->
			<view v-if="listType !== 'feature'" class="grid-list">
				<view class="product-item" v-for="(item, index) in products" :key="index" @tap="goToDetail(item.id)">
					<image :src="item.image" mode="aspectFill"></image>
					<view v-if="listType === 'new'" class="new-tag">新品</view>
					<view class="product-info">
						<view class="product-name">{{ item.name }}</view>
						<view class="product-price">¥{{ item.price }}</view>
					</view>
				</view>
			</view>

			<!-- 特色商品布局 -->
			<view v-else class="feature-list">
				<view class="feature-item" v-for="(item, index) in products" :key="index" @tap="goToDetail(item.id)">
					<image :src="item.image" mode="aspectFill"></image>
					<view class="feature-info">
						<view class="feature-name">{{ item.name }}</view>
						<view class="feature-desc">{{ item.desc }}</view>
						<view class="feature-price">¥{{ item.price }}</view>
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
	import { getProducts } from '@/static/mock/mall.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				listType: 'hot', // hot, feature, new
				pageTitle: '热门推荐',
				isRefreshing: false,
				isLoading: false,
				noMore: false,
				page: 1,
				pageSize: 10,
				products: []
			}
		},
		onLoad(options) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight

			// 设置列表类型和标题
			if (options.type) {
				this.listType = options.type
				switch (options.type) {
					case 'hot':
						this.pageTitle = '热门推荐'
						break
					case 'feature':
						this.pageTitle = '特色商品'
						break
					case 'new':
						this.pageTitle = '新品上架'
						break
				}
			}

			// 加载商品数据
			this.loadProducts()
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},

			// 下拉刷新
			async onRefresh() {
				try {
					this.isRefreshing = true
					this.page = 1
					await this.loadProducts()
				} catch (error) {
					uni.showToast({
						title: '刷新失败，请重试',
						icon: 'none'
					})
				} finally {
					this.isRefreshing = false
				}
			},

			// 加载商品数据
			async loadProducts() {
				try {
					this.isLoading = true
					// 模拟网络延迟
					await new Promise(resolve => setTimeout(resolve, 500))
					
					// 获取商品数据
					const response = getProducts(this.listType, this.page, this.pageSize)
					
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
	.list-container {
		min-height: 100vh;
		background-color: #f5f6fa;

		.header {
			position: fixed;
			left: 0;
			right: 0;
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
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
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

						.product-price {
							font-size: 28rpx;
							color: #e74c3c;
							font-weight: 600;
						}
					}
				}
			}

			.feature-list {
				padding: 20rpx;

				.feature-item {
					display: flex;
					background-color: #fff;
					border-radius: 16rpx;
					margin-bottom: 20rpx;
					overflow: hidden;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

					image {
						width: 240rpx;
						height: 180rpx;
						object-fit: cover;
					}

					.feature-info {
						flex: 1;
						padding: 20rpx;

						.feature-name {
							font-size: 28rpx;
							font-weight: 600;
							color: #333;
							margin-bottom: 10rpx;
						}

						.feature-desc {
							font-size: 24rpx;
							color: #666;
							margin-bottom: 20rpx;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
						}

						.feature-price {
							font-size: 30rpx;
							color: #e74c3c;
							font-weight: 600;
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
</style> 