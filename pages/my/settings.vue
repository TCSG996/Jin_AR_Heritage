<template>
	<view class="settings-container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">设置</text>
		</view>

		<!-- 设置列表 -->
		<view class="settings-list">
			<!-- 账号安全 -->
			<view class="settings-group">
				<view class="group-title">账号安全</view>
				<view class="settings-item" @tap="handleUpdate('password')">
					<text class="item-label">修改密码</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
				<view class="settings-item" @tap="handleUpdate('phone')">
					<text class="item-label">手机绑定</text>
					<view class="item-value">
						<text>{{ formatPhone(userInfo.phone) }}</text>
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 通知设置 -->
			<view class="settings-group">
				<view class="group-title">通知设置</view>
				<view class="settings-item">
					<text class="item-label">订单通知</text>
					<switch :checked="notificationSettings.order" @change="toggleNotification('order')" color="#ff6b6b" />
				</view>
				<view class="settings-item">
					<text class="item-label">系统通知</text>
					<switch :checked="notificationSettings.system" @change="toggleNotification('system')" color="#ff6b6b" />
				</view>
			</view>

			<!-- 其他设置 -->
			<view class="settings-group">
				<view class="group-title">其他设置</view>
				<view class="settings-item" @tap="clearCache">
					<text class="item-label">清除缓存</text>
					<view class="item-value">
						<text>{{ cacheSize }}</text>
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</view>
				<view class="settings-item" @tap="navigateTo('/pages/my/about')">
					<text class="item-label">关于我们</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-btn" @tap="handleLogout">
			退出登录
		</view>
	</view>
</template>

