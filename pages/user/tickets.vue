<template>
	<view class="tickets-container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<!-- 返回按钮 -->
			<view class="back-btn" @tap="goBack">
				<uni-icons type="back" size="22" color="#fff"></uni-icons>
			</view>
			
			<view class="title-box">
				<text class="title">我的门票</text>
				<text class="subtitle">全部预约记录</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载门票信息...</text>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-container" v-else-if="tickets.length === 0">
			<uni-icons type="info" size="60" color="#ccc"></uni-icons>
			<text class="empty-text">暂无门票记录</text>
			<button class="action-btn" @tap="goToBooking">去预订门票</button>
		</view>
		
		<!-- 门票列表 -->
		<view class="tickets-list" v-else>
			<!-- 筛选标签 -->
			<view class="filter-tabs">
				<view class="tab-item" 
					  v-for="(tab, index) in tabs" 
					  :key="index"
					  :class="{'active': currentTab === tab.value}"
					  @tap="switchTab(tab.value)">
					{{ tab.label }}
				</view>
			</view>
			
			<!-- 门票卡片列表 -->
			<view class="ticket-cards">
				<view class="ticket-card" v-for="(ticket, index) in filteredTickets" :key="index" @tap="viewTicketDetail(ticket)">
					<view class="ticket-header" :class="{'status-used': ticket.status === 2, 'status-expired': ticket.status === 3}">
						<view class="ticket-name">{{ ticket.ticketName }}</view>
						<view class="ticket-status">{{ getStatusText(ticket.status) }}</view>
					</view>
					
					<view class="ticket-body">
						<view class="ticket-info">
							<view class="info-item">
								<text class="label">订单号</text>
								<text class="value">{{ ticket.orderNo }}</text>
							</view>
							<view class="info-item">
								<text class="label">参观日期</text>
								<text class="value">{{ ticket.visitDate }}</text>
							</view>
							<view class="info-item">
								<text class="label">购买数量</text>
								<text class="value">{{ ticket.quantity }}张</text>
							</view>
							<view class="info-item">
								<text class="label">下单时间</text>
								<text class="value">{{ formatDate(ticket.createTime) }}</text>
							</view>
						</view>
						
						<view class="ticket-actions">
							<view class="price">
								<text class="currency">¥</text>
								<text class="amount">{{ formatPrice(ticket.totalPrice) }}</text>
							</view>
							
							<view class="action-btns">
								<button class="btn main-btn" v-if="ticket.status === 0" @tap.stop="goToPay(ticket)">去支付</button>
								<button class="btn main-btn" v-else-if="ticket.status === 1" @tap.stop="viewQrCode(ticket)">查看二维码</button>
								<button class="btn second-btn" v-if="ticket.status === 0" @tap.stop="cancelOrder(ticket)">取消订单</button>
								<button class="btn second-btn" v-else-if="ticket.status === 1" @tap.stop="requestRefund(ticket)">申请退款</button>
							</view>
						</view>
					</view>
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
				isLoading: true,
				tickets: [],
				currentTab: 'all',
				tabs: [
					{ label: '全部', value: 'all' },
					{ label: '待支付', value: 0 },
					{ label: '待使用', value: 1 },
					{ label: '已使用', value: 2 },
					{ label: '已过期', value: 3 },
					{ label: '已取消', value: 4 }
				]
			};
		},
		computed: {
			filteredTickets() {
				if (this.currentTab === 'all') {
					return this.tickets;
				} else {
					return this.tickets.filter(ticket => ticket.status === this.currentTab);
				}
			}
		},
		onLoad() {
			this.loadTickets();
		},
		onPullDownRefresh() {
			this.loadTickets();
		},
		methods: {
			// 加载门票列表
			async loadTickets() {
				this.isLoading = true;
				
				try {
					// 实际项目中应调用API获取门票列表
					// const res = await api.user.getMyTickets();
					// if (res.code === 200 && res.data) {
					//   this.tickets = res.data;
					// }
					
					// 模拟数据
					setTimeout(() => {
						this.tickets = [
							{
								id: 1,
								orderNo: 'T20230501ABCD',
								ticketId: 1,
								ticketName: '成人票',
								quantity: 2,
								totalPrice: 200.00,
								visitDate: '2023-06-01',
								visitorName: '张三',
								visitorPhone: '138****8000',
								status: 0, // 0-待支付 1-待使用 2-已使用 3-已过期 4-已取消
								createTime: '2023-05-01T12:34:56'
							},
							{
								id: 2,
								orderNo: 'T20230502EFGH',
								ticketId: 2,
								ticketName: '学生票',
								quantity: 1,
								totalPrice: 60.00,
								visitDate: '2023-06-15',
								visitorName: '李四',
								visitorPhone: '139****9000',
								status: 1,
								createTime: '2023-05-02T10:24:36'
							},
							{
								id: 3,
								orderNo: 'T20230510IJKL',
								ticketId: 3,
								ticketName: '家庭套票',
								quantity: 4,
								totalPrice: 360.00,
								visitDate: '2023-05-20',
								visitorName: '王五',
								visitorPhone: '137****7000',
								status: 2,
								createTime: '2023-05-10T09:14:26'
							},
							{
								id: 4,
								orderNo: 'T20230415MNOP',
								ticketId: 1,
								ticketName: '成人票',
								quantity: 2,
								totalPrice: 200.00,
								visitDate: '2023-04-20',
								visitorName: '赵六',
								visitorPhone: '136****6000',
								status: 3,
								createTime: '2023-04-15T15:44:16'
							},
							{
								id: 5,
								orderNo: 'T20230420QRST',
								ticketId: 2,
								ticketName: '学生票',
								quantity: 1,
								totalPrice: 60.00,
								visitDate: '2023-04-25',
								visitorName: '钱七',
								visitorPhone: '135****5000',
								status: 4,
								createTime: '2023-04-20T11:54:06'
							}
						];
						
						this.isLoading = false;
						uni.stopPullDownRefresh();
					}, 1000);
				} catch (error) {
					console.error('加载门票列表失败:', error);
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					});
					this.isLoading = false;
					uni.stopPullDownRefresh();
				}
			},
			
			// 切换标签
			switchTab(tab) {
				this.currentTab = tab;
			},
			
			// 获取状态文本
			getStatusText(status) {
				const statusMap = {
					0: '待支付',
					1: '待使用',
					2: '已使用',
					3: '已过期',
					4: '已取消'
				};
				return statusMap[status] || '未知状态';
			},
			
			// 格式化价格
			formatPrice(price) {
				return parseFloat(price).toFixed(2);
			},
			
			// 格式化日期
			formatDate(dateStr) {
				const date = new Date(dateStr);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
			},
			
			// 查看门票详情
			viewTicketDetail(ticket) {
				uni.navigateTo({
					url: `/pages/index/booking/success?orderNo=${ticket.orderNo}`
				});
			},
			
			// 去支付
			goToPay(ticket) {
				uni.navigateTo({
					url: `/pages/index/booking/payment?orderNo=${ticket.orderNo}&totalPrice=${ticket.totalPrice}`
				});
			},
			
			// 查看二维码
			viewQrCode(ticket) {
				uni.navigateTo({
					url: `/pages/index/booking/success?orderNo=${ticket.orderNo}`
				});
			},
			
			// 取消订单
			cancelOrder(ticket) {
				uni.showModal({
					title: '取消订单',
					content: '确定要取消此订单吗？',
					success: (res) => {
						if (res.confirm) {
							// 实际项目中应调用API取消订单
							// api.user.cancelOrder(ticket.orderNo).then(res => {
							//   if (res.code === 200) {
							//     uni.showToast({ title: '订单已取消', icon: 'success' });
							//     // 更新订单状态
							//     const index = this.tickets.findIndex(t => t.orderNo === ticket.orderNo);
							//     if (index !== -1) {
							//       this.tickets[index].status = 4;
							//     }
							//   }
							// });
							
							// 模拟取消
							setTimeout(() => {
								uni.showToast({
									title: '订单已取消',
									icon: 'success'
								});
								
								// 更新本地数据
								const index = this.tickets.findIndex(t => t.orderNo === ticket.orderNo);
								if (index !== -1) {
									this.tickets[index].status = 4;
								}
							}, 500);
						}
					}
				});
			},
			
			// 申请退款
			requestRefund(ticket) {
				uni.showModal({
					title: '申请退款',
					content: '确定要申请退款吗？',
					success: (res) => {
						if (res.confirm) {
							// 实际项目中应调用API申请退款
							// api.user.requestRefund(ticket.orderNo).then(res => {
							//   if (res.code === 200) {
							//     uni.showToast({ title: '退款申请已提交', icon: 'success' });
							//   }
							// });
							
							// 模拟申请
							setTimeout(() => {
								uni.showToast({
									title: '退款申请已提交',
									icon: 'success'
								});
							}, 500);
						}
					}
				});
			},
			
			// 跳转到门票预订页面
			goToBooking() {
				uni.navigateTo({
					url: '/pages/index/booking/booking'
				});
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack({
					delta: 1,
					fail: () => {
						// 如果没有上一页，则返回我的页面
						uni.switchTab({
							url: '/pages/my/my'
						});
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.tickets-container {
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
	
	.loading-container {
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
	
	.loading-text {
		margin-top: 30rpx;
		font-size: 28rpx;
		color: #666;
		text-align: center;
	}
	
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 120rpx;
		padding: 0 60rpx;
	}
	
	.empty-text {
		margin: 30rpx 0;
		font-size: 30rpx;
		color: #999;
		text-align: center;
	}
	
	.action-btn {
		background: linear-gradient(135deg, #8B4513, #D2691E);
		color: #fff;
		font-size: 30rpx;
		padding: 20rpx 60rpx;
		border-radius: 40rpx;
		box-shadow: 0 6rpx 12rpx rgba(139, 69, 19, 0.25);
		margin-top: 20rpx;
	}
	
	.tickets-list {
		padding: 0 30rpx;
		margin-top: -40rpx;
		position: relative;
		z-index: 10;
		
		.filter-tabs {
			display: flex;
			background: #fff;
			border-radius: 20rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			padding: 20rpx;
			margin-bottom: 30rpx;
			overflow-x: auto;
			white-space: nowrap;
			
			.tab-item {
				padding: 12rpx 30rpx;
				font-size: 28rpx;
				color: #666;
				margin-right: 10rpx;
				border-radius: 30rpx;
				transition: all 0.3s ease;
				
				&:last-child {
					margin-right: 0;
				}
				
				&:active {
					opacity: 0.8;
				}
				
				&.active {
					background: linear-gradient(135deg, #8B4513, #D2691E);
					color: #fff;
					box-shadow: 0 4rpx 8rpx rgba(139, 69, 19, 0.2);
				}
			}
		}
		
		.ticket-cards {
			.ticket-card {
				background: #fff;
				border-radius: 20rpx;
				overflow: hidden;
				box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
				margin-bottom: 30rpx;
				position: relative;
				
				&:last-child {
					margin-bottom: 60rpx;
				}
				
				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
				}
				
				.ticket-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 30rpx;
					background: rgba(139, 69, 19, 0.07);
					border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
					position: relative;
					
					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						width: 6rpx;
						height: 100%;
						background: linear-gradient(to bottom, #8B4513, #D2691E);
					}
					
					&::after {
						content: '';
						position: absolute;
						left: 0;
						right: 0;
						bottom: -1px;
						height: 1px;
						background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
					}
					
					&.status-used {
						background: rgba(46, 204, 113, 0.07);
						
						&::before {
							background: linear-gradient(to bottom, #27ae60, #2ecc71);
						}
					}
					
					&.status-expired {
						background: rgba(189, 195, 199, 0.15);
						
						&::before {
							background: linear-gradient(to bottom, #95a5a6, #7f8c8d);
						}
					}
					
					.ticket-name {
						font-size: 32rpx;
						font-weight: 600;
						color: #333;
						padding-left: 16rpx;
					}
					
					.ticket-status {
						font-size: 24rpx;
						padding: 6rpx 16rpx;
						border-radius: 20rpx;
						background: rgba(255, 255, 255, 0.6);
						box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
					}
				}
				
				.ticket-body {
					padding: 30rpx;
					
					.ticket-info {
						.info-item {
							display: flex;
							justify-content: space-between;
							align-items: center;
							margin-bottom: 16rpx;
							
							&:last-child {
								margin-bottom: 0;
							}
							
							.label {
								font-size: 26rpx;
								color: #666;
							}
							
							.value {
								font-size: 26rpx;
								color: #333;
								font-weight: 500;
							}
						}
					}
					
					.ticket-actions {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-top: 30rpx;
						padding-top: 20rpx;
						border-top: 1px solid rgba(0, 0, 0, 0.05);
						
						.price {
							display: flex;
							align-items: flex-end;
							
							.currency {
								font-size: 24rpx;
								color: #e74c3c;
								font-weight: 600;
								margin-right: 4rpx;
							}
							
							.amount {
								font-size: 36rpx;
								color: #e74c3c;
								font-weight: 700;
								line-height: 1;
							}
						}
						
						.action-btns {
							display: flex;
							
							.btn {
								margin-left: 20rpx;
								height: 60rpx;
								line-height: 60rpx;
								font-size: 24rpx;
								border-radius: 30rpx;
								background: #fff;
								
								&.main-btn {
									background: linear-gradient(135deg, #8B4513, #D2691E);
									color: #fff;
									padding: 0 30rpx;
								}
								
								&.second-btn {
									color: #8B4513;
									border: 1px solid #8B4513;
									padding: 0 20rpx;
								}
							}
						}
					}
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