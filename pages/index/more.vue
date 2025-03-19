<template>
	<view class="more-container">
		<!-- 景点列表 -->
		<scroll-view class="attractions-list" :style="{ 
				height: `calc(100vh - ${statusBarHeight + 88}px)`,
				top: statusBarHeight + 88 + 'px'
			}" scroll-y="true" @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh"
			:refresher-triggered="isRefreshing">
			<view class="attractions-content">
				<view class="attraction-item" v-for="(item, index) in filteredAttractions" :key="index"
					@click="goToDetail(item.id)">
					<image class="attraction-image" :src="`${baseURL}${item.image}`" mode="aspectFill"></image>
					<view class="attraction-info">
						<view class="attraction-title">{{ item.name }}</view>
						<view class="attraction-desc">{{ item.description }}</view>
						<view class="attraction-meta">
							<view class="location">
								<uni-icons type="location" size="14" color="#666"></uni-icons>
								<text>{{ item.location }}</text>
							</view>
							<view class="rating">
								<uni-icons type="star-filled" size="14" color="#ff9900"></uni-icons>
								<text>{{ item.rating }}</text>
							</view>
						</view>
					</view>
				</view>
				<!-- 加载更多 -->
				<view class="loading-more" v-if="isLoading">
					<uni-icons type="spinner-cycle" size="20" color="#008055"></uni-icons>
					<text>加载中...</text>
				</view>
				<view class="no-more" v-if="noMore">没有更多数据了</view>
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
		methods: {
			// 下拉刷新
			async onRefresh() {
				try {
					this.isRefreshing = true
					this.page = 1
					this.attractions = []
					await this.loadAttractions()
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
						const formattedAttractions = newAttractions.map(item => ({
							id: item.id,
							name: item.name,
							description: item.description,
							image: item.arModelUrl || '/static/spot-default.png',
							location: item.location,
							rating: 4.5
						}))

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
					url: `/pages/detail/detail?id=${id}`
				})
			}
		}
	}
</script>

<style lang="scss">
	.more-container {
		min-height: 100vh;
		background-color: #f5f6fa;

		.attractions-list {
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #f5f6fa;

			.attractions-content {
				padding: 20rpx;

				.attraction-item {
					background-color: #fff;
					border-radius: 16rpx;
					margin-bottom: 20rpx;
					overflow: hidden;
					box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

					.attraction-image {
						width: 100%;
						height: 360rpx;
					}

					.attraction-info {
						padding: 20rpx;

						.attraction-title {
							font-size: 32rpx;
							font-weight: bold;
							color: #333;
							margin-bottom: 12rpx;
						}

						.attraction-desc {
							font-size: 26rpx;
							color: #666;
							margin-bottom: 16rpx;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
						}

						.attraction-meta {
							display: flex;
							align-items: center;
							justify-content: space-between;

							.location,
							.rating {
								display: flex;
								align-items: center;
								font-size: 24rpx;
								color: #666;

								text {
									margin-left: 6rpx;
								}
							}
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