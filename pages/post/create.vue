<template>
	<view class="create-post">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="left" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<view class="title">发布帖子</view>
			<view class="right" @tap="submitPost">
				<text :class="['submit-btn', canSubmit ? '' : 'disabled']">发布</text>
			</view>
		</view>

		<!-- 帖子内容 -->
		<view class="post-content">
			<!-- 标题输入 -->
			<view class="input-group">
				<input type="text" v-model="postData.title" placeholder="请输入标题" maxlength="50" />
				<text class="word-count">{{ postData.title.length }}/50</text>
			</view>

			<!-- 分类选择 -->
			<view class="input-group">
				<picker @change="onCategoryChange" :value="categoryIndex" :range="categories" range-key="name">
					<view class="picker">
						<text>{{ selectedCategory.name || '请选择分类' }}</text>
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</picker>
			</view>

			<!-- 内容输入 -->
			<view class="input-group content">
				<textarea v-model="postData.content" placeholder="分享你的想法..." maxlength="1000" />
				<text class="word-count">{{ postData.content.length }}/1000</text>
			</view>

			<!-- 图片上传 -->
			<view class="upload-section">
				<view class="upload-title">添加图片（选填）</view>
				<view class="image-list">
					<view class="image-item" v-for="(img, index) in postData.images" :key="index">
						<image :src="img" mode="aspectFill"></image>
						<view class="delete-btn" @tap="deleteImage(index)">
							<uni-icons type="close" size="16" color="#fff"></uni-icons>
						</view>
					</view>
					<view class="upload-btn" @tap="chooseImage" v-if="postData.images.length < 9">
						<uni-icons type="camera-filled" size="24" color="#999"></uni-icons>
						<text>上传图片</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';

	export default {
		data() {
			return {
				postData: {
					title: '',
					content: '',
					categoryId: null,
					images: []
				},
				categories: [],
				categoryIndex: 0,
				selectedCategory: {},
				userInfo: null
			};
		},
		computed: {
			canSubmit() {
				return this.postData.title.trim() && 
					   this.postData.content.trim() && 
					   this.postData.categoryId !== null;
			}
		},
		onLoad() {
			// 获取用户信息
			this.getUserInfo();
			// 获取分类列表
			this.loadCategories();
		},
		methods: {
			// 获取用户信息
			async getUserInfo() {
				try {
					const userInfoStr = uni.getStorageSync('userInfo');
					if (userInfoStr) {
						this.userInfo = JSON.parse(userInfoStr);
					}
				} catch (e) {
					console.error('获取用户信息失败:', e);
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
				}
			},
			// 获取分类列表
			async loadCategories() {
				try {
					const res = await api.user.getForumCategories();
					if (res && res.code === 200 && res.data) {
						this.categories = res.data;
						if (this.categories.length > 0) {
							this.selectedCategory = this.categories[0];
							this.postData.categoryId = this.categories[0].id;
						}
					}
				} catch (error) {
					console.error('获取分类列表失败:', error);
					uni.showToast({
						title: '获取分类失败',
						icon: 'none'
					});
				}
			},
			// 分类选择改变
			onCategoryChange(e) {
				this.categoryIndex = e.detail.value;
				this.selectedCategory = this.categories[this.categoryIndex];
				this.postData.categoryId = this.selectedCategory.id;
			},
			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 9 - this.postData.images.length,
					success: (res) => {
						// 这里应该先上传图片到服务器，获取URL后再添加到images数组
						// 暂时直接使用本地路径
						this.postData.images = [...this.postData.images, ...res.tempFilePaths];
					}
				});
			},
			// 删除图片
			deleteImage(index) {
				this.postData.images.splice(index, 1);
			},
			// 提交帖子
			async submitPost() {
				if (!this.canSubmit) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					});
					return;
				}

				if (!this.userInfo) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '发布中...'
				});

				try {
					const postDataWithUser = {
						...this.postData,
						userId: this.userInfo.id,
						userName: this.userInfo.nickname || this.userInfo.username,
						userAvatar: this.userInfo.avatar || '/static/logo.png'
					};

					const res = await api.user.createForumPost(postDataWithUser);

					if (res && res.code === 200) {
						uni.hideLoading();
						uni.showToast({
							title: '发布成功',
							icon: 'success'
						});
						// 返回上一页并刷新
						setTimeout(() => {
							const pages = getCurrentPages();
							const prevPage = pages[pages.length - 2];
							if (prevPage) {
								prevPage.$vm.loadPosts();
							}
							uni.navigateBack();
						}, 1500);
					} else {
						uni.hideLoading();
						uni.showToast({
							title: res?.msg || '发布失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('发布帖子失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '发布失败',
						icon: 'none'
					});
				}
			},
			// 返回上一页
			goBack() {
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss">
	.create-post {
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

			.right {
				padding: 20rpx;

				.submit-btn {
					font-size: 28rpx;
					color: #4a90e2;
					font-weight: 500;

					&.disabled {
						color: #999;
					}
				}
			}
		}

		.post-content {
			margin-top: 108rpx;
			padding: 30rpx;

			.input-group {
				background-color: #fff;
				border-radius: 16rpx;
				padding: 24rpx;
				margin-bottom: 20rpx;
				position: relative;

				input {
					font-size: 32rpx;
					color: #333;
				}

				.picker {
					display: flex;
					align-items: center;
					justify-content: space-between;
					font-size: 32rpx;
					color: #333;
				}

				&.content {
					height: 400rpx;

					textarea {
						width: 100%;
						height: 100%;
						font-size: 28rpx;
						color: #333;
						line-height: 1.6;
					}
				}

				.word-count {
					position: absolute;
					right: 24rpx;
					bottom: 24rpx;
					font-size: 24rpx;
					color: #999;
				}
			}

			.upload-section {
				background-color: #fff;
				border-radius: 16rpx;
				padding: 24rpx;

				.upload-title {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 20rpx;
				}

				.image-list {
					display: flex;
					flex-wrap: wrap;
					gap: 20rpx;

					.image-item {
						width: 200rpx;
						height: 200rpx;
						position: relative;
						border-radius: 12rpx;
						overflow: hidden;

						image {
							width: 100%;
							height: 100%;
							object-fit: cover;
						}

						.delete-btn {
							position: absolute;
							top: 10rpx;
							right: 10rpx;
							width: 40rpx;
							height: 40rpx;
							background-color: rgba(0, 0, 0, 0.5);
							border-radius: 50%;
							display: flex;
							align-items: center;
							justify-content: center;
						}
					}

					.upload-btn {
						width: 200rpx;
						height: 200rpx;
						background-color: #f5f6fa;
						border-radius: 12rpx;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						border: 2rpx dashed #ddd;

						text {
							font-size: 24rpx;
							color: #999;
							margin-top: 10rpx;
						}
					}
				}
			}
		}
	}
</style> 