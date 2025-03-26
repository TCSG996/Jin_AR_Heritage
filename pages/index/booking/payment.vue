<template>
	<view class="payment-container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<!-- 返回按钮 -->
			<view class="back-btn" @tap="goBack">
				<uni-icons type="back" size="22" color="#fff"></uni-icons>
			</view>
			
			<view class="title-box">
				<text class="title">订单支付</text>
				<text class="subtitle">完成支付后即可获得门票</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载订单信息...</text>
		</view>
		
		<!-- 错误提示 -->
		<view class="error-container" v-else-if="hasError">
			<uni-icons type="error" size="50" color="#d81e06"></uni-icons>
			<text class="error-text">{{ errorMsg }}</text>
			<button class="retry-btn" @tap="loadOrderInfo">重新加载</button>
		</view>
		
		<!-- 支付内容 -->
		<view class="payment-content" v-else>
			<!-- 订单信息卡片 -->
			<view class="order-card">
				<view class="order-header">
					<text class="order-title">订单信息</text>
					<text class="order-no">订单号：{{ orderNo }}</text>
				</view>
				
				<view class="order-body">
					<view class="order-info-item">
						<text class="label">订单金额</text>
						<view class="price">
							<text class="currency">¥</text>
							<text class="amount">{{ formatPrice(totalPrice) }}</text>
						</view>
					</view>
					
					<view class="order-info-item">
						<text class="label">支付状态</text>
						<text class="status" :class="statusClass">{{ statusText }}</text>
					</view>
					
					<view class="order-info-item" v-if="orderInfo && orderInfo.ticketName">
						<text class="label">票种名称</text>
						<text class="value">{{ orderInfo.ticketName }}</text>
					</view>
					
					<view class="order-info-item" v-if="orderInfo && orderInfo.quantity">
						<text class="label">购票数量</text>
						<text class="value">{{ orderInfo.quantity }}张</text>
					</view>
					
					<view class="order-info-item" v-if="orderInfo && orderInfo.visitDate">
						<text class="label">参观日期</text>
						<text class="value">{{ formatDate(orderInfo.visitDate) }}</text>
					</view>
					
					<view class="order-info-item" v-if="orderInfo && orderInfo.visitorName">
						<text class="label">游客姓名</text>
						<text class="value">{{ orderInfo.visitorName }}</text>
					</view>
					
					<view class="order-info-item" v-if="countdown > 0">
						<text class="label">支付倒计时</text>
						<text class="countdown">{{ formatTime(countdown) }}</text>
					</view>
				</view>
			</view>
			
			<!-- 支付方式选择 -->
			<view class="payment-methods">
				<view class="section-title">选择支付方式</view>
				
				<view class="method-list">
					<view class="method-item" 
						  v-for="(method, index) in paymentMethods" 
						  :key="index"
						  :class="{'active': selectedMethod === method.id}"
						  @tap="selectPaymentMethod(method.id)">
						<view class="method-icon">
							<uni-icons :type="method.icon" size="24" color="#333"></uni-icons>
						</view>
						<view class="method-info">
							<text class="method-name">{{ method.name }}</text>
							<text class="method-desc">{{ method.desc }}</text>
						</view>
						<view class="method-check">
							<view class="check-circle" :class="{'checked': selectedMethod === method.id}"></view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 支付按钮 -->
			<view class="payment-action">
				<button class="pay-btn" 
						:disabled="!canPay || submitting" 
						@tap="submitPayment">
					{{ payButtonText }}
				</button>
				
				<view class="cancel-order" @tap="cancelOrder">
					取消订单
				</view>
			</view>
		</view>
		
		<!-- 底部装饰元素 -->
		<view class="bottom-decoration">
			<view class="deco-pattern"></view>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';
	
	export default {
		data() {
			return {
				orderNo: '',
				totalPrice: 0,
				orderInfo: null,
				isLoading: true,
				hasError: false,
				errorMsg: '加载失败，请重试',
				paymentStatus: 0,  // 0-待支付 1-支付中 2-已支付 3-已取消
				countdown: 30 * 60, // 30分钟支付倒计时
				countdownTimer: null,
				selectedMethod: 'wxpay',
				submitting: false,
				paymentMethods: [
					{
						id: 'wxpay',
						name: '微信支付',
						desc: '推荐使用微信支付',
						icon: 'wallet'
					},
					{
						id: 'alipay',
						name: '支付宝',
						desc: '支付宝安全支付',
						icon: 'wallet'
					},
					{
						id: 'unionpay',
						name: '银联支付',
						desc: '银联卡支付',
						icon: 'card'
					}
				]
			};
		},
		computed: {
			statusText() {
				const statusMap = {
					0: '待支付',
					1: '支付中',
					2: '已支付',
					3: '已取消'
				};
				return statusMap[this.paymentStatus] || '未知状态';
			},
			statusClass() {
				const classMap = {
					0: 'status-pending',
					1: 'status-processing',
					2: 'status-success',
					3: 'status-cancelled'
				};
				return classMap[this.paymentStatus] || '';
			},
			canPay() {
				return this.paymentStatus === 0 && this.selectedMethod && this.countdown > 0;
			},
			payButtonText() {
				if(this.submitting) return '处理中...';
				return `立即支付 ¥${this.formatPrice(this.totalPrice)}`;
			}
		},
		onLoad(options) {
			console.log('支付页面加载参数:', options);
			
			if(options.orderNo) {
				this.orderNo = options.orderNo;
				
				// 设置初始价格（如果有传入）
				if(options.totalPrice) {
					this.totalPrice = parseFloat(options.totalPrice);
				}
				
				// 加载订单详细信息
				this.loadOrderInfo();
				
				// 开始倒计时
				this.startCountdown();
			} else {
				this.hasError = true;
				this.isLoading = false;
				this.errorMsg = '订单号不能为空';
			}
		},
		onUnload() {
			// 清除倒计时
			if(this.countdownTimer) {
				clearInterval(this.countdownTimer);
			}
		},
		methods: {
			// 加载订单信息
			async loadOrderInfo() {
				this.isLoading = true;
				this.hasError = false;
				
				try {
					// 调用真实的API获取订单详情
					const res = await api.user.getOrderDetail(this.orderNo);
					
					if (res.code === 200 && res.data) {
						this.orderInfo = res.data;
						this.totalPrice = this.orderInfo.totalPrice || this.totalPrice;
						this.paymentStatus = this.orderInfo.status || 0;
						
						console.log('订单信息加载成功:', this.orderInfo);
					} else {
						throw new Error(res.msg || '获取订单信息失败');
					}
					
					this.isLoading = false;
				} catch (error) {
					console.error('加载订单信息失败:', error);
					this.hasError = true;
					this.errorMsg = error.message || '加载订单信息失败，请重试';
					this.isLoading = false;
				}
			},
			
			// 格式化价格
			formatPrice(price) {
				return parseFloat(price).toFixed(2);
			},
			
			// 格式化时间 mm:ss
			formatTime(seconds) {
				const mins = Math.floor(seconds / 60);
				const secs = seconds % 60;
				return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
			},
			
			// 格式化日期 YYYY-MM-DD
			formatDate(dateStr) {
				if (!dateStr) return '';
				const date = new Date(dateStr);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			},
			
			// 开始倒计时
			startCountdown() {
				this.countdownTimer = setInterval(() => {
					if(this.countdown > 0) {
						this.countdown--;
					} else {
						// 倒计时结束，订单超时
						clearInterval(this.countdownTimer);
						this.paymentStatus = 3; // 已取消
						uni.showToast({
							title: '订单已超时',
							icon: 'none'
						});
					}
				}, 1000);
			},
			
			// 选择支付方式
			selectPaymentMethod(methodId) {
				this.selectedMethod = methodId;
			},
			
			// 提交支付
			async submitPayment() {
				if(!this.canPay || this.submitting) return;
				
				this.submitting = true;
				this.paymentStatus = 1; // 支付中
				
				try {
					// 显示支付中状态
					uni.showLoading({
						title: '支付处理中...',
						mask: true
					});
					
					// 获取当前选择的支付方式
					const payMethod = this.selectedMethod;
					console.log('使用支付方式:', payMethod);
					
					// 调用支付预约API
					const result = await api.user.payTicket(this.orderNo, payMethod);
					
					// 隐藏loading
					uni.hideLoading();
					
					if(result.code === 200) {
						this.paymentStatus = 2; // 已支付
						uni.showToast({
							title: '支付成功',
							icon: 'success',
							duration: 2000
						});
						
						// 将最新状态记录到本地存储，以便支付成功页面使用
						try {
							uni.setStorageSync('lastPaidOrder', {
								orderNo: this.orderNo,
								paidAt: new Date().toISOString(),
								payMethod: payMethod,
								...this.orderInfo
							});
						} catch (e) {
							console.error('保存支付信息失败:', e);
						}
						
						// 跳转到支付成功页面
						setTimeout(() => {
							uni.redirectTo({
								url: '/pages/index/booking/success?orderNo=' + this.orderNo
							});
						}, 1500);
					} else {
						throw new Error(result.msg || '支付失败');
					}
				} catch (error) {
					// 隐藏loading
					uni.hideLoading();
					console.error('支付失败:', error);
					uni.showToast({
						title: error.message || '支付失败，请重试',
						icon: 'none',
						duration: 2000
					});
					this.paymentStatus = 0; // 恢复待支付状态
				} finally {
					this.submitting = false;
				}
			},
			
			// 取消订单
			cancelOrder() {
				uni.showModal({
					title: '取消订单',
					content: '确定要取消此订单吗？',
					success: async (res) => {
						if (res.confirm) {
							this.submitting = true;
							try {
								// 调用取消订单API
								const result = await api.user.cancelOrder(this.orderNo);
								if (result.code === 200) {
									uni.showToast({
										title: '订单已取消',
										icon: 'success',
										duration: 1500
									});
									
									// 2秒后跳转到我的门票页面
									setTimeout(() => {
										uni.navigateTo({
											url: '/pages/user/tickets'
										});
									}, 1500);
								} else {
									throw new Error(result.message || '取消订单失败');
								}
							} catch (error) {
								console.error('取消订单失败:', error);
								uni.showToast({
									title: '取消订单失败，请重试',
									icon: 'none'
								});
							} finally {
								this.submitting = false;
							}
						}
					}
				});
			},
			
			// 返回上一页
			goBack() {
				uni.showModal({
					title: '提示',
					content: '离开此页面将取消订单，是否确认？',
					success: (res) => {
						if(res.confirm) {
							// 取消订单
							this.cancelOrder();
							
							// 返回上一页
							uni.navigateBack({
								delta: 1,
								success: () => {
									console.log('返回上一页');
								},
								fail: () => {
									// 如果没有上一页，则返回首页
									uni.switchTab({
										url: '/pages/index/index'
									});
								}
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.payment-container {
		min-height: 100vh;
		background-color: #f8f4eb;
		padding-bottom: 120rpx;
		position: relative;
	}
	
	.header {
		background: linear-gradient(135deg, #4a5d80 0%, #647899 50%, #7a8ba8 100%);
		padding: 80rpx 40rpx 100rpx;
		position: relative;
		border-bottom-left-radius: 40rpx;
		border-bottom-right-radius: 40rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
		overflow: hidden;
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
			pointer-events: none;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 40rpx;
			background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));
			pointer-events: none;
		}
		
		.back-btn {
			position: absolute;
			left: 30rpx;
			top: 60rpx;
			width: 64rpx;
			height: 64rpx;
			background: rgba(0, 0, 0, 0.15);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			z-index: 10;
			backdrop-filter: blur(5px);
			-webkit-backdrop-filter: blur(5px);
			
			&:active {
				transform: scale(0.9);
				background: rgba(0, 0, 0, 0.25);
			}
		}
		
		.title-box {
			padding-left: 50rpx;
			position: relative;
			z-index: 1;
			
			.title {
				font-size: 48rpx;
				color: #ffffff;
				font-weight: 600;
				margin-bottom: 12rpx;
				display: block;
				text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
				position: relative;
				
				&::after {
					content: '';
					position: absolute;
					bottom: -8rpx;
					left: 0;
					width: 60rpx;
					height: 4rpx;
					background: rgba(255, 255, 255, 0.8);
					border-radius: 2rpx;
				}
			}
			
			.subtitle {
				font-size: 28rpx;
				color: rgba(255, 255, 255, 0.9);
				font-weight: 400;
				text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
			}
		}
	}
	
	.loading-container, .error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 120rpx;
		padding: 0 60rpx;
	}
	
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid rgba(139, 69, 19, 0.2);
		border-top-color: rgba(139, 69, 19, 0.8);
		border-radius: 50%;
		animation: spin 1.2s linear infinite;
	}
	
	.loading-text, .error-text {
		margin-top: 30rpx;
		font-size: 28rpx;
		color: #666;
		text-align: center;
	}
	
	.error-text {
		color: #d81e06;
		margin-bottom: 20rpx;
	}
	
	.retry-btn {
		margin-top: 30rpx;
		background: linear-gradient(135deg, #8B4513, #D2691E);
		color: #fff;
		font-size: 28rpx;
		padding: 16rpx 40rpx;
		border-radius: 40rpx;
		box-shadow: 0 6rpx 12rpx rgba(139, 69, 19, 0.25);
	}
	
	.payment-content {
		padding: 30rpx;
		
		.order-card {
			background: #ffffff;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			margin-bottom: 30rpx;
			
			.order-header {
				padding: 30rpx;
				background: rgba(139, 69, 19, 0.07);
				border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
				
				.order-title {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 10rpx;
					display: block;
				}
				
				.order-no {
					font-size: 24rpx;
					color: #666;
				}
			}
			
			.order-body {
				padding: 30rpx;
				
				.order-info-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 24rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.label {
						font-size: 28rpx;
						color: #666;
					}
					
					.price {
						display: flex;
						align-items: flex-end;
						
						.currency {
							font-size: 26rpx;
							color: #e74c3c;
							font-weight: 600;
							margin-right: 4rpx;
						}
						
						.amount {
							font-size: 40rpx;
							color: #e74c3c;
							font-weight: 700;
							line-height: 1;
						}
					}
					
					.status {
						font-size: 28rpx;
						padding: 6rpx 16rpx;
						border-radius: 20rpx;
						
						&.status-pending {
							background-color: rgba(241, 196, 15, 0.15);
							color: #f39c12;
						}
						
						&.status-processing {
							background-color: rgba(52, 152, 219, 0.15);
							color: #3498db;
						}
						
						&.status-success {
							background-color: rgba(46, 204, 113, 0.15);
							color: #2ecc71;
						}
						
						&.status-cancelled {
							background-color: rgba(192, 57, 43, 0.15);
							color: #c0392b;
						}
					}
					
					.countdown {
						font-size: 28rpx;
						color: #e74c3c;
						font-weight: 600;
					}
					
					.value {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}
				}
			}
		}
		
		.payment-methods {
			background: #ffffff;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			
			.section-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 24rpx;
				position: relative;
				padding-left: 20rpx;
				
				&::before {
					content: '';
					position: absolute;
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 6rpx;
					height: 32rpx;
					background: linear-gradient(to bottom, #8B4513, #D2691E);
					border-radius: 3rpx;
				}
			}
			
			.method-list {
				.method-item {
					display: flex;
					align-items: center;
					padding: 24rpx 20rpx;
					border-bottom: 1px solid rgba(0, 0, 0, 0.05);
					transition: all 0.3s ease;
					
					&:last-child {
						border-bottom: none;
					}
					
					&:active {
						background-color: rgba(139, 69, 19, 0.03);
					}
					
					&.active {
						background-color: rgba(139, 69, 19, 0.05);
					}
					
					.method-icon {
						width: 80rpx;
						height: 80rpx;
						background: rgba(139, 69, 19, 0.07);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 20rpx;
					}
					
					.method-info {
						flex: 1;
						
						.method-name {
							font-size: 30rpx;
							color: #333;
							font-weight: 500;
							margin-bottom: 6rpx;
							display: block;
						}
						
						.method-desc {
							font-size: 24rpx;
							color: #999;
						}
					}
					
					.method-check {
						.check-circle {
							width: 40rpx;
							height: 40rpx;
							border-radius: 50%;
							border: 2rpx solid #ccc;
							display: flex;
							align-items: center;
							justify-content: center;
							
							&.checked {
								border-color: #8B4513;
								background-color: #8B4513;
								position: relative;
								
								&::after {
									content: '';
									width: 20rpx;
									height: 10rpx;
									border: 2rpx solid #fff;
									border-top: none;
									border-right: none;
									transform: rotate(-45deg);
									position: absolute;
									top: 12rpx;
									left: 8rpx;
								}
							}
						}
					}
				}
			}
		}
		
		.payment-action {
			margin-top: 60rpx;
			margin-bottom: 120rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.pay-btn {
				width: 90%;
				height: 90rpx;
				background: linear-gradient(135deg, #8B4513, #D2691E);
				color: #fff;
				font-size: 32rpx;
				font-weight: 500;
				border-radius: 45rpx;
				box-shadow: 0 6rpx 12rpx rgba(139, 69, 19, 0.25);
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				
				&:active {
					transform: scale(0.98);
					box-shadow: 0 2rpx 6rpx rgba(139, 69, 19, 0.15);
				}
				
				&[disabled] {
					background: linear-gradient(135deg, #95a5a6, #7f8c8d);
					box-shadow: none;
				}
			}
			
			.cancel-order {
				margin-top: 30rpx;
				font-size: 28rpx;
				color: #666;
				text-decoration: underline;
				
				&:active {
					opacity: 0.7;
				}
			}
		}
	}
	
	.bottom-decoration {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 160rpx;
		overflow: hidden;
		pointer-events: none;
		z-index: 99;
		
		.deco-pattern {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 60rpx;
			background-image: 
				radial-gradient(circle at center, #8B4513 2px, transparent 2px),
				radial-gradient(circle at center, #8B4513 2px, transparent 2px);
			background-size: 24rpx 24rpx;
			background-position: 0 0, 12rpx 12rpx;
			opacity: 0.15;
			animation: patternMove 20s linear infinite;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(to top, rgba(248, 244, 235, 1) 0%, rgba(248, 244, 235, 0.9) 50%, rgba(248, 244, 235, 0) 100%);
		}
	}
	
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	
	@keyframes patternMove {
		0% {
			background-position: 0 0, 12rpx 12rpx;
		}
		100% {
			background-position: 24rpx 0, 36rpx 12rpx;
		}
	}
</style> 