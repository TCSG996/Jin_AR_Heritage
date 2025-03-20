<template>
	<view class="container">
		<view class="nav-bar">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">〈</text>
			</view>
			<view class="title">{{ heritage.name }} · AR体验</view>
			<view class="placeholder"></view>
		</view>
		
		<view class="ar-container">
			<view class="ar-placeholder" v-if="!arReady">
				<view class="placeholder-content">
					<view class="icon-container">
						<view class="icon">AR</view>
					</view>
					<view class="message">环境扫描中</view>
					<view class="sub-message">请缓慢移动手机，扫描周围环境</view>
					<view class="tips">
						<text class="tip-item">· 请确保周围光线充足</text>
						<text class="tip-item">· 避免快速移动设备</text>
						<text class="tip-item">· 找一个开阔平坦的区域</text>
					</view>
				</view>
			</view>
			
			<image v-if="arReady" class="ar-demo" src="/static/ar-demo.jpg" mode="aspectFill"></image>
			
			<view class="ar-controls" v-if="arReady">
				<view class="control-btn scale-btn" @click="toggleScaleMode">
					<text class="control-icon">↔</text>
					<text class="control-text">缩放</text>
				</view>
				<view class="control-btn rotate-btn" @click="toggleRotateMode">
					<text class="control-icon">↻</text>
					<text class="control-text">旋转</text>
				</view>
				<view class="control-btn reset-btn" @click="resetModel">
					<text class="control-icon">⟲</text>
					<text class="control-text">重置</text>
				</view>
				<view class="control-btn capture-btn" @click="captureScreen">
					<text class="control-icon">📷</text>
					<text class="control-text">拍照</text>
				</view>
			</view>
			
			<view class="scan-animation" v-if="!arReady">
				<view class="scan-line"></view>
			</view>
		</view>
		
		<view class="instruction-panel" v-if="!arReady">
			<view class="instruction-title">AR使用说明</view>
			<view class="instruction-content">
				<text class="instruction-step">1. 保持设备稳定，对准平面</text>
				<text class="instruction-step">2. 待蓝色标记出现后，点击放置文物</text>
				<text class="instruction-step">3. 可通过按钮缩放和旋转文物</text>
				<text class="instruction-step">4. 长按可保存AR场景截图</text>
			</view>
			<button class="start-btn" @click="startAR">开始体验</button>
		</view>
		
		<view class="info-panel" v-if="arReady">
			<view class="info-title">{{ heritage.name }}</view>
			<view class="info-description">{{ heritage.shortDescription }}</view>
		</view>
		
		<view class="modal-container" v-if="showPhotoModal">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">已保存AR场景照片</text>
					<text class="modal-close" @click="closePhotoModal">×</text>
				</view>
				<image class="photo-preview" :src="capturedPhoto" mode="aspectFit"></image>
				<view class="modal-actions">
					<button class="action-btn share-btn" @click="sharePhoto">分享</button>
					<button class="action-btn save-btn" @click="savePhoto">保存</button>
				</view>
			</view>
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
					shortDescription: '正在获取文物信息...'
				},
				arReady: false,
				activeMode: 'none', // none, scale, rotate
				showPhotoModal: false,
				capturedPhoto: '/static/ar-sample.jpg' // 模拟的截图
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
		},
		methods: {
			fetchHeritageData() {
				// 这里应当从API获取数据
				// 模拟数据获取
				setTimeout(() => {
					this.heritage = {
						id: this.heritageId,
						name: '晋祠圣母像',
						shortDescription: '晋祠圣母像是晋祠中的核心文物，造型精美，工艺精湛，是中国古代雕塑艺术的典范。'
					};
				}, 500);
			},
			goBack() {
				uni.navigateBack();
			},
			startAR() {
				uni.showLoading({
					title: '正在初始化AR...'
				});
				
				// 模拟AR初始化过程
				setTimeout(() => {
					uni.hideLoading();
					this.arReady = true;
				}, 3000);
			},
			toggleScaleMode() {
				this.activeMode = this.activeMode === 'scale' ? 'none' : 'scale';
				uni.showToast({
					title: this.activeMode === 'scale' ? '缩放模式已启用' : '操作模式已重置',
					icon: 'none'
				});
			},
			toggleRotateMode() {
				this.activeMode = this.activeMode === 'rotate' ? 'none' : 'rotate';
				uni.showToast({
					title: this.activeMode === 'rotate' ? '旋转模式已启用' : '操作模式已重置',
					icon: 'none'
				});
			},
			resetModel() {
				uni.showToast({
					title: '模型已重置到初始状态',
					icon: 'none'
				});
				this.activeMode = 'none';
			},
			captureScreen() {
				uni.showLoading({
					title: '正在截图...'
				});
				
				// 模拟截图过程
				setTimeout(() => {
					uni.hideLoading();
					this.showPhotoModal = true;
				}, 1000);
			},
			closePhotoModal() {
				this.showPhotoModal = false;
			},
			sharePhoto() {
				uni.showActionSheet({
					itemList: ['分享到微信', '分享到朋友圈', '分享到微博'],
					success: (res) => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						});
						this.showPhotoModal = false;
					}
				});
			},
			savePhoto() {
				uni.showLoading({
					title: '正在保存...'
				});
				
				// 模拟保存过程
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '已保存到相册',
						icon: 'success'
					});
					this.showPhotoModal = false;
				}, 1000);
			}
		}
	}
</script>

