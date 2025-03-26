<template>
	<view class="confirm-container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<!-- 返回按钮 -->
			<view class="back-btn" @tap="goBack">
				<uni-icons type="back" size="22" color="#fff"></uni-icons>
			</view>

			<view class="title-box">
				<text class="title">门票详情</text>
				<text class="subtitle">确认订单信息</text>
			</view>

			<view class="right-action" @tap="goToMyTickets">
				<text class="action-text">我的门票</text>
				<uni-icons type="forward" size="14" color="#8B4513"></uni-icons>
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
			<button class="retry-btn" @tap="getTicketDetail">重新加载</button>
		</view>

		<!-- 门票详情 -->
		<view class="ticket-detail" v-else-if="ticketInfo">
			<!-- 门票基本信息 -->
			<view class="ticket-card">
				<view class="ticket-header">
					<view class="ticket-name">{{ ticketInfo.name }}</view>
					<view class="ticket-status"
						:class="{'status-active': ticketInfo.status === 1, 'status-inactive': ticketInfo.status !== 1}">
						{{ ticketInfo.status === 1 ? '在售' : '停售' }}
					</view>
				</view>

				<view class="ticket-content">
					<view class="ticket-desc">{{ ticketInfo.description }}</view>
					<view class="ticket-meta">
						<view class="price">
							<text class="currency">¥</text>
							<text class="amount">{{ formatPrice(ticketInfo.price) }}</text>
						</view>
						<view class="stock">
							<uni-icons type="info" size="14" color="#666"></uni-icons>
							<text>剩余: {{ ticketInfo.stock }}</text>
						</view>
						<view class="limit">
							<uni-icons type="calendar" size="14" color="#666"></uni-icons>
							<text>日限: {{ ticketInfo.dailyLimit }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 订单信息 -->
			<view class="order-info">
				<view class="section-title">订单信息</view>
				<view class="info-item">
					<text class="label">购买数量</text>
					<view class="quantity-control">
						<view class="quantity-btn" @tap="decreaseQuantity" :class="{'disabled': quantity <= 1}">-</view>
						<input type="number" v-model="quantity" class="quantity-input" />
						<view class="quantity-btn" @tap="increaseQuantity"
							:class="{'disabled': quantity >= maxQuantity}">+</view>
					</view>
				</view>
				<view class="info-item">
					<text class="label">总价</text>
					<view class="total-price">
						<text class="currency">¥</text>
						<text class="amount">{{ formatPrice(totalPrice) }}</text>
					</view>
				</view>
			</view>

			<!-- 访客信息 -->
			<view class="visitor-info">
				<view class="section-title">访客信息</view>
				<view class="form-item">
					<text class="label">参观日期</text>
					<picker mode="date" :value="visitDate" :start="today" :end="maxDate" @change="onDateChange">
						<view class="picker-value">{{ visitDate || '请选择参观日期' }}</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">访客姓名</text>
					<input type="text" v-model="visitorName" placeholder="请输入访客姓名" class="input-field" />
				</view>
				<view class="form-item">
					<text class="label">手机号码</text>
					<input type="number" v-model="visitorPhone" placeholder="请输入手机号码" class="input-field"
						maxlength="11" />
				</view>
				<view class="form-item">
					<text class="label">身份证号</text>
					<input type="idcard" v-model="visitorIdCard" placeholder="请输入身份证号" class="input-field"
						maxlength="18" />
				</view>
			</view>

			<!-- 使用说明 -->
			<view class="usage-info">
				<view class="section-title">使用说明</view>
				<view class="info-list">
					<view class="info-item">
						<uni-icons type="calendar" size="16" color="#8B4513"></uni-icons>
						<text>门票有效期：购买日起30天内有效</text>
					</view>
					<view class="info-item">
						<uni-icons type="info" size="16" color="#8B4513"></uni-icons>
						<text>每人每天限购{{ ticketInfo.dailyLimit }}张</text>
					</view>
					<view class="info-item">
						<uni-icons type="paperplane" size="16" color="#8B4513"></uni-icons>
						<text>入园时请出示电子门票</text>
					</view>
				</view>
			</view>

			<!-- 底部操作栏 -->
			<view class="bottom-bar">
				<view class="price-info">
					<text>总计：</text>
					<view class="total-price">
						<text class="currency">¥</text>
						<text class="amount">{{ formatPrice(totalPrice) }}</text>
					</view>
				</view>
				<button class="submit-btn" @tap="submitOrder" :disabled="!canSubmit">
					{{ submitBtnText }}
				</button>
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
				ticketId: null,
				ticketInfo: null,
				isLoading: false,
				hasError: false,
				errorMsg: '加载失败，请重试',
				quantity: 1,
				maxQuantity: 1,
				// 新增访客信息字段
				visitDate: '',
				visitorName: '',
				visitorPhone: '',
				visitorIdCard: '',
				userId: null, // 用户ID，从本地存储获取
				isSubmitting: false
			};
		},
		computed: {
			totalPrice() {
				if (!this.ticketInfo) return 0;
				return this.ticketInfo.price * this.quantity;
			},
			canSubmit() {
				return this.ticketInfo &&
					this.ticketInfo.status === 1 &&
					this.ticketInfo.stock > 0 &&
					this.quantity > 0 &&
					this.visitDate &&
					this.visitorName &&
					this.visitorPhone &&
					this.visitorIdCard;
			},
			submitBtnText() {
				if (this.isSubmitting) return '提交中...';
				if (!this.ticketInfo) return '加载中...';
				if (this.ticketInfo.status !== 1) return '已停售';
				if (this.ticketInfo.stock <= 0) return '已售罄';
				return '立即预订';
			},
			today() {
				const date = new Date();
				return date.toISOString().split('T')[0];
			},
			maxDate() {
				const date = new Date();
				date.setDate(date.getDate() + 30); // 最多可预约30天后的日期
				return date.toISOString().split('T')[0];
			}
		},
		onLoad(options) {
			if (options.id) {
				this.ticketId = options.id;
				this.getTicketDetail();
			} else {
				this.hasError = true;
				this.errorMsg = '门票ID不能为空';
			}

			// 获取用户ID - 改进登录检测逻辑
			this.getUserInfo();
		},
		methods: {
			// 获取用户信息
			getUserInfo() {
				// 检查多种存储位置获取用户信息
				const userInfo = uni.getStorageSync('userInfo');
				const token = uni.getStorageSync('token');

				console.log('存储的用户信息:', userInfo);
				console.log('存储的token:', token);

				if (userInfo && userInfo.id) {
					console.log('从userInfo获取到用户ID:', userInfo.id);
					this.userId = userInfo.id;
					return;
				}

				// 尝试从全局变量获取
				if (getApp().globalData && getApp().globalData.userInfo && getApp().globalData.userInfo.id) {
					console.log('从globalData获取到用户ID:', getApp().globalData.userInfo.id);
					this.userId = getApp().globalData.userInfo.id;
					return;
				}

				// 如果有token但没有用户信息，尝试从服务器获取
				if (token) {
					console.log('发现token，尝试从服务器获取用户信息');
					// 模拟用户ID - 临时解决方案
					this.userId = 1001; // 使用API中示例的用户ID
					console.log('使用默认用户ID:', this.userId);
					return;
				}

				console.log('未找到用户ID，用户未登录');
				// 如果未登录，提示用户
				uni.showModal({
					title: '提示',
					content: '请先登录后再预约门票',
					showCancel: false,
					success: () => {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}
				});
			},

			// 获取门票详情
			getTicketDetail() {
				this.isLoading = true;
				this.hasError = false;

				uni.request({
					url: `${api.baseUrl || 'http://192.168.194.9:8080'}/api/tickets/${this.ticketId}`,
					method: 'GET',
					header: {
						'Content-Type': 'application/json'
					},
					success: (res) => {
						if (res.data && res.data.code === 200 && res.data.data) {
							this.ticketInfo = res.data.data;
							// 设置最大购买数量
							this.maxQuantity = Math.min(
								this.ticketInfo.stock,
								this.ticketInfo.dailyLimit
							);
						} else {
							this.hasError = true;
							this.errorMsg = res.data?.msg || '获取门票详情失败';
							uni.showToast({
								title: this.errorMsg,
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('请求门票详情失败:', err);
						this.hasError = true;
						this.errorMsg = '网络请求失败，请检查网络连接';
						uni.showToast({
							title: this.errorMsg,
							icon: 'none'
						});
					},
					complete: () => {
						this.isLoading = false;
					}
				});
			},

			// 格式化价格
			formatPrice(price) {
				return parseFloat(price).toFixed(2);
			},

			// 减少数量
			decreaseQuantity() {
				if (this.quantity > 1) {
					this.quantity--;
				}
			},

			// 增加数量
			increaseQuantity() {
				if (this.quantity < this.maxQuantity) {
					this.quantity++;
				}
			},

			// 日期选择器变化处理
			onDateChange(e) {
				this.visitDate = e.detail.value;
			},

			// 提交订单
			async submitOrder() {
				if (!this.canSubmit || this.isSubmitting) return;

				// 检查用户是否登录
				if (!this.userId) {
					console.log('提交订单时检测到未登录');
					uni.showModal({
						title: '提示',
						content: '请先登录后再预约门票',
						showCancel: false,
						success: () => {
							uni.navigateTo({
								url: '/pages/login/login'
							});
						}
					});
					return;
				}

				console.log('准备提交订单，用户ID:', this.userId);

				// 表单验证
				if (!this.validateForm()) {
					return;
				}

				this.isSubmitting = true;

				try {
					// 构建预约数据
					const reserveData = {
						ticketId: parseInt(this.ticketId),
						userId: parseInt(this.userId),
						quantity: parseInt(this.quantity),
						visitDate: this.visitDate,
						visitorName: this.visitorName.trim(),
						visitorPhone: this.visitorPhone.trim(),
						visitorIdCard: this.visitorIdCard.trim()
					};

					// 打印请求参数，用于调试
					console.log('预约请求参数:', JSON.stringify(reserveData));

					// 调用预约接口
					const res = await api.user.reserveTicket(reserveData);
					console.log('预约接口返回结果:', res);

					if (res.code === 200 && res.data) {
						// 预约成功，跳转到支付页面
						uni.showToast({
							title: '预约成功',
							icon: 'success',
							duration: 2000
						});

						setTimeout(() => {
							uni.navigateTo({
								url: `/pages/index/booking/payment?orderNo=${res.data.orderNo}&totalPrice=${res.data.totalPrice}`,
								fail: (err) => {
									console.error('跳转支付页面失败:', err);
									uni.showToast({
										title: '跳转支付页面失败',
										icon: 'none'
									});
								}
							});
						}, 1500);
					} else {
						throw new Error(res.msg || '预约失败');
					}
				} catch (error) {
					console.error('预约失败:', error);
					uni.showToast({
						title: error.message || '预约失败，请重试',
						icon: 'none',
						duration: 3000
					});
				} finally {
					this.isSubmitting = false;
				}
			},

			// 表单验证
			validateForm() {
				if (!this.visitDate) {
					uni.showToast({
						title: '请选择参观日期',
						icon: 'none'
					});
					return false;
				}

				if (!this.visitorName) {
					uni.showToast({
						title: '请输入访客姓名',
						icon: 'none'
					});
					return false;
				}

				if (!/^1[3-9]\d{9}$/.test(this.visitorPhone)) {
					uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					});
					return false;
				}

				if (!/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(this.visitorIdCard)) {
					uni.showToast({
						title: '请输入正确的身份证号',
						icon: 'none'
					});
					return false;
				}

				return true;
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
			},

			// 跳转到我的门票页面
			goToMyTickets() {
				uni.navigateTo({
					url: '/pages/user/tickets'
				});
			}
		}
	}
