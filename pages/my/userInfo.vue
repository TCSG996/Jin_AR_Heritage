<template>
	<view class="userinfo">
		<view class="list">
			<!-- 基本信息卡片 -->
			<view class="card">
				<view class="one" @click="updateAvatar">
					<view class="text">头像</view>
					<view class="right">
						<image :src="userInfo && userInfo.avatar ? getAvatarUrl(userInfo.avatar) : '/static/logo.png'" 
							mode="aspectFill" @click.stop="previewAvatar"></image>
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
				<view class="one">
					<view class="text">账号</view>
					<view class="right">
						<view class="value account-value">{{ userInfo && userInfo.username ? userInfo.username : (userInfo && userInfo.account ? userInfo.account : '未设置') }}</view>
						<view class="readonly-tag">不可修改</view>
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

				if (!this.userInfo || !this.userInfo.id) {
					uni.showToast({
						title: '用户信息获取失败',
						icon: 'none'
					})
					return
				}

				// 打开操作菜单
				uni.showActionSheet({
					itemList: ['拍照', '从相册选择'],
					success: (res) => {
						// res.tapIndex: 0-拍照，1-相册选择
						if (res.tapIndex === 0) {
							// 使用相机拍照
							this.chooseImage('camera')
						} else if (res.tapIndex === 1) {
							// 从相册选择
							this.chooseImage('album')
						}
					}
				})
			},
			
			// 选择图片
			chooseImage(sourceType) {
				uni.chooseImage({
					count: 1, // 最多可以选择的图片张数
					sizeType: ['compressed'], // 压缩图
					sourceType: sourceType === 'camera' ? ['camera'] : ['album'], // 相册或相机
					success: (res) => {
						// 获取图片临时路径
						const tempFilePath = res.tempFilePaths[0]
						
						// 显示上传中提示
						uni.showLoading({
							title: '上传中...',
							mask: true
						})
						
						// 上传图片
						this.uploadAvatarImage(tempFilePath)
					},
					fail: (err) => {
						console.error('选择图片失败:', err)
						if (err.errMsg !== 'chooseImage:fail cancel') {
							uni.showToast({
								title: '选择图片失败',
								icon: 'none'
							})
						}
					}
				})
			},
			
			// 上传头像图片
			uploadAvatarImage(filePath) {
				const userId = this.userInfo.id
				
				// 调用上传API
				api.uploadAvatar(userId, filePath)
					.then(res => {
						uni.hideLoading()
						
						if (res.code === 200) {
							// 上传成功，更新用户头像
							console.log('头像上传成功:', res.data)
							
							// 更新本地用户信息
							this.userInfo.avatar = res.data
							
							// 更新本地存储
							uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
							
							uni.showToast({
								title: '头像更新成功',
								icon: 'success'
							})
						} else if (res.code === 401) {
							// token 过期处理
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
								title: res.msg || '上传失败',
								icon: 'none'
							})
						}
					})
					.catch(err => {
						uni.hideLoading()
						console.error('上传头像失败:', err)
						uni.showToast({
							title: '上传头像失败，请重试',
							icon: 'none'
						})
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
				
				if (!this.userInfo || !this.userInfo.id) {
					uni.showToast({
						title: '用户信息获取失败',
						icon: 'none'
					})
					return
				}
				
				// 根据不同类型的信息更新，处理不同的逻辑
				switch (type) {
					case 'nickname':
						// 修改昵称
						this.updateNickname()
						break
					case 'gender':
						// 选择性别
						this.selectGender()
						break
					case 'region':
						// 选择地区
						this.selectRegion()
						break
					case 'phone':
						// 修改手机号
						this.updatePhone()
						break
					case 'password':
						// 修改密码
						this.updatePassword()
						break
					default:
						uni.showToast({
							title: '功能正在开发，敬请期待',
							icon: 'none',
							duration: 2000
						})
				}
			},
			
			// 更新昵称
			updateNickname() {
				// 显示输入框让用户输入新昵称
				this.showInputDialog('请输入新昵称').then(nickname => {
					if (nickname) {
						// 验证昵称长度
						if (nickname.length < 2 || nickname.length > 20) {
							uni.showToast({
								title: '昵称长度应为2-20个字符',
								icon: 'none'
							})
							return
						}
						
						// 显示加载中
						uni.showLoading({
							title: '更新中...'
						})
						
						// 调用更新API
						const userId = this.userInfo.id
						const data = { nickname }
						
						api.updateUserProfile(userId, data).then(res => {
							uni.hideLoading()
							
							if (res.code === 200) {
								// 更新成功
								// 更新本地用户信息
								this.userInfo.nickname = nickname
								
								// 更新本地存储
								uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
								
								uni.showToast({
									title: '昵称更新成功',
									icon: 'success'
								})
							} else if (res.code === 401) {
								// token过期
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
						}).catch(err => {
							uni.hideLoading()
							console.error('更新昵称失败:', err)
							uni.showToast({
								title: '更新失败，请重试',
								icon: 'none'
							})
						})
					}
				})
			},
			
			// 选择性别
			selectGender() {
				uni.showActionSheet({
					itemList: ['男', '女', '保密'],
					success: (res) => {
						// 用户选择了性别
						const genderMap = {
							0: '男',
							1: '女',
							2: '保密'
						}
						const gender = genderMap[res.tapIndex]
						
						// 显示加载中
						uni.showLoading({
							title: '更新中...'
						})
						
						// 调用更新API
						const userId = this.userInfo.id
						const data = { gender }
						
						api.updateUserProfile(userId, data).then(res => {
							uni.hideLoading()
							
							if (res.code === 200) {
								// 更新成功
								// 更新本地用户信息
								this.userInfo.gender = gender
								
								// 更新本地存储
								uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
								
								uni.showToast({
									title: '性别更新成功',
									icon: 'success'
								})
							} else if (res.code === 401) {
								// token过期处理
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
						}).catch(err => {
							uni.hideLoading()
							console.error('更新性别失败:', err)
							uni.showToast({
								title: '更新失败，请重试',
								icon: 'none'
							})
						})
					}
				})
			},
			
			// 选择地区
			selectRegion() {
				uni.showToast({
					title: '地区选择功能开发中',
					icon: 'none',
					duration: 2000
				})
			},
			
			// 更新手机号
			updatePhone() {
				uni.showToast({
					title: '手机号更新功能开发中',
					icon: 'none',
					duration: 2000
				})
			},
			
			// 更新密码
			updatePassword() {
				uni.showToast({
					title: '密码更新功能开发中',
					icon: 'none',
					duration: 2000
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
			},
			
			// 预览头像
			previewAvatar() {
				// 只有当有头像时才预览
				if (this.userInfo && this.userInfo.avatar) {
					const avatarUrl = this.getAvatarUrl(this.userInfo.avatar);
					uni.previewImage({
						urls: [avatarUrl],
						current: avatarUrl
					});
				}
			},
			
			// 获取头像URL
			getAvatarUrl(avatar) {
				// 如果是完整的URL，直接返回
				if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
					return avatar;
				}
				
				// 如果是相对路径，拼接基础URL（根据实际情况调整）
				if (avatar && avatar.startsWith('/')) {
					// 假设API baseURL为 http://your-api-domain.com
					const baseApiUrl = 'http://192.168.194.9:8080'; // 替换为实际的API基础URL
					return baseApiUrl + avatar;
				}
				
				// 返回默认头像
				return '/static/logo.png';
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
							
							&.account-value {
								color: #4a90e2;
								font-weight: 500;
							}
						}

						.readonly-tag {
							font-size: 20rpx;
							color: #999;
							background-color: #f5f5f5;
							padding: 2rpx 8rpx;
							border-radius: 4rpx;
							margin-right: 8rpx;
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