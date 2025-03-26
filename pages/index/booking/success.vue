<template>
	<view class="success-container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<view class="title-box">
				<text class="title">支付成功</text>
				<text class="subtitle">您的门票已预订成功</text>
			</view>
		</view>
		
		<!-- 成功内容 -->
		<view class="success-content">
			<!-- 成功图标 -->
			<view class="success-icon">
				<view class="icon-circle">
					<uni-icons type="checkmarkempty" size="80" color="#fff"></uni-icons>
				</view>
				<view class="success-message">支付成功</view>
			</view>
			
			<!-- 订单信息卡片 -->
			<view class="order-card">
				<view class="order-header">
					<text class="order-title">订单信息</text>
					<text class="order-no">订单号：{{ orderNo }}</text>
				</view>
				
				<view class="order-body">
					<view class="qr-code">
						<view class="qr-image">
							<!-- 实际项目中应使用真实的二维码 -->
							<view class="mock-qr"></view>
						</view>
						<text class="qr-tip">请凭此二维码入园</text>
					</view>
					
					<view class="order-info-list">
						<view class="info-item">
							<text class="label">门票类型</text>
							<text class="value">{{ ticketName || '预约门票' }}</text>
						</view>
						<view class="info-item">
							<text class="label">购买数量</text>
							<text class="value">{{ quantity || 1 }}张</text>
						</view>
						<view class="info-item">
							<text class="label">参观日期</text>
							<text class="value">{{ visitDate || '2023-06-01' }}</text>
						</view>
						<view class="info-item">
							<text class="label">游客姓名</text>
							<text class="value">{{ visitorName || '游客' }}</text>
						</view>
						<view class="info-item">
							<text class="label">联系电话</text>
							<text class="value">{{ visitorPhone || '未提供' }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 使用说明 -->
			<view class="usage-info">
				<view class="section-title">使用说明</view>
				<view class="info-list">
					<view class="info-item">
						<uni-icons type="calendar" size="16" color="#8B4513"></uni-icons>
						<text>门票有效期：{{ visitDate || '2023-06-01' }}当天有效</text>
					</view>
					<view class="info-item">
						<uni-icons type="info" size="16" color="#8B4513"></uni-icons>
						<text>请在景区开放时间内入园</text>
					</view>
					<view class="info-item">
						<uni-icons type="paperplane" size="16" color="#8B4513"></uni-icons>
						<text>入园时请出示电子门票二维码</text>
					</view>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="action-btn primary-btn" @tap="saveTicket">保存门票</button>
				<button class="action-btn outline-btn" @tap="viewMyTickets">查看我的门票</button>
				<button class="action-btn text-btn" @tap="backToHome">返回首页</button>
			</view>
		</view>
		
		<!-- 底部装饰元素 -->
		<view class="bottom-decoration">
			<view class="deco-pattern"></view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderNo: '',
				ticketName: '',
				quantity: 1,
				visitDate: '',
				visitorName: '',
				visitorPhone: ''
			};
		},
		onLoad(options) {
			// 获取订单号
			if(options.orderNo) {
				this.orderNo = options.orderNo;
				// 实际项目中应根据订单号获取订单详情
				this.loadOrderDetail();
			}
		},
		methods: {
			// 加载订单详情
			loadOrderDetail() {
				try {
					// 尝试从本地存储获取最近支付成功的订单信息
					const lastPaidOrder = uni.getStorageSync('lastPaidOrder');
					if (lastPaidOrder && lastPaidOrder.orderNo === this.orderNo) {
						console.log('从本地存储获取支付成功订单:', lastPaidOrder);
						this.ticketName = lastPaidOrder.ticketName || '预约门票';
						this.quantity = lastPaidOrder.quantity || 1;
						this.visitDate = lastPaidOrder.visitDate || '';
						this.visitorName = lastPaidOrder.visitorName || '';
						this.visitorPhone = lastPaidOrder.visitorPhone || '';
						return;
					}
					
					// 如果本地没有，则尝试从API获取
					this.loadOrderFromApi();
				} catch (e) {
					console.error('从本地获取订单信息失败:', e);
					this.loadOrderFromApi();
				}
			},
			
			// 从API加载订单详情
			async loadOrderFromApi() {
				try {
					// 调用API获取订单详情
					const res = await api.user.getOrderDetail(this.orderNo);
					if (res.code === 200 && res.data) {
						const orderData = res.data;
						this.ticketName = orderData.ticketName || '预约门票';
						this.quantity = orderData.quantity || 1;
						this.visitDate = orderData.visitDate || '';
						this.visitorName = orderData.visitorName || '';
						this.visitorPhone = orderData.visitorPhone || '';
					} else {
						console.error('获取订单详情失败:', res.msg);
						// 使用默认数据
						this.useDefaultData();
					}
				} catch (error) {
					console.error('获取订单详情API异常:', error);
					// 使用默认数据
					this.useDefaultData();
				}
			},
			
			// 使用默认数据（当API请求失败时）
			useDefaultData() {
				// 使用模拟数据
				this.ticketName = '预约门票';
				this.quantity = 1;
				this.visitDate = new Date().toISOString().split('T')[0];
				this.visitorName = '游客';
				this.visitorPhone = '';
			},
			
			// 保存门票
			saveTicket() {
				uni.showToast({
					title: '门票已保存到相册',
					icon: 'success'
				});
			},
			
			// 查看我的门票
			viewMyTickets() {
				uni.navigateTo({
					url: '/pages/user/tickets'
				})
			},
			
			// 返回首页
			backToHome() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		}
	}
