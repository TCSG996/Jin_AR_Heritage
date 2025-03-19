<template>
	<view class="search-container">
		<!-- 搜索栏 -->
		<view class="search-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input type="text" v-model="searchText" placeholder="搜索商品" confirm-type="search" @confirm="onSearch" />
				<uni-icons v-if="searchText" type="clear" size="18" color="#999" @tap="clearSearch"></uni-icons>
			</view>
			<text class="cancel-btn" @tap="goBack">取消</text>
		</view>

		<!-- 搜索历史 -->
		<view class="history-section" v-if="!searchText && searchHistory.length > 0">
			<view class="section-header">
				<text>搜索历史</text>
				<uni-icons type="trash" size="18" color="#999" @tap="clearHistory"></uni-icons>
			</view>
			<view class="history-list">
				<view class="history-item" v-for="(item, index) in searchHistory" :key="index" @tap="useHistoryItem(item)">
					<uni-icons type="search" size="14" color="#999"></uni-icons>
					<text>{{ item }}</text>
				</view>
			</view>
		</view>

		<!-- 搜索结果 -->
		<scroll-view v-if="searchText" class="search-results" scroll-y="true" 
			:style="{ height: `calc(100vh - ${statusBarHeight + 88}px)`, top: statusBarHeight + 88 + 'px' }"
			@scrolltolower="loadMore"
			refresher-enabled
			@refresherrefresh="onRefresh"
			:refresher-triggered="isRefreshing">
			
			<view class="result-list">
				<view class="product-item" v-for="(item, index) in searchResults" :key="index" @tap="goToDetail(item.id)">
					<image :src="item.image" mode="aspectFill"></image>
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
			<view class="empty-result" v-if="searchText && searchResults.length === 0 && !isLoading">
				<image src="/static/mall/empty.png" mode="aspectFit"></image>
				<text>暂无相关商品</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	const MAX_HISTORY = 10

	export default {
		data() {
			return {
				statusBarHeight: 0,
				searchText: '',
				searchHistory: [],
				searchResults: [],
				page: 1,
				pageSize: 10,
				isLoading: false,
				noMore: false,
				isRefreshing: false
			}
		},
		onLoad() {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight

			// 加载搜索历史
			this.loadSearchHistory()
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},

			// 清空搜索框
			clearSearch() {
				this.searchText = ''
				this.searchResults = []
			},

			// 加载搜索历史
			loadSearchHistory() {
				try {
					const history = uni.getStorageSync('searchHistory')
					this.searchHistory = history ? JSON.parse(history) : []
				} catch (e) {
					this.searchHistory = []
				}
			},

			// 保存搜索历史
			saveSearchHistory(keyword) {
				if (!keyword) return
				
				let history = this.searchHistory
				// 移除已存在的相同关键词
				history = history.filter(item => item !== keyword)
				// 添加到开头
				history.unshift(keyword)
				// 限制数量
				if (history.length > MAX_HISTORY) {
					history = history.slice(0, MAX_HISTORY)
				}
				
				this.searchHistory = history
				// 保存到本地存储
				uni.setStorageSync('searchHistory', JSON.stringify(history))
			},

			// 清空搜索历史
			clearHistory() {
				uni.showModal({
					title: '提示',
					content: '确定要清空搜索历史吗？',
					success: (res) => {
						if (res.confirm) {
							this.searchHistory = []
							uni.removeStorageSync('searchHistory')
						}
					}
				})
			},

			// 使用历史记录项
			useHistoryItem(keyword) {
				this.searchText = keyword
				this.onSearch()
			},

			// 搜索商品
			onSearch() {
				if (!this.searchText.trim()) return
				
				this.page = 1
				this.noMore = false
				this.saveSearchHistory(this.searchText)
				this.loadSearchResults()
			},

			// 下拉刷新
			async onRefresh() {
				this.isRefreshing = true
				this.page = 1
				await this.loadSearchResults()
				this.isRefreshing = false
			},

			// 加载搜索结果
			async loadSearchResults() {
				if (this.isLoading) return

				try {
					this.isLoading = true
					// 模拟网络延迟
					await new Promise(resolve => setTimeout(resolve, 500))

					// TODO: 替换为实际的搜索API
					const mockResults = []
					for (let i = 0; i < this.pageSize; i++) {
						mockResults.push({
							id: this.page * 100 + i,
							name: `搜索商品 ${this.page}-${i}`,
							description: '这是一个示例商品描述',
							price: 99.9,
							sales: 100,
							image: 'https://via.placeholder.com/200'
						})
					}

					if (this.page === 1) {
						this.searchResults = mockResults
					} else {
						this.searchResults = [...this.searchResults, ...mockResults]
					}

					// 模拟到第3页就没有更多数据
					this.noMore = this.page >= 3
					if (!this.noMore) {
						this.page++
					}
				} finally {
					this.isLoading = false
				}
			},

			// 加载更多
			loadMore() {
				if (!this.isLoading && !this.noMore) {
					this.loadSearchResults()
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
	.search-container {
		min-height: 100vh;
		background-color: #f5f6fa;

		.search-header {
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

			.search-box {
				flex: 1;
				height: 72rpx;
				background-color: #f5f6fa;
				border-radius: 36rpx;
				display: flex;
				align-items: center;
				padding: 0 30rpx;

				uni-icons {
					margin-right: 10rpx;
				}

				input {
					flex: 1;
					height: 72rpx;
					font-size: 28rpx;
				}
			}

			.cancel-btn {
				padding: 20rpx;
				margin-left: 20rpx;
				font-size: 28rpx;
				color: #666;
			}
		}

		.history-section {
			margin-top: calc(#{statusBarHeight}px + 88rpx);
			padding: 30rpx;

			.section-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				text {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}
			}

			.history-list {
				display: flex;
				flex-wrap: wrap;

				.history-item {
					display: flex;
					align-items: center;
					background-color: #fff;
					padding: 12rpx 24rpx;
					border-radius: 28rpx;
					margin: 10rpx;

					uni-icons {
						margin-right: 8rpx;
					}

					text {
						font-size: 24rpx;
						color: #666;
					}
				}
			}
		}

		.search-results {
			position: absolute;
			left: 0;
			right: 0;
			background-color: #f5f6fa;

			.result-list {
				padding: 20rpx;

				.product-item {
					display: flex;
					background-color: #fff;
					border-radius: 16rpx;
					margin-bottom: 20rpx;
					overflow: hidden;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

					image {
						width: 200rpx;
						height: 200rpx;
						object-fit: cover;
					}

					.product-info {
						flex: 1;
						padding: 20rpx;

						.product-name {
							font-size: 28rpx;
							font-weight: 600;
							color: #333;
							margin-bottom: 10rpx;
						}

						.product-desc {
							font-size: 24rpx;
							color: #666;
							margin-bottom: 20rpx;
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
								font-size: 32rpx;
								color: #e74c3c;
								font-weight: 600;
							}

							.sales {
								font-size: 24rpx;
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

			.empty-result {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 100rpx 0;

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
	}
</style> 