<template>
	<view class="checkout-container">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">确认订单</text>
		</view>

		<!-- 收货地址 -->
		<view class="address-section" @tap="selectAddress">
			<view class="address-content" v-if="address">
				<view class="user-info">
					<text class="name">{{ address.name }}</text>
					<text class="phone">{{ address.phone }}</text>
				</view>
				<view class="address-text">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</view>
			</view>
			<view class="no-address" v-else>
				<text>请选择收货地址</text>
			</view>
			<uni-icons type="right" size="20" color="#999"></uni-icons>
		</view>

		<!-- 商品列表 -->
		<view class="goods-list">
			<view class="goods-item" v-for="(item, index) in selectedItems" :key="index">
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
				<text>商品总价</text>
				<text class="price">¥{{ totalPrice.toFixed(2) }}</text>
			</view>
			<view class="info-item">
				<text>运费</text>
				<text class="price">¥{{ shipping.toFixed(2) }}</text>
			</view>
			<view class="info-item total">
				<text>实付款</text>
				<text class="price">¥{{ (totalPrice + shipping).toFixed(2) }}</text>
			</view>
		</view>

		<!-- 备注 -->
		<view class="remark-section">
			<text class="label">备注</text>
			<input type="text" v-model="remark" placeholder="选填，请填写备注信息" />
		</view>

		<!-- 底部支付栏 -->
		<view class="bottom-bar">
			<view class="total-section">
				<text class="label">实付款：</text>
				<text class="amount">¥{{ (totalPrice + shipping).toFixed(2) }}</text>
			</view>
			<button class="pay-btn" :disabled="!address" @tap="submitOrder">
				提交订单
			</button>
		</view>
	</view>
</template>

<script>
	import { getCartItems, createOrder } from '@/static/mock/cart.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				selectedItems: [],
				address: null,
				shipping: 0,
				remark: '',
				// 模拟地址数据
				mockAddress: {
					name: '张三',
					phone: '13800138000',
					province: '山西省',
					city: '太原市',
					district: '晋源区',
					detail: '晋祠路888号'
				}
			}
		},
		computed: {
			totalPrice() {
				return this.selectedItems.reduce((total, item) => total + item.price * item.quantity, 0)
			}
		},
		onLoad(options) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight
			
			// 从页面参数中获取商品数据
			if (options.items) {
				try {
					this.selectedItems = JSON.parse(decodeURIComponent(options.items))
				} catch (e) {
					console.error('解析商品数据失败:', e)
				}
			}
			
			// 如果没有从商品详情页接收到数据，则从购物车获取
			if (this.selectedItems.length === 0) {
				const response = getCartItems()
				if (response.code === 200) {
					this.selectedItems = response.data.items.filter(item => item.selected)
				}
			}
			
			// 模拟获取默认地址
			this.address = this.mockAddress
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 选择地址
			selectAddress() {
				uni.navigateTo({
					url: '/pages/mall/address-list',
					events: {
						// 监听地址选择事件
						selectedAddress: (address) => {
							this.address = address
						}
					},
					success: (res) => {
						// 传递当前选中的地址ID
						if (this.address) {
							res.eventChannel.emit('currentAddress', { id: this.address.id })
						}
					}
				})
			},
			
			// 提交订单
			submitOrder() {
				if (!this.address) {
					uni.showToast({
						title: '请选择收货地址',
						icon: 'none'
					})
					return
				}
				
				if (this.selectedItems.length === 0) {
					uni.showToast({
						title: '没有可结算的商品',
						icon: 'none'
					})
					return
				}
				
				// 创建订单
				const response = createOrder(this.address, this.selectedItems)
				if (response.code === 200) {
					// 模拟支付过程
					uni.showLoading({
						title: '正在支付...'
					})
					
					setTimeout(() => {
						uni.hideLoading()
						
						// 支付成功后跳转到订单详情页
						uni.redirectTo({
							url: `/pages/mall/order?id=${response.data.id}`
						})
					}, 1500)
				}
			}
		}
	}
</script>

<style lang="scss">
	.checkout-container {
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

	.address-section {
		background: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
	}

	.address-content {
		flex: 1;
		margin-right: 20rpx;
		
		.user-info {
			margin-bottom: 10rpx;
			
			.name {
				font-size: 32rpx;
				color: #333;
				margin-right: 20rpx;
			}
			
			.phone {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.address-text {
			font-size: 28rpx;
			color: #666;
			line-height: 1.4;
		}
	}
	
	.no-address {
		flex: 1;
		font-size: 28rpx;
		color: #999;
	}

	.goods-list {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 0 30rpx;
		
		.goods-item {
			display: flex;
			padding: 30rpx 0;
			border-bottom: 1rpx solid #f5f6fa;
			
			&:last-child {
				border-bottom: none;
			}
			
			image {
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
				
				.name {
					font-size: 28rpx;
					color: #333;
				}
				
				.price-quantity {
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.price {
						font-size: 32rpx;
						color: #e74c3c;
						font-weight: bold;
					}
					
					.quantity {
						font-size: 28rpx;
						color: #999;
					}
				}
			}
		}
	}
	
	.order-info {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 20rpx 30rpx;
		
		.info-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			text {
				font-size: 28rpx;
				color: #666;
			}
			
			.price {
				color: #333;
			}
			
			&.total {
				margin-top: 20rpx;
				padding-top: 20rpx;
				border-top: 1rpx solid #f5f6fa;
				
				text {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
				
				.price {
					color: #e74c3c;
				}
			}
		}
	}
	
	.remark-section {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		
		.label {
			font-size: 28rpx;
			color: #333;
			margin-right: 20rpx;
		}
		
		input {
			flex: 1;
			height: 60rpx;
			font-size: 28rpx;
		}
	}
	
	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		.total-section {
			flex: 1;
			
			.label {
				font-size: 28rpx;
				color: #666;
			}
			
			.amount {
				font-size: 36rpx;
				color: #e74c3c;
				font-weight: bold;
			}
		}
		
		.pay-btn {
			width: 240rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			background: linear-gradient(135deg, #ff9800, #ff5722);
			color: #fff;
			font-size: 28rpx;
			border-radius: 40rpx;
			
			&[disabled] {
				opacity: 0.6;
			}
		}
	}
</style> 