<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
			</view>
			<text class="title">{{ buildingInfo.name || '3D模型观览' }}</text>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-animation">
				<view class="cube">
					<view class="face front"></view>
					<view class="face back"></view>
					<view class="face top"></view>
					<view class="face bottom"></view>
					<view class="face left"></view>
					<view class="face right"></view>
				</view>
			</view>
			<view class="loading-text">正在加载3D模型</view>
			<view class="loading-tips">加载时间取决于模型复杂度和网络状况</view>
		</view>

		<!-- 3D模型展示区域 -->
		<view class="model-container" v-else>
			<!-- 这里将来会集成WebGL/Three.js等3D渲染库 -->
			<image class="model-placeholder" :src="modelUrl" mode="aspectFit"></image>

			<!-- 操作控件 -->
			<view class="controls">
				<view class="control-btn zoom-in" @tap="zoomIn">
					<uni-icons type="plus" size="18" color="#333333"></uni-icons>
				</view>
				<view class="control-btn zoom-out" @tap="zoomOut">
					<uni-icons type="minus" size="18" color="#333333"></uni-icons>
				</view>
				<view class="control-btn rotate" @tap="toggleAutoRotate">
					<uni-icons type="refresh" size="18" :color="autoRotate ? '#007AFF' : '#333333'"></uni-icons>
				</view>
				<view class="control-btn reset" @tap="resetView">
					<uni-icons type="undo" size="18" color="#333333"></uni-icons>
				</view>
			</view>

			<!-- 模型信息面板 -->
			<view class="info-panel" :class="{ active: showInfo }">
				<view class="info-header" @tap="toggleInfoPanel">
					<text class="info-title">模型信息</text>
					<text class="toggle-icon">{{ showInfo ? '收起' : '展开' }}</text>
				</view>
				<view class="info-content" v-if="showInfo">
					<view class="info-item">
						<text class="info-label">模型名称</text>
						<text class="info-value">{{ buildingInfo.name }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">模型类型</text>
						<text class="info-value">建筑3D模型</text>
					</view>
					<view class="info-item">
						<text class="info-label">细节等级</text>
						<text class="info-value">高精度</text>
					</view>
					<view class="info-item">
						<text class="info-label">建造年代</text>
						<text class="info-value">{{ buildingInfo.buildYear || '未知' }}</text>
					</view>
					<view class="info-desc">{{ buildingInfo.description || '暂无模型描述信息' }}</view>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="action-bar">
			<button class="action-btn download" @tap="downloadModel">
				<uni-icons type="download" size="16" color="#007AFF"></uni-icons>
				<text>下载模型</text>
			</button>
			<button class="action-btn share" @tap="shareModel">
				<uni-icons type="redo" size="16" color="#4CD964"></uni-icons>
				<text>分享</text>
			</button>
			<button class="action-btn ar" @tap="viewInAR">
				<uni-icons type="camera" size="16" color="#FFFFFF"></uni-icons>
				<text>AR查看</text>
			</button>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';

	export default {
		data() {
			return {
				statusBarHeight: 0,
				id: null,
				modelUrl: '',
				isLoading: true,
				showInfo: false,
				autoRotate: true,
				scale: 1.0,
				baseURL: 'http://192.168.194.9:8080',
				buildingInfo: {
					name: '建筑模型',
					description: '',
					buildYear: ''
				}
			}
		},
		onLoad(options) {
			// 获取状态栏高度
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;

			// 获取建筑ID和模型URL
			if (options.id) {
				this.id = parseInt(options.id);

				// 如果有传递modelUrl参数，直接使用
				if (options.modelUrl) {
					this.modelUrl = decodeURIComponent(options.modelUrl);
					// 如果模型URL不是以http开头，需要添加baseURL
					if (this.modelUrl && !this.modelUrl.startsWith('http')) {
						this.modelUrl = this.baseURL + this.modelUrl;
					}
				}

				// 加载建筑详细信息
				this.loadBuildingInfo();
			} else {
				uni.showToast({
					title: '参数错误',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}

			// 模拟加载过程
			setTimeout(() => {
				this.isLoading = false;

				// 如果没有设置模型URL，使用默认图片
				if (!this.modelUrl) {
					this.modelUrl = '/static/spot-default.png';
				}
			}, 2000);
		},
		methods: {
			async loadBuildingInfo() {
				try {
					const res = await api.user.getBuildingDetail(this.id);

					if (res.code === 200 && res.data) {
						this.buildingInfo = res.data;

						// 如果没有获取到modelUrl但API返回了arModelUrl
						if (!this.modelUrl && res.data.arModelUrl) {
							this.modelUrl = this.getProcessedImageUrl(res.data.arModelUrl);
						}
					} else {
						uni.showToast({
							title: '获取建筑信息失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载建筑信息失败:', error);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				}
			},

			// 处理图片URL
			getProcessedImageUrl(imageUrl) {
				if (!imageUrl) {
					return '/static/spot-default.png';
				}

				if (imageUrl.startsWith('http')) {
					return imageUrl;
				}

				return `${this.baseURL}${imageUrl}`;
			},

			goBack() {
				uni.navigateBack();
			},

			toggleInfoPanel() {
				this.showInfo = !this.showInfo;
			},

			zoomIn() {
				this.scale = Math.min(2.0, this.scale + 0.1);
				this.updateModel();
				uni.showToast({
					title: '放大模型',
					icon: 'none'
				});
			},

			zoomOut() {
				this.scale = Math.max(0.5, this.scale - 0.1);
				this.updateModel();
				uni.showToast({
					title: '缩小模型',
					icon: 'none'
				});
			},

			toggleAutoRotate() {
				this.autoRotate = !this.autoRotate;
				this.updateModel();
				uni.showToast({
					title: this.autoRotate ? '开启自动旋转' : '关闭自动旋转',
					icon: 'none'
				});
			},

			resetView() {
				this.scale = 1.0;
				this.autoRotate = true;
				this.updateModel();
				uni.showToast({
					title: '重置视图',
					icon: 'none'
				});
			},

			updateModel() {
				// 未来在这里更新Three.js模型的参数
				console.log('缩放比例:', this.scale, '自动旋转:', this.autoRotate);
			},

			downloadModel() {
				uni.showModal({
					title: '下载模型',
					content: '3D模型文件较大，建议在WIFI环境下载，确认继续吗？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '准备下载...'
							});

							// 模拟下载过程
							setTimeout(() => {
								uni.hideLoading();
								uni.showToast({
									title: '下载完成',
									icon: 'success'
								});
							}, 2000);
						}
					}
				});
			},

			shareModel() {
				uni.showActionSheet({
					itemList: ['分享给好友', '分享到朋友圈', '复制链接'],
					success: (res) => {
						uni.showToast({
							title: '分享功能开发中',
							icon: 'none'
						});
					}
				});
			},

			viewInAR() {
				uni.showModal({
					title: 'AR查看',
					content: '即将打开AR模式查看建筑模型，请确保已授权相机权限',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: `/pages/AR/AR?spotId=${this.id}&spotName=${encodeURIComponent(this.buildingInfo.name)}`
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f8f8f8;
		position: relative;
	}

	.nav-bar {
		background: linear-gradient(135deg, #3182CE, #2B6CB0);
		padding: 10px 20px;
		display: flex;
		align-items: center;
		height: 44px;
		position: relative;

		.back-btn {
			width: 40px;
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			left: 5px;
		}

		.title {
			color: #fff;
			font-size: 18px;
			font-weight: bold;
			width: 100%;
			text-align: center;
		}
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: calc(100vh - 44px - var(--status-bar-height));
		padding: 20px;

		.loading-animation {
			width: 100px;
			height: 100px;
			margin-bottom: 30px;
			perspective: 800px;

			.cube {
				width: 100%;
				height: 100%;
				position: relative;
				transform-style: preserve-3d;
				animation: rotate 5s infinite linear;

				.face {
					position: absolute;
					width: 100%;
					height: 100%;
					opacity: 0.9;
					border: 2px solid rgba(255, 255, 255, 0.5);
				}

				.front {
					background-color: rgba(49, 130, 206, 0.7);
					transform: translateZ(50px);
				}

				.back {
					background-color: rgba(49, 130, 206, 0.7);
					transform: rotateY(180deg) translateZ(50px);
				}

				.left {
					background-color: rgba(49, 130, 206, 0.6);
					transform: rotateY(-90deg) translateZ(50px);
				}

				.right {
					background-color: rgba(49, 130, 206, 0.6);
					transform: rotateY(90deg) translateZ(50px);
				}

				.top {
					background-color: rgba(49, 130, 206, 0.8);
					transform: rotateX(90deg) translateZ(50px);
				}

				.bottom {
					background-color: rgba(49, 130, 206, 0.8);
					transform: rotateX(-90deg) translateZ(50px);
				}
			}
		}

		.loading-text {
			font-size: 18px;
			color: #333;
			font-weight: bold;
			margin-bottom: 10px;
		}

		.loading-tips {
			font-size: 14px;
			color: #666;
			text-align: center;
		}
	}

	.model-container {
		height: calc(100vh - 44px - 70px - var(--status-bar-height));
		margin-top: calc(44px + var(--status-bar-height));
		background-color: #f5f5f5;
		position: relative;
		overflow: hidden;

		.model-placeholder {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	}

	.controls {
		position: absolute;
		top: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;

		.control-btn {
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.9);
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			transition: all 0.2s;

			&:active {
				transform: scale(0.95);
			}
		}

		.rotate {
			background-color: rgba(0, 122, 255, 0.1);
		}
	}

	.info-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(255, 255, 255, 0.95);
		border-radius: 16px 16px 0 0;
		padding: 15px;
		box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
		transform: translateY(calc(100% - 50px));
		transition: transform 0.3s ease;

		&.active {
			transform: translateY(0);
		}

		.info-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;

			.info-title {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}

			.toggle-icon {
				font-size: 14px;
				color: #007AFF;
			}
		}

		.info-content {
			display: flex;
			flex-direction: column;
			gap: 12px;

			.info-item {
				display: flex;
				justify-content: space-between;

				.info-label {
					font-size: 14px;
					color: #666;
				}

				.info-value {
					font-size: 14px;
					color: #333;
					font-weight: 500;
				}
			}

			.info-desc {
				font-size: 14px;
				color: #666;
				line-height: 1.5;
				margin-top: 10px;
				padding-top: 10px;
				border-top: 1px solid #eee;
			}
		}
	}

	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70px;
		background-color: #fff;
		display: flex;
		align-items: center;
		padding: 0 15px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
		z-index: 100;

		.action-btn {
			height: 40px;
			// margin: 0 8px;
			display: flex;
			// align-items: center;
			justify-content: center;
			border-radius: 20px;
			font-size: 14px;
			// border: none;
			background-color: #f5f5f5;

			text {
				margin-left: 5px;
			}

			&.download {
				background-color: rgba(0, 122, 255, 0.1);
				color: #007AFF;
				width: 250rpx;
			}

			&.share {
				background-color: rgba(76, 217, 100, 0.1);
				color: #4CD964;
				width: 200rpx;
				margin: 0 20rpx;
			}

			&.ar {
				background: linear-gradient(135deg, #4A5568, #2D3748);
				color: #fff;
				width: 250rpx;
			}
		}
	}

	@keyframes rotate {
		0% {
			transform: rotateX(0) rotateY(0) rotateZ(0);
		}

		100% {
			transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
		}
	}
</style>