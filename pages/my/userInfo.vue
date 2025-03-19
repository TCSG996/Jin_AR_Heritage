<template>
	<view class="userinfo">
		<view class="list">
			<!-- 基本信息卡片 -->
			<view class="card">
				<view class="one" @click="updateAvatar">
					<view class="text">头像</view>
					<view class="right">
						<image :src="userInfo && userInfo.avatar ? userInfo.avatar : '/static/logo.png'" mode="aspectFill"></image>
						<text class="arrow">›</text>
					</view>
				</view>
				<view class="one" @click="handleUpdate('nickname')">
					<view class="text">昵称</view>
					<view class="right">
						<view class="value">{{ userInfo && userInfo.nickname ? userInfo.nickname : '未设置' }}</view>
						<text class="arrow">›</text>
					</view>
				</view>
				<view class="one" @click="handleUpdate('gender')">
					<view class="text">性别</view>
					<view class="right">
						<view class="value">{{ userInfo && userInfo.gender ? userInfo.gender : '未设置' }}</view>
						<text class="arrow">›</text>
					</view>
				</view>
				<view class="one" @click="handleUpdate('region')">
					<view class="text">地区</view>
					<view class="right">
						<view class="value">{{ userInfo && userInfo.region ? userInfo.region : '未设置' }}</view>
						<text class="arrow">›</text>
					</view>
				</view>
			</view>

			<!-- 账号安全卡片 -->
			<view class="card">
				<view class="card-title">账号安全</view>
				<view class="one" @click="handleUpdate('phone')">
					<view class="text">手机号</view>
					<view class="right">
						<view class="value">{{ formatPhone(userInfo && userInfo.phone ? userInfo.phone : '') }}</view>
						<text class="arrow">›</text>
					</view>
				</view>
				<view class="one" @click="handleUpdate('password')">
					<view class="text">密码</view>
					<view class="right">
						<view class="value">******</view>
						<text class="arrow">›</text>
					</view>
				</view>
			</view>

			<!-- 退出登录按钮 -->
			<view class="logout-btn" @click="handleLogout">退出登录</view>
		</view>
	</view>
</template>

