<template>
	<view class="cart-container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<text class="title">购物车</text>
		</view>

		<!-- 空购物车提示 -->
		<view class="empty-cart" v-if="!cartData.items.length">
			<image src="/static/mall/empty-cart.png" mode="aspectFit"></image>
			<text>购物车还是空的</text>
			<button class="go-shopping" @tap="goToMall">去逛逛</button>
		</view>

		<!-- 购物车列表 -->
		<scroll-view v-else class="cart-list" scroll-y="true" 
			:style="{ height: `calc(100vh - ${statusBarHeight + 88}px - 100rpx)`, top: statusBarHeight + 88 + 'px' }">
			<!-- 全选 -->
			<view class="select-all">
				<view class="checkbox" @tap="toggleSelectAll">
					<uni-icons :type="isAllSelected ? 'checkbox-filled' : 'circle'" size="20" color="#e74c3c"></uni-icons>
					<text>全选</text>
				</view>
				<text class="edit" @tap="toggleEdit">{{ isEditing ? '完成' : '编辑' }}</text>
			</view>

			<!-- 商品列表 -->
			<view class="cart-items">
				<view class="cart-item" v-for="(item, index) in cartData.items" :key="index">
					<view class="checkbox" @tap="toggleSelect(item)">
						<uni-icons :type="item.selected ? 'checkbox-filled' : 'circle'" size="20" color="#e74c3c"></uni-icons>
					</view>
					<image :src="item.image" mode="aspectFill" @tap="goToDetail(item.id)"></image>
					<view class="item-info">
						<text class="name">{{ item.name }}</text>
						<view class="price-quantity">
							<text class="price">¥{{ item.price }}</text>
							<view class="quantity-control">
								<text class="minus" @tap="updateQuantity(item, -1)">-</text>
								<input type="number" v-model="item.quantity" @blur="validateQuantity(item)" />
								<text class="plus" @tap="updateQuantity(item, 1)">+</text>
							</view>
						</view>
					</view>
					<uni-icons v-if="isEditing" type="trash" size="20" color="#999" @tap="removeItem(item)"></uni-icons>
				</view>
			</view>
		</scroll-view>

		<!-- 底部结算栏 -->
		<view class="bottom-bar">
			<view class="total-section">
				<text class="total-text">合计：</text>
				<text class="total-amount">¥{{ cartData.total.toFixed(2) }}</text>
			</view>
			<button class="checkout-btn" 
				:disabled="!selectedItems.length"
				@tap="goToCheckout">
				结算({{ selectedItems.length }})
			</button>
		</view>
	</view>
</template>