</script>

<style lang="scss">
	.success-container {
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
		
		.title-box {
			text-align: center;
			position: relative;
			z-index: 1;
			
			.title {
				font-size: 48rpx;
				color: #ffffff;
				font-weight: 600;
				margin-bottom: 12rpx;
				display: block;
				text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
			}
			
			.subtitle {
				font-size: 28rpx;
				color: rgba(255, 255, 255, 0.9);
				font-weight: 400;
				text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
			}
		}
	}
	
	.success-content {
		padding: 0 30rpx;
		margin-top: -60rpx;
		position: relative;
		z-index: 10;
		
		.success-icon {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-bottom: 40rpx;
			
			.icon-circle {
				width: 160rpx;
				height: 160rpx;
				background: linear-gradient(135deg, #2ecc71, #27ae60);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 6rpx 20rpx rgba(46, 204, 113, 0.3);
				margin-bottom: 20rpx;
			}
			
			.success-message {
				font-size: 36rpx;
				color: #2ecc71;
				font-weight: 600;
			}
		}
		
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
				
				.qr-code {
					display: flex;
					flex-direction: column;
					align-items: center;
					margin-bottom: 30rpx;
					
					.qr-image {
						width: 300rpx;
						height: 300rpx;
						background: #fff;
						padding: 20rpx;
						box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
						margin-bottom: 16rpx;
						
						.mock-qr {
							width: 100%;
							height: 100%;
							background-image:
								repeating-linear-gradient(0deg, #333, #333 10rpx, transparent 10rpx, transparent 20rpx),
								repeating-linear-gradient(90deg, #333, #333 10rpx, transparent 10rpx, transparent 20rpx);
							background-size: 10% 10%;
							background-position: center;
							position: relative;
							
							&::after {
								content: '';
								position: absolute;
								top: 50%;
								left: 50%;
								width: 40%;
								height: 40%;
								background: #fff;
								transform: translate(-50%, -50%);
							}
							
							&::before {
								content: '';
								position: absolute;
								top: 50%;
								left: 50%;
								width: 20%;
								height: 20%;
								background: #333;
								transform: translate(-50%, -50%);
							}
						}
					}
					
					.qr-tip {
						font-size: 26rpx;
						color: #666;
					}
				}
				
				.order-info-list {
					.info-item {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 20rpx 0;
						border-bottom: 1px solid rgba(0, 0, 0, 0.05);
						
						&:last-child {
							border-bottom: none;
						}
						
						.label {
							font-size: 28rpx;
							color: #666;
						}
						
						.value {
							font-size: 28rpx;
							color: #333;
							font-weight: 500;
						}
					}
				}
			}
		}
		
		.usage-info {
			background: #ffffff;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			position: relative;
			
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 6rpx;
				background: linear-gradient(to right, #8B4513, transparent);
			}
			
			.section-title {
				font-size: 32rpx;
				font-weight: 600;
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
					height: 32rpx;
					background: linear-gradient(to bottom, #8B4513, #D2691E);
					border-radius: 3rpx;
				}
			}
			
			.info-list {
				.info-item {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					padding: 16rpx;
					background: rgba(139, 69, 19, 0.03);
					border-radius: 12rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					&:hover {
						background: rgba(139, 69, 19, 0.05);
					}
					
					uni-icons {
						margin-right: 16rpx;
					}
					
					text {
						font-size: 26rpx;
						color: #666;
					}
				}
			}
		}
		
		.action-buttons {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin: 60rpx 0;
			
			.action-btn {
				width: 80%;
				height: 90rpx;
				border-radius: 45rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 30rpx;
				font-size: 32rpx;
				transition: all 0.3s ease;
				
				&:active {
					transform: scale(0.98);
				}
				
				&.primary-btn {
					background: linear-gradient(135deg, #8B4513, #D2691E);
					color: #fff;
					box-shadow: 0 6rpx 12rpx rgba(139, 69, 19, 0.25);
				}
				
				&.outline-btn {
					background: #fff;
					color: #8B4513;
					border: 1px solid #8B4513;
				}
				
				&.text-btn {
					background: #f5f5f5;
					color: #666;
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
		z-index: 5;
		
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
	
	@keyframes patternMove {
		0% {
			background-position: 0 0, 12rpx 12rpx;
		}
		100% {
			background-position: 24rpx 0, 36rpx 12rpx;
		}
	}
</style> 