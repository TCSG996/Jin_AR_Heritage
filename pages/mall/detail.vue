<template>
	<view class="detail-container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">商品详情</text>
		</view>

		<!-- 商品信息 -->
		<scroll-view class="content" scroll-y="true"
			:style="{ height: `calc(100vh - ${statusBarHeight + 88}px - 100rpx)`, paddingTop: statusBarHeight + 47 + 'px' }">
			<!-- 商品主图 -->
			<view class="product-image">
				<image :src="product.image" mode="aspectFill"></image>
				<view v-if="isNew" class="new-tag">新品</view>
			</view>

			<!-- 商品基本信息 -->
			<view class="product-info">
				<view class="product-name">{{ product.name }}</view>
				<view class="product-price">
					<text class="price">¥{{ product.price }}</text>
					<text class="sales">已售 {{ product.sales }}</text>
				</view>
				<view class="product-rating">
					<uni-rate :value="product.rating" size="14" readonly></uni-rate>
					<text class="rating-text">{{ product.rating }}分</text>
				</view>
			</view>

			<!-- 商品描述 -->
			<view class="product-desc">
				<view class="section-title">商品描述</view>
				<view class="desc-content">{{ product.description }}</view>
			</view>

			<!-- 商品详情 -->
			<view class="product-details" v-if="product.details">
				<view class="section-title">详细信息</view>
				<view class="details-content">{{ product.details }}</view>
			</view>

			<!-- 推荐商品 -->
			<view class="recommend-products" v-if="recommendProducts.length > 0">
				<view class="section-title">相关推荐</view>
				<scroll-view class="recommend-list" scroll-x="true">
					<view class="recommend-item" v-for="(item, index) in recommendProducts" :key="index"
						@tap="goToDetail(item.id)">
						<image :src="item.image" mode="aspectFill"></image>
						<view class="recommend-info">
							<view class="recommend-name">{{ item.name }}</view>
							<view class="recommend-price">¥{{ item.price }}</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-buttons">
				<view class="action-item" @tap="addToCart">
					<uni-icons type="cart" size="24" color="#666"></uni-icons>
					<text>加入购物车</text>
				</view>
				<button class="buy-now" @tap="buyNow">立即购买</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getProductDetail,
		getCategoryProducts
	} from '@/static/mock/mall.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				productId: null,
				product: {},
				recommendProducts: [],
				isNew: false
			}
		},
		onLoad(options) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight

			// 获取商品ID
			if (options.id) {
				this.productId = Number(options.id)
				this.loadProductDetail()
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},

			// 加载商品详情
			loadProductDetail() {
				const response = getProductDetail(this.productId)
				if (response.code === 200) {
					this.product = response.data
					// 判断是否为新品
					this.isNew = this.product.id >= 300 && this.product.id < 400
					// 加载推荐商品
					this.loadRecommendProducts()
				} else {
					uni.showToast({
						title: response.msg,
						icon: 'none'
					})
				}
			},

			// 加载推荐商品
			loadRecommendProducts() {
				const response = getCategoryProducts(this.product.category)
				if (response.code === 200) {
					// 过滤掉当前商品，最多显示4个推荐商品
					this.recommendProducts = response.data.list
						.filter(item => item.id !== this.product.id)
						.slice(0, 4)
				}
			},

			// 跳转到其他商品详情
			goToDetail(id) {
				uni.redirectTo({
					url: `/pages/mall/detail?id=${id}`
				})
			},

			// 加入购物车
			addToCart() {
				uni.showToast({
					title: '已加入购物车',
					icon: 'success'
				})
			},

			// 立即购买
			buyNow() {
				// 创建一个临时的购物项
				const item = {
					id: this.product.id,
					name: this.product.name,
					price: this.product.price,
					image: this.product.image,
					quantity: 1,
					selected: true
				}
				
				// 将商品数据转换为 JSON 字符串
				const itemStr = encodeURIComponent(JSON.stringify([item]))
				
				// 跳转到结算页面
				uni.navigateTo({
					url: `/pages/mall/checkout?items=${itemStr}`
				})
			}
		}
	}
</script>

<style lang="scss">
	.detail-container {
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

		.content {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 100rpx;
			background-color: #f5f6fa;

			.product-image {
				position: relative;
				width: 100%;
				height: 750rpx;

				image {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.new-tag {
					position: absolute;
					top: 20rpx;
					right: 20rpx;
					background: linear-gradient(135deg, #ff9800, #ff5722);
					color: #fff;
					font-size: 24rpx;
					padding: 8rpx 20rpx;
					border-radius: 24rpx;
				}
			}

			.product-info {
				background-color: #fff;
				padding: 30rpx;
				margin-bottom: 20rpx;

				.product-name {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 20rpx;
				}

				.product-price {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 20rpx;

					.price {
						font-size: 40rpx;
						color: #e74c3c;
						font-weight: bold;
					}

					.sales {
						font-size: 24rpx;
						color: #999;
					}
				}

				.product-rating {
					display: flex;
					align-items: center;

					.rating-text {
						font-size: 24rpx;
						color: #666;
						margin-left: 10rpx;
					}
				}
			}

			.product-desc,
			.product-details {
				background-color: #fff;
				padding: 30rpx;
				margin-bottom: 20rpx;

				.section-title {
					font-size: 30rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 20rpx;
					position: relative;
					padding-left: 20rpx;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 6rpx;
						height: 24rpx;
						background: linear-gradient(to bottom, #4a90e2, #57b6e9);
						border-radius: 3rpx;
					}
				}

				.desc-content,
				.details-content {
					font-size: 28rpx;
					color: #666;
					line-height: 1.6;
				}
			}

			.recommend-products {
				background-color: #fff;
				padding: 30rpx;

				.recommend-list {
					white-space: nowrap;
					margin: 0 -10rpx;

					.recommend-item {
						display: inline-block;
						width: 240rpx;
						margin: 0 10rpx;
						border-radius: 12rpx;
						overflow: hidden;
						background-color: #f9f9f9;
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

						image {
							width: 100%;
							height: 240rpx;
							object-fit: cover;
						}

						.recommend-info {
							padding: 16rpx;

							.recommend-name {
								font-size: 26rpx;
								color: #333;
								margin-bottom: 8rpx;
								white-space: nowrap;
								overflow: hidden;
								text-overflow: ellipsis;
							}

							.recommend-price {
								font-size: 28rpx;
								color: #e74c3c;
								font-weight: 600;
							}
						}
					}
				}
			}
		}

		.bottom-bar {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			height: 100rpx;
			background-color: #fff;
			box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
			z-index: 99;

			.action-buttons {
				display: flex;
				align-items: center;
				height: 100%;
				padding: 0 30rpx;

				.action-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					margin-right: 40rpx;

					text {
						font-size: 22rpx;
						color: #666;
						margin-top: 4rpx;
					}
				}

				.buy-now {
					flex: 1;
					height: 72rpx;
					line-height: 72rpx;
					background: linear-gradient(to right, #ff9800, #ff5722);
					color: #fff;
					font-size: 28rpx;
					border-radius: 36rpx;
					text-align: center;
					margin: 0;
					padding: 0;
				}
			}
		}
	}
</style>