</script>

<style lang="scss">
	.confirm-container {
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

		.right-action {
			position: absolute;
			right: 30rpx;
			top: 60rpx;
			display: flex;
			align-items: center;
			transition: all 0.3s ease;

			&:active {
				transform: scale(0.9);
			}

			.action-text {
				font-size: 28rpx;
				color: #ffffff;
				font-weight: 400;
				margin-right: 8rpx;
			}
		}
	}

	.loading-container,
	.error-container {
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

	.loading-text,
	.error-text {
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

	.ticket-detail {
		margin: 30rpx;

		.ticket-card {
			background: #ffffff;
			border-radius: 20rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			margin-bottom: 30rpx;
			overflow: hidden;
			position: relative;
			transition: all 0.3s ease;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 4rpx;
				background: linear-gradient(to right, #8B4513, #D2691E);
			}

			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			}

			.ticket-header {
				padding: 30rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
				position: relative;

				&::after {
					content: '';
					position: absolute;
					bottom: -1px;
					left: 0;
					right: 0;
					height: 1px;
					background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
				}

				.ticket-name {
					font-size: 36rpx;
					font-weight: 600;
					color: #333;
					position: relative;
					padding-left: 20rpx;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 4rpx;
						height: 32rpx;
						background: linear-gradient(to bottom, #8B4513, #D2691E);
						border-radius: 2rpx;
					}
				}

				.ticket-status {
					font-size: 24rpx;
					padding: 6rpx 16rpx;
					border-radius: 20rpx;
					transition: all 0.3s ease;

					&.status-active {
						background-color: rgba(46, 204, 113, 0.15);
						color: #2ecc71;
						box-shadow: 0 2rpx 8rpx rgba(46, 204, 113, 0.2);
					}

					&.status-inactive {
						background-color: rgba(192, 57, 43, 0.15);
						color: #c0392b;
						box-shadow: 0 2rpx 8rpx rgba(192, 57, 43, 0.2);
					}
				}
			}

			.ticket-content {
				padding: 30rpx;

				.ticket-desc {
					font-size: 28rpx;
					color: #666;
					line-height: 1.6;
					margin-bottom: 30rpx;
					position: relative;
					padding-left: 20rpx;

					&::before {
						content: '"';
						position: absolute;
						left: 0;
						top: -10rpx;
						font-size: 40rpx;
						color: rgba(139, 69, 19, 0.2);
						font-family: serif;
					}
				}

				.ticket-meta {
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					gap: 20rpx;

					.price {
						margin-right: 40rpx;
						display: flex;
						align-items: flex-end;
						position: relative;

						&::after {
							content: '';
							position: absolute;
							bottom: -4rpx;
							left: 0;
							right: 0;
							height: 2rpx;
							background: linear-gradient(to right, #e74c3c, transparent);
						}

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

					.stock,
					.limit {
						display: flex;
						align-items: center;
						font-size: 24rpx;
						color: #666;
						background: rgba(139, 69, 19, 0.05);
						padding: 8rpx 16rpx;
						border-radius: 20rpx;
						transition: all 0.3s ease;

						&:active {
							transform: scale(0.95);
						}

						uni-icons {
							margin-right: 6rpx;
						}

						text {
							margin-left: 6rpx;
						}
					}
				}
			}
		}

		.order-info,
		.usage-info {
			background: #ffffff;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			position: relative;
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 4rpx;
				background: linear-gradient(to right, #8B4513, #D2691E);
			}

			.section-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 30rpx;
				position: relative;
				padding-left: 20rpx;
				display: flex;
				align-items: center;

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

				&::after {
					content: '';
					position: absolute;
					bottom: -10rpx;
					left: 20rpx;
					right: 0;
					height: 2rpx;
					background: linear-gradient(to right, rgba(139, 69, 19, 0.2), transparent);
				}
			}

			.info-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				padding: 10rpx 0;
				transition: all 0.3s ease;

				&:last-child {
					margin-bottom: 0;
				}

				&:hover {
					transform: translateX(4rpx);
				}

				.label {
					font-size: 28rpx;
					color: #666;
					position: relative;
					padding-left: 16rpx;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 4rpx;
						height: 24rpx;
						background: #8B4513;
						border-radius: 2rpx;
					}
				}

				.quantity-control {
					display: flex;
					align-items: center;
					background: #f8f4eb;
					padding: 4rpx;
					border-radius: 30rpx;
					box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.05);

					.quantity-btn {
						width: 60rpx;
						height: 60rpx;
						background: #ffffff;
						border-radius: 30rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 36rpx;
						color: #8B4513;
						transition: all 0.3s ease;
						box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);

						&.disabled {
							opacity: 0.5;
							pointer-events: none;
							background: #f5f5f5;
						}

						&:active {
							transform: scale(0.9);
							box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
						}
					}

					.quantity-input {
						width: 80rpx;
						height: 60rpx;
						text-align: center;
						font-size: 32rpx;
						color: #333;
						margin: 0 20rpx;
						background: transparent;
					}
				}

				.total-price {
					display: flex;
					align-items: flex-end;
					position: relative;
					padding-bottom: 4rpx;

					&::after {
						content: '';
						position: absolute;
						bottom: 0;
						left: 0;
						right: 0;
						height: 2rpx;
						background: linear-gradient(to right, #e74c3c, transparent);
					}

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
			}

			.info-list {
				.info-item {
					display: flex;
					align-items: center;
					margin-bottom: 20rpx;
					padding: 16rpx;
					background: rgba(139, 69, 19, 0.03);
					border-radius: 12rpx;
					transition: all 0.3s ease;

					&:last-child {
						margin-bottom: 0;
					}

					&:hover {
						background: rgba(139, 69, 19, 0.05);
						transform: translateX(4rpx);
					}

					uni-icons {
						margin-right: 12rpx;
						opacity: 0.8;
					}

					text {
						font-size: 26rpx;
						color: #666;
					}
				}
			}
		}

		.visitor-info {
			background: #ffffff;
			border-radius: 20rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
			position: relative;
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 4rpx;
				background: linear-gradient(to right, #8B4513, #D2691E);
			}

			.form-item {
				display: flex;
				align-items: center;
				margin-bottom: 30rpx;
				padding: 10rpx 0;
				transition: all 0.3s ease;

				&:last-child {
					margin-bottom: 0;
				}

				&:hover {
					transform: translateX(4rpx);
				}

				.label {
					width: 160rpx;
					font-size: 28rpx;
					color: #666;
					position: relative;
					padding-left: 16rpx;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 4rpx;
						height: 24rpx;
						background: #8B4513;
						border-radius: 2rpx;
					}
				}

				.input-field {
					flex: 1;
					height: 80rpx;
					background: #f8f4eb;
					border-radius: 12rpx;
					padding: 0 24rpx;
					font-size: 28rpx;
					color: #333;
					transition: all 0.3s ease;

					&:focus {
						background: #fff;
						box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.1);
					}
				}

				.picker-value {
					flex: 1;
					height: 80rpx;
					background: #f8f4eb;
					border-radius: 12rpx;
					padding: 0 24rpx;
					font-size: 28rpx;
					color: #333;
					display: flex;
					align-items: center;
					transition: all 0.3s ease;

					&:active {
						background: #fff;
						box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.1);
					}
				}
			}
		}

		.bottom-bar {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			height: 120rpx;
			background: rgba(255, 255, 255, 0.85);
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 40rpx;
			box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
			z-index: 100;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 1px;
				background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
			}

			.price-info {
				display: flex;
				align-items: baseline;

				text {
					font-size: 28rpx;
					color: #666;
				}

				.total-price {
					display: flex;
					align-items: baseline;
					position: relative;
					padding-bottom: 4rpx;

					&::after {
						content: '';
						position: absolute;
						bottom: 0;
						left: 0;
						right: 0;
						height: 2rpx;
						background: linear-gradient(to right, #e74c3c, transparent);
					}

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
			}

			.submit-btn {
				background: linear-gradient(135deg, #8B4513, #D2691E);
				color: #fff;
				font-size: 32rpx;
				font-weight: 500;
				padding: 0 60rpx;
				height: 80rpx;
				line-height: 80rpx;
				border-radius: 40rpx;
				box-shadow: 0 6rpx 12rpx rgba(139, 69, 19, 0.25);
				transition: all 0.3s ease;
				position: relative;
				overflow: hidden;

				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
					opacity: 0;
					transition: opacity 0.3s ease;
				}

				&:active {
					transform: scale(0.98);
					box-shadow: 0 2rpx 6rpx rgba(139, 69, 19, 0.15);

					&::before {
						opacity: 1;
					}
				}

				&[disabled] {
					background: linear-gradient(135deg, #95a5a6, #7f8c8d);
					box-shadow: none;

					&::before {
						display: none;
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