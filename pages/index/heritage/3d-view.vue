<template>
	<view class="container">
		<view class="nav-bar">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">〈</text>
			</view>
			<view class="title">{{ heritage.name }} · 3D模型</view>
			<view class="placeholder"></view>
		</view>
		
		<view class="loading-container" v-if="loading">
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
		
		<view class="model-container" v-else>
			<!-- 这里将来会集成WebGL/Three.js等3D渲染库 -->
			<image class="placeholder-image" :src="heritage.image" mode="aspectFill"></image>
			
			<view class="controls">
				<view class="control-btn zoom-in" @click="zoomIn">
					<text class="control-icon">+</text>
				</view>
				<view class="control-btn zoom-out" @click="zoomOut">
					<text class="control-icon">-</text>
				</view>
				<view class="control-btn rotate" @click="toggleAutoRotate">
					<text class="control-icon">↻</text>
				</view>
				<view class="control-btn reset" @click="resetView">
					<text class="control-icon">⟲</text>
				</view>
			</view>
			
			<view class="info-panel">
				<view class="info-header">
					<text class="info-title">模型信息</text>
					<text class="toggle-btn" @click="toggleInfoPanel">{{ showInfo ? '收起' : '展开' }}</text>
				</view>
				<view class="info-content" v-if="showInfo">
					<view class="info-item">
						<text class="info-label">模型名称</text>
						<text class="info-value">{{ heritage.name }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">多边形数</text>
						<text class="info-value">{{ modelInfo.polygons }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">材质数量</text>
						<text class="info-value">{{ modelInfo.materials }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">扫描日期</text>
						<text class="info-value">{{ modelInfo.scanDate }}</text>
					</view>
					<view class="info-desc">{{ modelInfo.description }}</view>
				</view>
			</view>
		</view>
		
		<view class="action-bar">
			<button class="action-btn download" @click="downloadModel">
				<text class="btn-icon">↓</text>
				<text>下载模型</text>
			</button>
			<button class="action-btn share" @click="shareModel">
				<text class="btn-icon">⇪</text>
				<text>分享</text>
			</button>
			<button class="action-btn ar" @click="viewInAR">
				<text class="btn-icon">AR</text>
				<text>AR查看</text>
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				heritageId: '',
				heritage: {
					name: '加载中...',
					image: ''
				},
				loading: true,
				showInfo: false,
				modelInfo: {
					polygons: '18,452',
					materials: '7',
					scanDate: '2023-05-12',
					description: '该模型通过高精度激光扫描仪获取，并经过后期处理优化而成，保留了文物的细节特征和纹理信息。'
				},
				rotate: true,
				scale: 1.0
			}
		},
		onLoad(options) {
			if (options.id) {
				this.heritageId = options.id;
				this.fetchHeritageData();
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
				this.loading = false;
			}, 3000);
		},
		methods: {
			fetchHeritageData() {
				// 这里应当从API获取数据
				// 模拟数据获取
				setTimeout(() => {
					this.heritage = {
						id: this.heritageId,
						name: '晋祠圣母像',
						image: '/static/heritage-sample.jpg' // 使用静态图片示意
					};
				}, 500);
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
			},
			zoomOut() {
				this.scale = Math.max(0.5, this.scale - 0.1);
				this.updateModel();
			},
			toggleAutoRotate() {
				this.rotate = !this.rotate;
				uni.showToast({
					title: this.rotate ? '已开启自动旋转' : '已关闭自动旋转',
					icon: 'none'
				});
				this.updateModel();
			},
			resetView() {
				this.scale = 1.0;
				this.rotate = true;
				this.updateModel();
				uni.showToast({
					title: '已重置视图',
					icon: 'none'
				});
			},
			updateModel() {
				// 这里将来会更新3D模型的参数
				console.log('Scale:', this.scale, 'Rotation:', this.rotate);
			},
			downloadModel() {
				uni.showModal({
					title: '下载模型',
					content: '模型文件大小约为28MB，确认下载吗？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '下载中...'
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
					itemList: ['分享到微信', '分享到朋友圈', '复制链接'],
					success: (res) => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						});
					}
				});
			},
			viewInAR() {
				uni.showModal({
					title: 'AR查看',
					content: '即将打开AR模式查看文物，请确保有足够的空间并保持设备稳定',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: './ar-view?id=' + this.heritageId
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
		width: 100%;
		height: 100vh;
		position: relative;
		background-color: #f7f7f7;
	}
	
	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 90rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30rpx;
		box-sizing: border-box;
		background-color: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 10;
		
		.back-btn {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			background-color: rgba(0, 0, 0, 0.05);
			display: flex;
			justify-content: center;
			align-items: center;
			transition: all 0.2s;
			
			&:active {
				transform: scale(0.9);
				background-color: rgba(0, 0, 0, 0.1);
			}
			
			.back-icon {
				font-size: 36rpx;
				color: #333;
			}
		}
		
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.placeholder {
			width: 60rpx;
		}
	}
	
	.loading-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.loading-animation {
			perspective: 800px;
			height: 200rpx;
			width: 200rpx;
			position: relative;
			margin-bottom: 40rpx;
			
			.cube {
				width: 100rpx;
				height: 100rpx;
				position: absolute;
				top: 50%;
				left: 50%;
				margin-top: -50rpx;
				margin-left: -50rpx;
				transform-style: preserve-3d;
				animation: rotate 4s infinite linear;
				
				.face {
					position: absolute;
					width: 100%;
					height: 100%;
					opacity: 0.8;
				}
				
				.front {
					background: linear-gradient(45deg, #8B4513, #D2691E);
					transform: translateZ(50rpx);
				}
				
				.back {
					background: linear-gradient(45deg, #D2691E, #8B4513);
					transform: rotateY(180deg) translateZ(50rpx);
				}
				
				.top {
					background: linear-gradient(45deg, #A0522D, #8B4513);
					transform: rotateX(90deg) translateZ(50rpx);
				}
				
				.bottom {
					background: linear-gradient(45deg, #8B4513, #A0522D);
					transform: rotateX(-90deg) translateZ(50rpx);
				}
				
				.left {
					background: linear-gradient(45deg, #CD853F, #A0522D);
					transform: rotateY(-90deg) translateZ(50rpx);
				}
				
				.right {
					background: linear-gradient(45deg, #A0522D, #CD853F);
					transform: rotateY(90deg) translateZ(50rpx);
				}
			}
		}
		
		.loading-text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
		}
		
		.loading-tips {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.model-container {
		width: 100%;
		height: calc(100vh - 190rpx);
		margin-top: 90rpx;
		position: relative;
		
		.placeholder-image {
			width: 100%;
			height: 100%;
			object-fit: cover;
			filter: blur(3px);
			opacity: 0.3;
		}
		
		.controls {
			position: absolute;
			right: 30rpx;
			top: 30rpx;
			display: flex;
			flex-direction: column;
			
			.control-btn {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				background-color: rgba(255, 255, 255, 0.9);
				display: flex;
				justify-content: center;
				align-items: center;
				margin-bottom: 20rpx;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
				transition: all 0.2s;
				
				&:active {
					transform: scale(0.9);
					background-color: rgba(255, 255, 255, 1);
				}
				
				.control-icon {
					font-size: 36rpx;
					color: #333;
				}
			}
			
			.rotate {
				background-color: rgba(139, 69, 19, 0.1);
				.control-icon {
					color: #8B4513;
				}
			}
		}
		
		.info-panel {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			background-color: rgba(255, 255, 255, 0.9);
			backdrop-filter: blur(10px);
			border-radius: 30rpx 30rpx 0 0;
			padding: 30rpx;
			box-sizing: border-box;
			box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
			transition: all 0.3s;
			
			.info-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				
				.info-title {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
				
				.toggle-btn {
					font-size: 28rpx;
					color: #8B4513;
				}
			}
			
			.info-content {
				animation: fadeIn 0.3s ease;
				
				.info-item {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					.info-label {
						width: 150rpx;
						font-size: 28rpx;
						color: #999;
					}
					
					.info-value {
						font-size: 28rpx;
						color: #333;
					}
				}
				
				.info-desc {
					font-size: 28rpx;
					color: #666;
					line-height: 1.6;
					margin-top: 20rpx;
					padding-top: 20rpx;
					border-top: 1rpx solid rgba(0, 0, 0, 0.05);
				}
			}
		}
	}
	
	.action-bar {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 100rpx;
		padding: 0 30rpx;
		box-sizing: border-box;
		display: flex;
		justify-content: space-around;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 5;
		
		.action-btn {
			height: 70rpx;
			border-radius: 35rpx;
			padding: 0 30rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 26rpx;
			background-color: #f5f5f5;
			color: #666;
			border: none;
			transition: all 0.2s;
			
			&:active {
				transform: scale(0.95);
			}
			
			.btn-icon {
				margin-right: 8rpx;
			}
		}
		
		.download {
			background-color: rgba(139, 69, 19, 0.1);
			color: #8B4513;
		}
		
		.share {
			background-color: rgba(0, 150, 136, 0.1);
			color: #009688;
		}
		
		.ar {
			background: linear-gradient(to right, #D2691E, #8B4513);
			color: white;
			box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.2);
		}
	}
	
	@keyframes rotate {
		0% {
			transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
		}
		100% {
			transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
		}
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style> 