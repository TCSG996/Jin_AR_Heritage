<template>
	<view class="booking-container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<!-- 返回按钮 -->
			<view class="back-btn" @tap="goBack">
				<uni-icons type="back" size="22" color="#fff"></uni-icons>
			</view>
			
			<view class="title-box">
				<text class="title">门票预订</text>
				<text class="subtitle">预订门票，探索传统建筑之美</text>
			</view>
		</view>
		
		<!-- 类别筛选标签 -->
		<view class="filter-tabs">
			<view 
				class="tab-item" 
				v-for="(tab, index) in filterTabs" 
				:key="index"
				:class="{'active': activeTab === index}"
				@tap="switchTab(index)"
			>
				<text>{{ tab.name }}</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载门票信息...</text>
		</view>
		
		<!-- 错误提示 -->
		<view class="error-container" v-else-if="hasError">
			<uni-icons type="error" size="50" color="#d81e06"></uni-icons>
			<text class="error-text">{{ errorMsg }}</text>
			<button class="retry-btn" @tap="getTicketList">重新加载</button>
		</view>
		
		<!-- 门票列表 -->
		<view class="ticket-list" v-else-if="filteredTickets && filteredTickets.length > 0">
			<view class="ticket-card" v-for="ticket in filteredTickets" :key="ticket.id" @tap="selectTicket(ticket)">
				<!-- 票种标签 -->
				<view class="ticket-badge" v-if="getTicketBadge(ticket)">
					{{ getTicketBadge(ticket) }}
				</view>
				
				<view class="ticket-header">
					<view class="ticket-name">{{ ticket.name }}</view>
					<view class="ticket-status" :class="{'status-active': ticket.status === 1, 'status-inactive': ticket.status !== 1}">
						{{ ticket.status === 1 ? '在售' : '停售' }}
					</view>
				</view>
				
				<view class="ticket-content">
					<view class="ticket-desc">{{ ticket.description }}</view>
					<view class="ticket-meta">
						<view class="price">
							<text class="currency">¥</text>
							<text class="amount">{{ formatPrice(ticket.price) }}</text>
						</view>
						<view class="stock">
							<uni-icons type="info" size="14" color="#666"></uni-icons>
							<text>剩余: {{ ticket.stock }}</text>
						</view>
						<view class="limit">
							<uni-icons type="calendar" size="14" color="#666"></uni-icons>
							<text>日限: {{ ticket.dailyLimit }}</text>
						</view>
					</view>
				</view>
				
				<view class="ticket-button" :class="{'disabled': ticket.status !== 1 || ticket.stock <= 0}">
					<text>{{ ticket.status === 1 && ticket.stock > 0 ? '立即预订' : '暂无法预订' }}</text>
					<uni-icons v-if="ticket.status === 1 && ticket.stock > 0" type="right" size="14" color="#fff"></uni-icons>
				</view>
			</view>
		</view>
		
		<!-- 空状态提示 -->
		<view class="empty-container" v-else>
			<image src="/static/empty.png" mode="aspectFit"></image>
			<text class="empty-text">暂无门票信息</text>
			<view class="empty-tips">
				<text>尝试切换其他类别或刷新页面</text>
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
				tickets: [], // 门票列表
				isLoading: false, // 加载状态
				hasError: false, // 是否有错误
				errorMsg: '加载失败，请重试', // 错误信息
				filterTabs: [
					{ name: '全部', type: 'all' },
					{ name: '成人票', type: 'adult' },
					{ name: '优惠票', type: 'discount' },
					{ name: '特殊票', type: 'special' }
				],
				activeTab: 0, // 当前激活的标签
			};
		},
		computed: {
			// 根据过滤条件过滤门票
			filteredTickets() {
				if (this.activeTab === 0) return this.tickets;
				
				const tabType = this.filterTabs[this.activeTab].type;
				return this.tickets.filter(ticket => {
					if (tabType === 'adult' && ticket.name.includes('成人')) return true;
					if (tabType === 'discount' && (ticket.name.includes('学生') || ticket.name.includes('老人'))) return true;
					if (tabType === 'special' && (ticket.name.includes('VIP') || ticket.name.includes('团体'))) return true;
					return false;
				});
			}
		},
		onLoad() {
			this.getTicketList();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getTicketList(true);
		},
		methods: {
			// 获取门票列表
			getTicketList(isPullDown = false) {
				if (!isPullDown) {
					this.isLoading = true;
				}
				this.hasError = false;
				
				// 使用API获取门票列表
				uni.request({
					url: `${api.baseUrl || 'http://192.168.194.9:8080'}/api/tickets`,
					method: 'GET',
					header: {
						'Content-Type': 'application/json'
					},
					success: (res) => {
						console.log('门票列表数据:', res.data);
						if (res.data && res.data.code === 200 && res.data.data) {
							this.tickets = res.data.data;
							
							// 成功获取数据显示提示
							if (isPullDown) {
								uni.showToast({
									title: '刷新成功',
									icon: 'success'
								});
							}
						} else {
							// 获取失败，显示错误信息
							this.hasError = true;
							this.errorMsg = res.data?.msg || '获取门票数据失败';
							console.error('门票数据返回错误:', res.data);
							uni.showToast({
								title: this.errorMsg,
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('请求门票数据出错:', err);
						this.hasError = true;
						this.errorMsg = '网络请求失败，请检查网络连接';
						uni.showToast({
							title: this.errorMsg,
							icon: 'none'
						});
					},
					complete: () => {
						this.isLoading = false;
						// 停止下拉刷新动画
						uni.stopPullDownRefresh();
					}
				});
			},
			
			// 格式化价格，保留两位小数
			formatPrice(price) {
				return parseFloat(price).toFixed(2);
			},
			
			// 选择门票
			selectTicket(ticket) {
				if (!ticket || !ticket.id) {
					uni.showToast({
						title: '门票信息不完整',
						icon: 'none'
					});
					return;
				}
				
				if (ticket.status !== 1 || ticket.stock <= 0) {
					uni.showToast({
						title: '该门票暂无法预订',
						icon: 'none'
					});
					return;
				}
				
				// 构建跳转参数
				const params = {
					id: ticket.id,
					name: encodeURIComponent(ticket.name),
					price: ticket.price,
					description: encodeURIComponent(ticket.description),
					stock: ticket.stock,
					dailyLimit: ticket.dailyLimit,
					status: ticket.status
				};
				
				// 构建URL查询字符串
				const queryString = Object.entries(params)
					.map(([key, value]) => `${key}=${value}`)
					.join('&');
				
				// 跳转到门票详情/确认页
				uni.navigateTo({
					url: `/pages/index/booking/confirm?${queryString}`,
					success: () => {
						console.log('跳转到确认页面成功');
					},
					fail: (err) => {
						console.error('跳转失败:', err);
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 切换标签
			switchTab(index) {
				if (this.activeTab === index) return;
				this.activeTab = index;
				
				// 切换动画效果
				uni.vibrateShort({
					success: function () {
						console.log('切换标签触感反馈');
					}
				});
			},
			
			// 获取票种标签
			getTicketBadge(ticket) {
				if (ticket.name.includes('VIP')) return '特享';
				if (ticket.price < 50) return '优惠';
				if (ticket.stock < 100 && ticket.stock > 0) return '热销';
				if (ticket.name.includes('假日')) return '假日';
				return '';
			},
			
			// 返回上一页
			goBack() {
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
	}
</script>

<style lang="scss">
	.booking-container {
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
		
		// 返回按钮
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
			
			&:active {
				transform: scale(0.9);
				background: rgba(0, 0, 0, 0.25);
			}
			
			&::after {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				border-radius: 50%;
				border: 1px solid rgba(255, 255, 255, 0.2);
				box-sizing: border-box;
			}
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 60rpx;
			background: linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent);
			border-bottom-left-radius: 40rpx;
			border-bottom-right-radius: 40rpx;
		}
		
		// 装饰图案
		&::before {
			content: '';
			position: absolute;
			right: 40rpx;
			top: 40rpx;
			width: 120rpx;
			height: 120rpx;
			background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 2px);
			background-size: 18rpx 18rpx;
			border-radius: 50%;
			opacity: 0.8;
		}
		
		.title-box {
			padding-left: 50rpx;
			
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
			}
		}
	}
	
	// 类别筛选标签
	.filter-tabs {
		display: flex;
		justify-content: space-between;
		padding: 0 30rpx;
		margin: -50rpx auto 30rpx;
		position: relative;
		z-index: 10;
		
		.tab-item {
			background: #fff;
			flex: 1;
			margin: 0 10rpx;
			padding: 20rpx 0;
			text-align: center;
			border-radius: 16rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
			position: relative;
			transition: all 0.3s ease;
			
			&:first-child {
				margin-left: 0;
			}
			
			&:last-child {
				margin-right: 0;
			}
			
			text {
				font-size: 26rpx;
				color: #666;
				font-weight: 500;
				transition: all 0.3s ease;
			}
			
			&::after {
				content: '';
				position: absolute;
				bottom: 10rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 0;
				height: 4rpx;
				background: linear-gradient(to right, #8B4513, #D2691E);
				border-radius: 4rpx;
				transition: all 0.3s ease;
			}
			
			&.active {
				background: rgba(255, 255, 255, 0.95);
				box-shadow: 0 6rpx 16rpx rgba(139, 69, 19, 0.15);
				transform: translateY(-4rpx);
				
				text {
					color: #8B4513;
					font-weight: 600;
				}
				
				&::after {
					width: 40rpx;
				}
			}
			
			&:active {
				transform: scale(0.95);
			}
		}
	}
	
	.loading-container, .error-container, .empty-container {
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
	
	.loading-text, .error-text, .empty-text {
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
	
	.empty-container {
		image {
			width: 240rpx;
			height: 240rpx;
			opacity: 0.7;
		}
		
		.empty-tips {
			margin-top: 20rpx;
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.ticket-list {
		margin: 30rpx 30rpx;
		position: relative;
		z-index: 10;
		
		.ticket-card {
			background: #ffffff;
			border-radius: 20rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			margin-bottom: 30rpx;
			overflow: hidden;
			position: relative;
			border: 1px solid rgba(0, 0, 0, 0.04);
			transition: all 0.3s ease;
			
			&:active {
				transform: translateY(4rpx);
				box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
			}
			
			// 票种标签
			.ticket-badge {
				position: absolute;
				top: 0;
				right: 60rpx;
				background: linear-gradient(135deg, #e74c3c, #c0392b);
				color: #fff;
				font-size: 22rpx;
				font-weight: 600;
				padding: 10rpx 16rpx;
				border-bottom-left-radius: 10rpx;
				border-bottom-right-radius: 10rpx;
				box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
				z-index: 5;
			}
			
			// 上边镂空
			&::before {
				content: '';
				position: absolute;
				left: -10rpx;
				top: 70%;
				width: 20rpx;
				height: 40rpx;
				background: #f8f4eb;
				border-radius: 0 20rpx 20rpx 0;
				z-index: 2;
			}
			
			// 下边镂空
			&::after {
				content: '';
				position: absolute;
				right: -10rpx;
				top: 70%;
				width: 20rpx;
				height: 40rpx;
				background: #f8f4eb;
				border-radius: 20rpx 0 0 20rpx;
				z-index: 2;
			}
			
			.ticket-header {
				padding: 30rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
				
				.ticket-name {
					font-size: 36rpx;
					font-weight: 600;
					color: #333;
				}
				
				.ticket-status {
					font-size: 24rpx;
					padding: 6rpx 16rpx;
					border-radius: 20rpx;
					
					&.status-active {
						background-color: rgba(46, 204, 113, 0.15);
						color: #2ecc71;
					}
					
					&.status-inactive {
						background-color: rgba(192, 57, 43, 0.15);
						color: #c0392b;
					}
				}
			}
			
			.ticket-content {
				padding: 30rpx;
				
				.ticket-desc {
					font-size: 28rpx;
					color: #666;
					line-height: 1.5;
					margin-bottom: 30rpx;
				}
				
				.ticket-meta {
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					
					.price {
						margin-right: 40rpx;
						display: flex;
						align-items: flex-end;
						
						.currency {
							font-size: 26rpx;
							color: #e74c3c;
							font-weight: 600;
							margin-right: 4rpx;
						}
						
						.amount {
							font-size: 42rpx;
							color: #e74c3c;
							font-weight: 700;
							line-height: 1;
						}
					}
					
					.stock, .limit {
						display: flex;
						align-items: center;
						font-size: 24rpx;
						color: #666;
						margin-right: 20rpx;
						
						text {
							margin-left: 6rpx;
						}
					}
				}
			}
			
			.ticket-button {
				background: linear-gradient(135deg, #8B4513, #D2691E);
				color: #fff;
				text-align: center;
				padding: 24rpx 0;
				font-size: 30rpx;
				font-weight: 500;
				position: relative;
				transition: all 0.3s ease;
				display: flex;
				align-items: center;
				justify-content: center;
				
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
				}
				
				uni-icons {
					margin-left: 8rpx;
					opacity: 0.9;
				}
				
				&:active {
					background: linear-gradient(135deg, #753c10, #b35c1a);
				}
				
				&.disabled {
					background: linear-gradient(135deg, #95a5a6, #7f8c8d);
				}
			}
		}
	}
	
	// 底部装饰
	.bottom-decoration {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 80rpx;
		overflow: hidden;
		pointer-events: none;
		
		.deco-pattern {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 30rpx;
			background-image: 
				radial-gradient(circle at center, #8B4513 2px, transparent 2px),
				radial-gradient(circle at center, #8B4513 2px, transparent 2px);
			background-size: 24rpx 24rpx;
			background-position: 0 0, 12rpx 12rpx;
			opacity: 0.15;
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
</style>
