<template>
	<view class="order-container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">订单详情</text>
		</view>

		<!-- 订单状态 -->
		<view class="status-section">
			<view class="status-content">
				<text class="status-text">{{ statusText }}</text>
				<text class="status-desc">{{ statusDesc }}</text>
			</view>
		</view>

		<!-- 收货地址 -->
		<view class="address-section">
			<view class="address-content">
				<view class="user-info">
					<text class="name">{{ orderData.address.name }}</text>
					<text class="phone">{{ orderData.address.phone }}</text>
				</view>
				<view class="address-text">
					{{ orderData.address.province }}{{ orderData.address.city }}{{ orderData.address.district }}{{ orderData.address.detail }}
				</view>
			</view>
		</view>

		<!-- 商品列表 -->
		<view class="goods-list">
			<view class="goods-item" v-for="(item, index) in orderData.items" :key="index">
				<image :src="item.image" mode="aspectFill"></image>
				<view class="item-info">
					<text class="name">{{ item.name }}</text>
					<view class="price-quantity">
						<text class="price">¥{{ item.price }}</text>
						<text class="quantity">x{{ item.quantity }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单信息 -->
		<view class="order-info">
			<view class="info-item">
				<text>订单编号</text>
				<text class="value">{{ orderData.id }}</text>
			</view>
			<view class="info-item">
				<text>创建时间</text>
				<text class="value">{{ formatDate(orderData.createTime) }}</text>
			</view>
			<view class="info-item">
				<text>商品总价</text>
				<text class="price">¥{{ orderData.total.toFixed(2) }}</text>
			</view>
			<view class="info-item">
				<text>运费</text>
				<text class="price">¥{{ shipping.toFixed(2) }}</text>
			</view>
			<view class="info-item total">
				<text>实付款</text>
				<text class="price">¥{{ (orderData.total + shipping).toFixed(2) }}</text>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="bottom-bar" v-if="orderData.status === 'pending'">
			<button class="cancel-btn" @tap="cancelOrder">取消订单</button>
			<button class="pay-btn" @tap="payOrder">立即支付</button>
		</view>
	</view>
</template>

<script>
	import { getOrderDetail, updateOrderStatus } from '@/static/mock/cart.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				orderId: '',
				orderData: {
					id: '',
					items: [],
					total: 0,
					status: 'pending',
					createTime: '',
					address: {}
				},
				shipping: 0
			}
		},
		computed: {
			statusText() {
				const statusMap = {
					pending: '待付款',
					paid: '待发货',
					shipped: '待收货',
					completed: '已完成',
					cancelled: '已取消'
				}
				return statusMap[this.orderData.status] || '未知状态'
			},
			statusDesc() {
				const descMap = {
					pending: '请尽快完成支付',
					paid: '商家正在处理您的订单',
					shipped: '商品正在配送中',
					completed: '交易已完成',
					cancelled: '订单已取消'
				}
				return descMap[this.orderData.status] || ''
			}
		},
		onLoad(options) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight
			
			// 获取订单ID
			if (options.id) {
				this.orderId = options.id
				this.loadOrderData()
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 加载订单数据
			loadOrderData() {
				const response = getOrderDetail(this.orderId)
				if (response.code === 200) {
					this.orderData = response.data
				} else {
					uni.showToast({
						title: '订单不存在',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				}
			},
			
			// 格式化日期
			formatDate(dateStr) {
				const date = new Date(dateStr)
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			},
			
			// 取消订单
			cancelOrder() {
				uni.showModal({
					title: '提示',
					content: '确定要取消这个订单吗？',
					success: (res) => {
						if (res.confirm) {
							const response = updateOrderStatus(this.orderId, 'cancelled')
							if (response.code === 200) {
								this.orderData = response.data
								uni.showToast({
									title: '订单已取消',
									icon: 'success'
								})
							}
						}
					}
				})
			},
			
			// 支付订单
			payOrder() {
				// 模拟支付过程
				uni.showLoading({
					title: '正在支付...'
				})
				
				setTimeout(() => {
					uni.hideLoading()
					
					const response = updateOrderStatus(this.orderId, 'paid')
					if (response.code === 200) {
						this.orderData = response.data
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						})
					}
				}, 1500)
			}
		}
	}
</script>

<style lang="scss">
	.order-container {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-top: calc(var(--status-bar-height) + 88rpx);
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 88rpx;
		background: #fff;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		z-index: 100;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.back-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title {
		flex: 1;
		text-align: center;
		font-size: 32rpx;
		font-weight: 500;
		margin-right: 60rpx;
	}

	.status-section {
		background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
		padding: 40rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.status-content {
		color: #fff;
	}

	.status-text {
		font-size: 36rpx;
		font-weight: 500;
		margin-bottom: 10rpx;
		display: block;
	}

	.status-desc {
		font-size: 28rpx;
		opacity: 0.9;
	}

	.address-section {
		background: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.name {
		font-size: 32rpx;
		font-weight: 500;
		margin-right: 20rpx;
	}

	.phone {
		font-size: 28rpx;
		color: #666;
	}

	.address-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
	}

	.goods-list {
		background: #fff;
		padding: 20rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.goods-item {
		display: flex;
		padding: 20rpx 0;
	}

	.goods-item image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.item-info .name {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
		margin-bottom: 10rpx;
	}

	.price-quantity {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.price {
		font-size: 32rpx;
		color: #ff6b6b;
		font-weight: 500;
	}

	.quantity {
		font-size: 26rpx;
		color: #999;
	}

	.order-info {
		background: #fff;
		padding: 30rpx;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		font-size: 28rpx;
	}

	.info-item text {
		color: #666;
	}

	.info-item .value {
		color: #333;
	}

	.info-item .price {
		color: #ff6b6b;
		font-weight: 500;
	}

	.info-item.total {
		margin-top: 30rpx;
		padding-top: 30rpx;
		border-top: 2rpx solid #f5f5f5;
	}

	.info-item.total text:first-child {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.info-item.total .price {
		font-size: 36rpx;
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100rpx;
		background: #fff;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		box-shadow: 0 -2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.bottom-bar button {
		height: 72rpx;
		line-height: 72rpx;
		padding: 0 40rpx;
		font-size: 28rpx;
		border-radius: 36rpx;
		margin: 0;
	}

	.bottom-bar .cancel-btn {
		color: #666;
		background: #f5f5f5;
		margin-right: 20rpx;
	}

	.bottom-bar .pay-btn {
		flex: 1;
		color: #fff;
		background: #ff6b6b;
	}
</style> 