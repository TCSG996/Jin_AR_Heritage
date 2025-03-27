<template>
	<view class="edit-post">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="left" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<view class="title">编辑帖子</view>
			<view class="right">
				<view class="submit-btn" :class="{ disabled: !canSubmit }" @tap="submitEdit">
					<text>发布</text>
				</view>
			</view>
		</view>

		<!-- 编辑表单 -->
		<view class="form">
			<!-- 标题输入 -->
			<view class="form-item">
				<input type="text" v-model="postForm.title" placeholder="请输入标题" maxlength="50" />
				<text class="count">{{ postForm.title.length }}/50</text>
			</view>

			<!-- 分类选择 -->
			<view class="form-item">
				<picker :range="categories" range-key="name" @change="onCategoryChange">
					<view class="picker">
						<text class="label">分类：</text>
						<text class="value">{{ selectedCategory ? selectedCategory.name : '请选择分类' }}</text>
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</picker>
			</view>

			<!-- 内容输入 -->
			<view class="form-item">
				<textarea v-model="postForm.content" placeholder="请输入正文内容" maxlength="1000" />
				<text class="count">{{ postForm.content.length }}/1000</text>
			</view>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';

	export default {
		data() {
			return {
				postId: null,
				categories: [],
				selectedCategory: null,
				postForm: {
					title: '',
					content: '',
					categoryId: null,
					userId: null
				},
				userInfo: null
			};
		},
		computed: {
			canSubmit() {
				return this.postForm.title.trim() &&
					this.postForm.content.trim() &&
					this.postForm.categoryId &&
					this.postForm.userId;
			}
		},
		onLoad(options) {
			if (options.id) {
				this.postId = options.id;
				this.loadPostDetail();
			}
			this.getUserInfo();
			this.loadCategories();
		},
		methods: {
			// 获取用户信息
			async getUserInfo() {
				try {
					const userInfoStr = uni.getStorageSync('userInfo');
					if (userInfoStr) {
						this.userInfo = JSON.parse(userInfoStr);
						this.postForm.userId = this.userInfo.id;
					} else {
						uni.showModal({
							title: '提示',
							content: '请先登录',
							showCancel: false,
							success: () => {
								uni.navigateBack();
							}
						});
					}
				} catch (e) {
					console.error('获取用户信息失败:', e);
				}
			},

			// 加载帖子详情
			async loadPostDetail() {
				uni.showLoading({
					title: '加载中...'
				});

				try {
					const res = await api.user.getForumPostDetail(this.postId);
					if (res && res.code === 200 && res.data) {
						const post = res.data;
						this.postForm = {
							title: post.title,
							content: post.content,
							categoryId: post.categoryId,
							userId: post.userId
						};
						// 设置选中的分类
						this.selectedCategory = this.categories.find(c => c.id === post.categoryId);
					}
				} catch (error) {
					console.error('获取帖子详情失败:', error);
					uni.showToast({
						title: '获取帖子失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 加载分类列表
			async loadCategories() {
				try {
					const res = await api.user.getForumCategories();
					if (res && res.code === 200 && res.data) {
						this.categories = res.data.filter(category => category.id !== 0);
					}
				} catch (error) {
					console.error('获取分类失败:', error);
					uni.showToast({
						title: '获取分类失败',
						icon: 'none'
					});
				}
			},

			// 分类选择改变
			onCategoryChange(e) {
				const index = e.detail.value;
				this.selectedCategory = this.categories[index];
				this.postForm.categoryId = this.selectedCategory.id;
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 提交编辑
			async submitEdit() {
				if (!this.canSubmit) return;

				uni.showLoading({
					title: '提交中...'
				});

				try {
					const res = await api.user.updateForumPost(this.postId, this.postForm);
					if (res && res.code === 200) {
						uni.showToast({
							title: '更新成功',
							icon: 'success'
						});
						// 返回详情页并刷新
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: res?.msg || '更新失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('更新帖子失败:', error);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			}
		}
	}
</script>

<style lang="scss">
	.edit-post {
		min-height: 100vh;
		background-color: #f5f6fa;

		.nav-bar {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 88rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			z-index: 100;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

			.left {
				padding: 20rpx;
			}

			.title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
			}

			.submit-btn {
				padding: 12rpx 30rpx;
				background: linear-gradient(135deg, #4a90e2, #57b6e9);
				border-radius: 30rpx;
				color: #fff;
				font-size: 28rpx;

				&.disabled {
					background: #ccc;
					opacity: 0.7;
				}

				&:active {
					opacity: 0.8;
				}
			}
		}

		.form {
			margin-top: 108rpx;
			padding: 30rpx;

			.form-item {
				background-color: #fff;
				border-radius: 16rpx;
				padding: 20rpx;
				margin-bottom: 20rpx;
				position: relative;

				input {
					font-size: 32rpx;
					color: #333;
					width: 100%;
				}

				textarea {
					width: 100%;
					height: 400rpx;
					font-size: 28rpx;
					color: #333;
					line-height: 1.6;
				}

				.count {
					position: absolute;
					right: 20rpx;
					bottom: 20rpx;
					font-size: 24rpx;
					color: #999;
				}

				.picker {
					display: flex;
					align-items: center;
					height: 80rpx;

					.label {
						font-size: 28rpx;
						color: #666;
						margin-right: 20rpx;
					}

					.value {
						flex: 1;
						font-size: 28rpx;
						color: #333;
					}
				}
			}
		}
	}
</style> 