<script>
	import api from '@/api/user.js'
	
	export default {
		data() {
			return {
				userInfo: null,
				loading: false
			}
		},
		onShow() {
			// 先尝试从本地获取用户信息
			const localUserInfo = uni.getStorageSync('userInfo')
			if (localUserInfo) {
				try {
					this.userInfo = JSON.parse(localUserInfo)
				} catch (e) {
					console.error('解析本地用户信息失败:', e)
				}
			}
			// 然后从服务器获取最新信息
			this.getUserInfo()
		},
		methods: {
			// 获取用户信息
			getUserInfo() {
				if (this.loading) return
				this.loading = true

				const token = uni.getStorageSync('token')
				const localUserInfo = uni.getStorageSync('userInfo')
				console.log('当前token:', token)
				console.log('本地用户信息:', localUserInfo)
				
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
						console.log('从本地存储获取到的userId:', userId)
					} catch (e) {
						console.error('解析本地用户信息失败:', e)
					}
				}

				if (!userId) {
					console.error('未找到用户ID')
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

				// 打印请求前的状态
				console.log('开始请求用户信息...')
				
				api.getUserInfo(`?userId=${userId}`)
					.then(res => {
						console.log('getUserInfo响应:', res)
						this.loading = false
						
						if (!res) {
							throw new Error('响应数据为空')
						}
						
						if (res.code === 200 && res.data) {
							console.log('获取用户信息成功:', res.data)
							this.userInfo = res.data
							// 保存到本地存储
							uni.setStorageSync('userInfo', JSON.stringify(res.data))
						} else if (res.code === 401) {
							console.log('token过期，需要重新登录')
							// token 过期
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
							console.error('获取用户信息失败:', res)
							throw new Error(res.msg || '获取用户信息失败')
						}
					})
					.catch(e => {
						console.error('捕获到错误:', e)
						this.loading = false
						
						// 检查是否是网络错误
						if (e.errMsg && e.errMsg.includes('request:fail')) {
							console.error('网络请求失败:', e.errMsg)
							uni.showToast({
								title: '网络连接失败，请检查网络',
								icon: 'none',
								duration: 2000
							})
							return
						}
						
						// 尝试使用本地缓存数据
						const localUserInfo = uni.getStorageSync('userInfo')
						console.log('尝试读取本地缓存:', localUserInfo)
						
						if (localUserInfo) {
							try {
								const parsedUserInfo = JSON.parse(localUserInfo)
								console.log('解析本地用户信息成功:', parsedUserInfo)
								this.userInfo = parsedUserInfo
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
							console.log('没有本地缓存数据')
							uni.showToast({
								title: e.message || '获取用户信息失败',
								icon: 'none',
								duration: 2000
							})
						}
					})
			},
			
			// 格式化手机号
			formatPhone(phone) {
				if (!phone) return '未绑定'
				return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
			},
			
			// 更新头像
			updateAvatar() {
				const token = uni.getStorageSync('token')
				if (!token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				// 显示功能开发中的提示
				uni.showToast({
					title: '功能正在开发，敬请期待',
					icon: 'none',
					duration: 2000
				})
			},
			
			// 处理信息更新
			handleUpdate(type) {
				const token = uni.getStorageSync('token')
				if (!token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				// 显示功能开发中的提示
				uni.showToast({
					title: '功能正在开发，敬请期待',
					icon: 'none',
					duration: 2000
				})
			},
			
			// 更新用户数据
			updateUserData(type, value) {
				uni.showLoading({
					title: '更新中...'
				})

				const data = {
					[type]: value
				}
				
				api.updateUserInfo(data).then(res => {
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
				}).catch(e => {
					uni.hideLoading()
					console.error('更新信息失败:', e)
					uni.showToast({
						title: '更新失败',
						icon: 'none'
					})
				})
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
			
			// 退出登录
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '退出中...'
							})

							api.logout().then(res => {
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
							}).catch(e => {
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
							})
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.userinfo {
		background-color: #f5f6fa;
		min-height: 100vh;
		padding-bottom: 40rpx;

		.list {
			padding: 30rpx;

			.card {
				background: #FFFFFF;
				border-radius: 16rpx;
				margin-bottom: 30rpx;
				overflow: hidden;
				box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

				.card-title {
					font-size: 28rpx;
					color: #999;
					padding: 24rpx 30rpx 12rpx;
					font-weight: 500;
				}

				.one {
					display: flex;
					height: 110rpx;
					justify-content: space-between;
					align-items: center;
					padding: 0 30rpx;
					position: relative;

					&::after {
						content: '';
						position: absolute;
						left: 30rpx;
						right: 30rpx;
						bottom: 0;
						height: 1rpx;
						background: #f5f5f5;
						transform: scaleY(0.5);
					}

					&:last-child::after {
						display: none;
					}

					&:active {
						background-color: #f9f9f9;
					}

					.text {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}

					.right {
						display: flex;
						align-items: center;

						image {
							width: 88rpx;
							height: 88rpx;
							border-radius: 50%;
							margin-right: 16rpx;
							background: #f5f5f5;
						}

						.value {
							font-size: 28rpx;
							color: #666;
							margin-right: 12rpx;
						}

						.arrow {
							font-size: 32rpx;
							color: #ccc;
							font-weight: 300;
						}
					}
				}
			}

			.logout-btn {
				margin: 60rpx auto 0;
				width: 90%;
				height: 90rpx;
				line-height: 90rpx;
				text-align: center;
				background: #FFFFFF;
				border-radius: 45rpx;
				color: #ff4d4f;
				font-size: 32rpx;
				font-weight: 500;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

				&:active {
					transform: scale(0.98);
					background: #fafafa;
				}
			}
		}
	}
</style>