<script>
	import { getCartItems, updateCartItemQuantity, removeFromCart, updateCartItemSelection, updateAllCartItemsSelection } from '@/static/mock/cart.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				cartData: {
					items: [],
					total: 0
				},
				isEditing: false
			}
		},
		computed: {
			isAllSelected() {
				return this.cartData.items.length > 0 && this.cartData.items.every(item => item.selected)
			},
			selectedItems() {
				return this.cartData.items.filter(item => item.selected)
			}
		},
		onLoad() {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight
			
			// 加载购物车数据
			this.loadCartData()
		},
		methods: {
			// 加载购物车数据
			loadCartData() {
				const response = getCartItems()
				if (response.code === 200) {
					this.cartData = response.data
				}
			},
			
			// 切换编辑模式
			toggleEdit() {
				this.isEditing = !this.isEditing
			},
			
			// 切换全选
			toggleSelectAll() {
				const newState = !this.isAllSelected
				const response = updateAllCartItemsSelection(newState)
				if (response.code === 200) {
					this.cartData = response.data
				}
			},
			
			// 切换单个商品选中状态
			toggleSelect(item) {
				const response = updateCartItemSelection(item.id, !item.selected)
				if (response.code === 200) {
					this.cartData = response.data
				}
			},
			
			// 更新商品数量
			updateQuantity(item, delta) {
				const newQuantity = Math.max(1, item.quantity + delta)
				const response = updateCartItemQuantity(item.id, newQuantity)
				if (response.code === 200) {
					this.cartData = response.data
				}
			},
			
			// 验证输入的数量
			validateQuantity(item) {
				const quantity = Math.max(1, parseInt(item.quantity) || 1)
				const response = updateCartItemQuantity(item.id, quantity)
				if (response.code === 200) {
					this.cartData = response.data
				}
			},
			
			// 删除商品
			removeItem(item) {
				uni.showModal({
					title: '提示',
					content: '确定要删除这个商品吗？',
					success: (res) => {
						if (res.confirm) {
							const response = removeFromCart(item.id)
							if (response.code === 200) {
								this.cartData = response.data
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
							}
						}
					}
				})
			},
			
			// 跳转到商品详情
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/mall/detail?id=${id}`
				})
			},
			
			// 跳转到商城
			goToMall() {
				uni.switchTab({
					url: '/pages/mall/mall'
				})
			},
			
			// 跳转到结算页面
			goToCheckout() {
				if (this.selectedItems.length === 0) {
					uni.showToast({
						title: '请选择要结算的商品',
						icon: 'none'
					})
					return
				}
				
				uni.navigateTo({
					url: '/pages/mall/checkout'
				})
			}
		}
	}
</script>

<style lang="scss">
	.cart-container {
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
			justify-content: center;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			
			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}
		
		.empty-cart {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 200rpx;
			
			image {
				width: 200rpx;
				height: 200rpx;
				margin-bottom: 30rpx;
			}
			
			text {
				font-size: 28rpx;
				color: #999;
				margin-bottom: 40rpx;
			}
			
			.go-shopping {
				width: 240rpx;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				background: linear-gradient(135deg, #ff9800, #ff5722);
				color: #fff;
				font-size: 28rpx;
				border-radius: 40rpx;
			}
		}
		
		.cart-list {
			position: absolute;
			left: 0;
			right: 0;
			background-color: #f5f6fa;
			
			.select-all {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx 30rpx;
				background-color: #fff;
				margin-bottom: 20rpx;
				
				.checkbox {
					display: flex;
					align-items: center;
					
					text {
						font-size: 28rpx;
						color: #333;
						margin-left: 10rpx;
					}
				}
				
				.edit {
					font-size: 28rpx;
					color: #666;
				}
			}
			
			.cart-items {
				.cart-item {
					display: flex;
					align-items: center;
					padding: 20rpx 30rpx;
					background-color: #fff;
					margin-bottom: 2rpx;
					
					.checkbox {
						margin-right: 20rpx;
					}
					
					image {
						width: 160rpx;
						height: 160rpx;
						border-radius: 8rpx;
						margin-right: 20rpx;
					}
					
					.item-info {
						flex: 1;
						
						.name {
							font-size: 28rpx;
							color: #333;
							margin-bottom: 10rpx;
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
							
							.quantity-control {
								display: flex;
								align-items: center;
								
								text {
									width: 60rpx;
									height: 60rpx;
									line-height: 60rpx;
									text-align: center;
									border: 1rpx solid #ddd;
									
									&.minus {
										border-radius: 30rpx 0 0 30rpx;
									}
									
									&.plus {
										border-radius: 0 30rpx 30rpx 0;
									}
								}
								
								input {
									width: 80rpx;
									height: 60rpx;
									line-height: 60rpx;
									text-align: center;
									border-top: 1rpx solid #ddd;
									border-bottom: 1rpx solid #ddd;
									font-size: 28rpx;
								}
							}
						}
					}
					
					.uni-icons {
						margin-left: 20rpx;
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
			display: flex;
			align-items: center;
			padding: 0 30rpx;
			box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
			
			.total-section {
				flex: 1;
				
				.total-text {
					font-size: 28rpx;
					color: #666;
				}
				
				.total-amount {
					font-size: 36rpx;
					color: #e74c3c;
					font-weight: bold;
				}
			}
			
			.checkout-btn {
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
	}
</style> 