<script>
	import api from '@/api/user.js'
	
	export default {
		data() {
			return {
				statusBarHeight: 0,
				userInfo: {
					phone: '' // 初始化为空字符串
				},
				notificationSettings: {
					order: true,
					system: true
				},
				cacheSize: '2.5MB', // 模拟数据
				loading: false
			}
		},
		onShow() {
			// 每次显示页面时获取最新的用户信息
			this.getUserInfo()
		},
		onLoad() {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight
			
			// 获取用户信息
			this.getUserInfo()
		},
		methods: {
			// 获取用户信息
			async getUserInfo() {
				if (this.loading) return
				this.loading = true

				const token = uni.getStorageSync('token')
				const localUserInfo = uni.getStorageSync('userInfo')
				
				if (!token) {
					this.loading = false
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/login/login'
						})
					}, 1500)
					return
				}

				let userId = null
				if (localUserInfo) {
					try {
						const userInfoObj = JSON.parse(localUserInfo)
						userId = userInfoObj.id || userInfoObj.userId
					} catch (e) {
						console.error('解析本地用户信息失败:', e)
					}
				}

				if (!userId) {
					this.loading = false
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					})
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/login/login'
						})
					}, 1500)
					return
				}

				try {
					const res = await api.getUserInfo(`?userId=${userId}`)
					this.loading = false
					
					if (res.code === 200 && res.data) {
						this.userInfo = res.data
						// 保存到本地存储
						uni.setStorageSync('userInfo', JSON.stringify(res.data))
					} else if (res.code === 401) {
						uni.removeStorageSync('token')
						uni.removeStorageSync('userInfo')
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none'
						})
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/login'
							})
						}, 1500)
					} else {
						throw new Error(res.msg || '获取用户信息失败')
					}
				} catch (e) {
					this.loading = false
					console.error('获取用户信息失败:', e)
					
					// 尝试使用本地缓存数据
					const localUserInfo = uni.getStorageSync('userInfo')
					if (localUserInfo) {
						try {
							this.userInfo = JSON.parse(localUserInfo)
							uni.showToast({
								title: '使用本地缓存数据',
								icon: 'none'
							})
						} catch (parseError) {
							console.error('解析本地用户信息失败:', parseError)
							uni.showToast({
								title: '获取用户信息失败',
								icon: 'none'
							})
						}
					} else {
						uni.showToast({
							title: e.message || '获取用户信息失败',
							icon: 'none'
						})
					}
				}
			},
			
			// 格式化手机号
			formatPhone(phone) {
				if (!phone) return '未绑定'
				return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 处理信息更新
			async handleUpdate(type) {
				const token = uni.getStorageSync('token')
				if (!token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				if (type === 'phone') {
					const phone = await this.showInputDialog('请输入手机号')
					if (phone) {
						// 验证手机号格式
						if (!/^1[3-9]\d{9}$/.test(phone)) {
							uni.showToast({
								title: '请输入正确的手机号',
								icon: 'none'
							})
							return
						}
						this.updateUserData('phone', phone)
					}
				} else if (type === 'password') {
					uni.showToast({
						title: '密码修改功能开发中',
						icon: 'none'
					})
				}
			},
			
			// 显示输入框
			showInputDialog(title) {
				return new Promise((resolve) => {
					uni.showModal({
						title,
						editable: true,
						placeholderText: '请输入',
						success: (res) => {
							if (res.confirm && res.content) {
								resolve(res.content.trim())
							} else {
								resolve('')
							}
						},
						fail: () => {
							resolve('')
						}
					})
				})
			},
			
			// 更新用户数据
			async updateUserData(type, value) {
				uni.showLoading({
					title: '更新中...'
				})

				try {
					const res = await api.updateUserInfo({ [type]: value })
					uni.hideLoading()
					
					if (res.code === 200) {
						uni.showToast({
							title: '更新成功',
							icon: 'success'
						})
						this.getUserInfo()
					} else if (res.code === 401) {
						uni.removeStorageSync('token')
						uni.removeStorageSync('userInfo')
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none'
						})
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/login'
							})
						}, 1500)
					} else {
						uni.showToast({
							title: res.msg || '更新失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.hideLoading()
					console.error('更新信息失败:', e)
					uni.showToast({
						title: '更新失败',
						icon: 'none'
					})
				}
			},
			
			// 切换通知设置
			toggleNotification(type) {
				this.notificationSettings[type] = !this.notificationSettings[type]
				// 这里应该调用接口保存设置
				uni.showToast({
					title: '设置已保存',
					icon: 'success'
				})
			},
			
			// 清除缓存
			clearCache() {
				uni.showModal({
					title: '提示',
					content: '确定要清除缓存吗？',
					success: (res) => {
						if (res.confirm) {
							// 这里应该调用接口清除缓存
							this.cacheSize = '0B'
							uni.showToast({
								title: '清除成功',
								icon: 'success'
							})
						}
					}
				})
			},
			
			// 页面跳转
			navigateTo(url) {
				uni.showToast({
					title: '功能开发中',
					icon: 'none'
				})
			},
			
			// 退出登录
			async handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '退出中...'
							})

							try {
								const res = await api.logout()
								uni.hideLoading()
								
								if (res.code === 200) {
									// 清除本地存储
									uni.removeStorageSync('token')
									uni.removeStorageSync('userInfo')
									
									uni.showToast({
										title: '退出成功',
										icon: 'success'
									})
									
									// 延迟跳转
									setTimeout(() => {
										uni.reLaunch({
											url: '/pages/login/login'
										})
									}, 1500)
								} else {
									// 即使接口失败也清除本地存储
									uni.removeStorageSync('token')
									uni.removeStorageSync('userInfo')
									
									uni.showToast({
										title: '已退出登录',
										icon: 'success'
									})
									
									setTimeout(() => {
										uni.reLaunch({
											url: '/pages/login/login'
										})
									}, 1500)
								}
							} catch (e) {
								uni.hideLoading()
								console.error('退出登录失败:', e)
								// 发生错误也清除本地存储
								uni.removeStorageSync('token')
								uni.removeStorageSync('userInfo')
								
								uni.showToast({
									title: '已退出登录',
									icon: 'success'
								})
								
								setTimeout(() => {
									uni.reLaunch({
										url: '/pages/login/login'
									})
								}, 1500)
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.settings-container {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-top: calc(var(--status-bar-height) + 88rpx);
		padding-bottom: 40rpx;
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

	.settings-list {
		padding: 20rpx;
	}

	.settings-group {
		background: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		
		.group-title {
			font-size: 28rpx;
			color: #999;
			padding: 20rpx 30rpx;
		}
	}

	.settings-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		background: #fff;
		border-bottom: 2rpx solid #f5f5f5;
		
		&:last-child {
			border-bottom: none;
		}
		
		.item-label {
			font-size: 30rpx;
			color: #333;
		}
		
		.item-value {
			display: flex;
			align-items: center;
			
			text {
				font-size: 28rpx;
				color: #999;
				margin-right: 10rpx;
			}
		}
	}

	.logout-btn {
		margin: 60rpx 30rpx;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background: #ff6b6b;
		color: #fff;
		font-size: 32rpx;
		border-radius: 44rpx;
		
		&:active {
			opacity: 0.8;
		}
	}
</style> 