<style lang="scss">
	.container {
		width: 100%;
		height: 100vh;
		position: relative;
		background-color: #000;
		overflow: hidden;
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
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		z-index: 10;
		
		.back-btn {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.1);
			display: flex;
			justify-content: center;
			align-items: center;
			transition: all 0.2s;
			
			&:active {
				transform: scale(0.9);
				background-color: rgba(255, 255, 255, 0.2);
			}
			
			.back-icon {
				font-size: 36rpx;
				color: #fff;
			}
		}
		
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #fff;
		}
		
		.placeholder {
			width: 60rpx;
		}
	}
	
	.ar-container {
		width: 100%;
		height: 100vh;
		position: relative;
		
		.ar-placeholder {
			width: 100%;
			height: 100%;
			background-color: #222;
			display: flex;
			justify-content: center;
			align-items: center;
			
			.placeholder-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 0 60rpx;
				
				.icon-container {
					width: 150rpx;
					height: 150rpx;
					border-radius: 30rpx;
					background: linear-gradient(135deg, #4a90e2, #63d0ff);
					display: flex;
					justify-content: center;
					align-items: center;
					margin-bottom: 40rpx;
					box-shadow: 0 0 30rpx rgba(74, 144, 226, 0.5);
					
					.icon {
						font-size: 60rpx;
						font-weight: bold;
						color: white;
					}
				}
				
				.message {
					font-size: 40rpx;
					font-weight: bold;
					color: white;
					margin-bottom: 20rpx;
				}
				
				.sub-message {
					font-size: 28rpx;
					color: rgba(255, 255, 255, 0.7);
					margin-bottom: 60rpx;
					text-align: center;
				}
				
				.tips {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					
					.tip-item {
						font-size: 26rpx;
						color: rgba(255, 255, 255, 0.5);
						margin-bottom: 15rpx;
					}
				}
			}
		}
		
		.ar-demo {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		
		.scan-animation {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 500rpx;
			height: 500rpx;
			border: 4rpx solid rgba(74, 144, 226, 0.5);
			border-radius: 20rpx;
			
			.scan-line {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 2rpx;
				background-color: #4a90e2;
				box-shadow: 0 0 10rpx #4a90e2;
				animation: scan 2s linear infinite;
			}
		}
		
		.ar-controls {
			position: absolute;
			bottom: 200rpx;
			left: 0;
			width: 100%;
			display: flex;
			justify-content: space-around;
			padding: 0 30rpx;
			box-sizing: border-box;
			
			.control-btn {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				.control-icon {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					background-color: rgba(255, 255, 255, 0.15);
					backdrop-filter: blur(5px);
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 36rpx;
					color: white;
					margin-bottom: 10rpx;
					transition: all 0.2s;
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
					
					&:active {
						transform: scale(0.9);
						background-color: rgba(255, 255, 255, 0.25);
					}
				}
				
				.control-text {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.9);
				}
			}
			
			.capture-btn {
				.control-icon {
					background-color: rgba(74, 144, 226, 0.8);
				}
			}
		}
	}
	
	.instruction-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(10px);
		padding: 40rpx 30rpx;
		border-radius: 30rpx 30rpx 0 0;
		box-sizing: border-box;
		
		.instruction-title {
			font-size: 32rpx;
			font-weight: bold;
			color: white;
			margin-bottom: 30rpx;
			text-align: center;
		}
		
		.instruction-content {
			display: flex;
			flex-direction: column;
			margin-bottom: 40rpx;
			
			.instruction-step {
				font-size: 28rpx;
				color: rgba(255, 255, 255, 0.9);
				margin-bottom: 20rpx;
				position: relative;
				padding-left: 30rpx;
				
				&:before {
					content: '';
					position: absolute;
					left: 0;
					top: 14rpx;
					width: 8rpx;
					height: 8rpx;
					background-color: #4a90e2;
					border-radius: 50%;
				}
			}
		}
		
		.start-btn {
			width: 80%;
			height: 90rpx;
			border-radius: 45rpx;
			background: linear-gradient(90deg, #4a90e2, #63d0ff);
			color: white;
			font-size: 32rpx;
			font-weight: bold;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0 auto;
			box-shadow: 0 6rpx 20rpx rgba(74, 144, 226, 0.4);
			border: none;
			
			&:active {
				transform: scale(0.98);
				box-shadow: 0 4rpx 10rpx rgba(74, 144, 226, 0.3);
			}
		}
	}
	
	.info-panel {
		position: absolute;
		bottom: 60rpx;
		left: 30rpx;
		width: calc(100% - 60rpx);
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		border-radius: 16rpx;
		padding: 20rpx;
		box-sizing: border-box;
		
		.info-title {
			font-size: 30rpx;
			font-weight: bold;
			color: white;
			margin-bottom: 10rpx;
		}
		
		.info-description {
			font-size: 24rpx;
			color: rgba(255, 255, 255, 0.8);
			line-height: 1.6;
		}
	}
	
	.modal-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.modal-content {
			width: 90%;
			background-color: #fff;
			border-radius: 16rpx;
			overflow: hidden;
			
			.modal-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx;
				border-bottom: 1rpx solid #eee;
				
				.modal-title {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
				
				.modal-close {
					font-size: 40rpx;
					color: #999;
					line-height: 1;
				}
			}
			
			.photo-preview {
				width: 100%;
				height: 800rpx;
				object-fit: contain;
			}
			
			.modal-actions {
				display: flex;
				padding: 30rpx;
				
				.action-btn {
					flex: 1;
					height: 80rpx;
					border-radius: 40rpx;
					font-size: 28rpx;
					color: white;
					display: flex;
					justify-content: center;
					align-items: center;
					margin: 0 15rpx;
					border: none;
					
					&:active {
						transform: scale(0.98);
					}
				}
				
				.share-btn {
					background-color: #4a90e2;
				}
				
				.save-btn {
					background-color: #09BB07;
				}
			}
		}
	}
	
	@keyframes scan {
		0% {
			top: 0;
		}
		100% {
			top: 100%;
		}
	}
</style> 