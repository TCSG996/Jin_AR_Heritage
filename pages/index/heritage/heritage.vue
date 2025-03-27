<template>
	<view class="heritage-detail-page">
		<!-- 顶部图片区域 -->
		<view class="header-section">
			<image class="header-image" :src="heritage.image" mode="aspectFill"></image>
			<view class="header-overlay"></view>
			
			<!-- 古建筑元素装饰 -->
			<view class="header-decoration">
				<view class="decoration-line"></view>
			</view>
			
			<!-- 顶部导航栏 -->
			<view class="top-toolbar" :style="{paddingTop: statusBarHeight + 'px'}">
				<view class="back-button" @tap="goBack">
					<text class="back-icon">〈</text>
					<text class="back-text">返回</text>
				</view>
				<view class="action-buttons">
					<view class="action-btn collect-btn" @tap="toggleFavorite">
						<text class="icon-star" :class="{'filled': isFavorite}">♥</text>
					</view>
					<view class="action-btn share-btn" @tap="toggleShare">
						<text class="icon-share">⊕</text>
					</view>
				</view>
			</view>
			
			<!-- 标题信息区域 -->
			<view class="header-info">
				<view class="header-category">文物景点</view>
				<view class="header-title">{{heritage.name}}</view>
				<view class="header-period">{{heritage.period}}</view>
				<view class="header-location" @tap="openMap">
					<text class="location-icon">📍</text>
					<text class="location-text">{{heritage.location}}</text>
				</view>
			</view>
			
			<!-- 波浪形装饰 -->
			<view class="header-wave"></view>
		</view>
		
		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y="true" :bounces="false" @scroll="handleScroll">
			<!-- 内容卡片 -->
			<view class="content-card">
				<!-- 描述卡片 -->
				<view class="section description-section">
					<view class="section-header">
						<view class="section-title">
							<view class="title-decoration"></view>
							<text>文物简介</text>
						</view>
					</view>
					<view class="section-content">
						<text class="description-text" :class="{'expanded': isExpanded}">{{heritage.description}}</text>
						<view class="expand-btn" @tap="toggleExpand">
							<text>{{isExpanded ? '收起' : '展开'}}</text>
							<text class="expand-icon">{{isExpanded ? '↑' : '↓'}}</text>
						</view>
					</view>
				</view>
				
				<!-- 特点标签区域 -->
				<view class="section features-section">
					<view class="section-header">
						<view class="section-title">
							<view class="title-decoration"></view>
							<text>文物特点</text>
						</view>
					</view>
					<view class="features-tags">
						<view class="feature-tag" v-for="(feature, idx) in features" :key="idx">
							{{feature.name}}
						</view>
						<view class="feature-tag">建于{{heritage.period}}</view>
						<view class="feature-tag">国家一级文物</view>
					</view>
				</view>
				
				<!-- 评分区域 -->
				<view class="section rating-section">
					<view class="section-header">
						<view class="section-title">
							<view class="title-decoration"></view>
							<text>文物评分</text>
						</view>
					</view>
					<view class="rating-container">
						<view class="rating-stars">
							<view class="star-row">
								<view v-for="i in 5" :key="i" class="star" :class="{ 'active': i <= rating }"
									@tap="setRating(i)">★</view>
							</view>
							<text class="rating-value">{{rating}}.0</text>
						</view>
						<view class="rating-bars">
							<view class="rating-item" v-for="(item, idx) in ratingItems" :key="idx">
								<text class="rating-label">{{item.label}}</text>
								<view class="rating-bar-bg">
									<view class="rating-bar" :style="{ width: item.value * 20 + '%' }"></view>
								</view>
								<text class="rating-number">{{item.value}}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 相关文物 -->
				<view class="section related-section">
					<view class="section-header">
						<view class="section-title">
							<view class="title-decoration"></view>
							<text>附近文物</text>
						</view>
					</view>
					<view class="related-items">
						<view class="related-item" v-for="(item, idx) in relatedHeritages" :key="idx"
							@tap="goToDetail(item.id)">
							<view class="item-image-container">
								<image :src="item.image" mode="aspectFill"></image>
								<view class="item-overlay"></view>
							</view>
							<view class="item-info">
								<text class="item-name">{{item.name}}</text>
								<text class="item-period">距离 {{1 + idx}}km</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部安全区域 -->
			<view class="safe-area-bottom"></view>
		</scroll-view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-action">
			<view class="action-button ar-button" @tap="openAR">
				<text class="action-icon">AR</text>
				<text class="action-text">AR体验</text>
			</view>
			<view class="action-button view3d-button" @tap="open3DView">
				<text class="action-icon">3D</text>
				<text class="action-text">3D观看</text>
			</view>
			<view class="action-button map-button" @tap="openMap">
				<text class="action-icon">🗺️</text>
				<text class="action-text">查看地图</text>
			</view>
		</view>
		
		<!-- 地图弹窗 -->
		<view class="map-popup" v-if="showMapPopup">
			<view class="map-container">
				<view class="map-header">
					<text class="map-title">{{heritage.name}}的位置</text>
					<view class="close-btn" @tap="closeMapPopup">✕</view>
				</view>
				<map id="myMap" class="location-map" :latitude="mapLocation.latitude" :longitude="mapLocation.longitude"
					:markers="mapMarkers" scale="14" show-location type="amap" :style="{height: '100%'}"></map>
				<view class="map-footer">
					<text class="address">{{heritage.location}}</text>
					<button class="navigation-btn" @tap="openSystemMap">导航到此处</button>
				</view>
			</view>
		</view>
		
		<!-- 加载中状态 -->
		<view class="loading-mask" v-if="isLoading">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		heritageList
	} from './mock.js'

	export default {
		data() {
			return {
				statusBarHeight: 20,
				heritage: {},
				isFavorite: false,
				isExpanded: false,
				showTooltip: false,
				currentSwiper: 0,
				scrollTop: 0,
				imageScale: 1,
				navbarOpacity: 0,
				navbarShadow: 'none',
				navbarBackground: 'transparent',
				navbarTitleOpacity: 0,
				rating: 4,
				backRipple: false,
				showShareMenu: false,
				galleryHeight: 550,
				isLoading: true,
				features: [{
						icon: '🏛️',
						name: '建筑风格独特'
					},
					{
						icon: '🎨',
						name: '保存完好'
					},
					{
						icon: '📜',
						name: '历史价值高'
					}
				],
				ratingItems: [{
						label: '历史价值',
						value: 4.5
					},
					{
						label: '艺术价值',
						value: 4.2
					},
					{
						label: '保存状况',
						value: 3.8
					}
				],
				showMapPopup: false,
				mapLocation: {
					latitude: 37.87059,
					longitude: 112.548879
				},
				mapMarkers: [],
				mapContext: null
			};
		},
		computed: {
			relatedHeritages() {
				return this.heritageList.filter(item => item.id !== this.heritage.id).slice(0, 4);
			},
			heritageList() {
				return heritageList;
			}
		},
		onLoad(option) {
			// 获取状态栏高度
            const systemInfo = uni.getSystemInfoSync();
            this.statusBarHeight = systemInfo.statusBarHeight;
            
			this.isLoading = true;
			
			const id = parseInt(option.id)
			this.heritage = heritageList.find(item => item.id === id) || {}

			// 创建images数组，包含主图和额外图片
			if (this.heritage.image) {
				// 初始化images数组
				this.heritage.images = [this.heritage.image]

				// 如果有额外图片，添加到images数组
				if (this.heritage.extraImages && this.heritage.extraImages.length) {
					this.heritage.images.push(...this.heritage.extraImages)
				}
			} else {
				// 如果没有图片，设置为空数组
				this.heritage.images = []
			}

			// 预设地图位置
			this.setMapLocation();
			
			// 模拟加载过程
			setTimeout(() => {
				this.isLoading = false;
			}, 800);
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
			// 根据滚动位置调整导航栏
			this.navbarOpacity = Math.min(1, e.scrollTop / 200);
			this.navbarTitleOpacity = Math.max(0, (e.scrollTop - 150) / 100);
			// 视差效果
			this.imageScale = 1 + (e.scrollTop * 0.001);
		},
		methods: {
			goBack() {
				this.backRipple = true;
				setTimeout(() => {
					this.backRipple = false;
					uni.navigateBack();
				}, 300);
			},
			toggleFavorite() {
				this.isFavorite = !this.isFavorite;
				if (this.isFavorite) {
					this.showTooltip = true;
					setTimeout(() => {
						this.showTooltip = false;
					}, 2000);

					uni.showToast({
						title: '已收藏',
						icon: 'none'
					});
				}
			},
			toggleExpand() {
				this.isExpanded = !this.isExpanded;
				// 添加反馈提示
				uni.vibrateShort({
					success: function() {
						console.log('触感反馈成功');
					}
				});
			},
			goToDetail(id) {
				uni.redirectTo({
					url: `./heritage?id=${id}`
				});
			},
			onSwiperChange(e) {
				this.currentSwiper = e.detail.current;
			},
			setRating(value) {
				this.rating = value;
				uni.showToast({
					title: `评分：${value}`,
					icon: 'none'
				});
			},
			previewImage(url) {
				const urls = [this.heritage.image];
				if (this.heritage.extraImages && this.heritage.extraImages.length) {
					urls.push(...this.heritage.extraImages);
				}
				uni.previewImage({
					urls: urls,
					current: url
				});
			},
			toggleShare() {
				this.showShareMenu = !this.showShareMenu;
				if (this.showShareMenu) {
					setTimeout(() => {
						this.showShareMenu = false;
					}, 3000);
				}
			},
			shareToWechat() {
				uni.showToast({
					title: '分享到微信',
					icon: 'none'
				});
				this.showShareMenu = false;
			},
			addToFavorites() {
				this.isFavorite = true;
				this.showTooltip = true;
				setTimeout(() => {
					this.showTooltip = false;
				}, 2000);

				uni.showToast({
					title: '已收藏',
					icon: 'none'
				});
				this.showShareMenu = false;
			},
			reportIssue() {
				uni.showToast({
					title: '问题已记录',
					icon: 'none'
				});
				this.showShareMenu = false;
			},
			open3DView() {
				uni.showModal({
					title: '3D观览',
					content: '即将打开该非遗文物的3D立体查看模式',
					confirmText: '确认',
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								title: '3D模型加载中...',
								icon: 'loading',
								duration: 2000
							});

							// 这里模拟加载3D模型的逻辑，实际应用中需要实现相应功能
							setTimeout(() => {
								// 实际应用中跳转到3D展示页面
								uni.navigateTo({
									url: './3d-view?id=' + this.heritage.id
								});
							}, 2000);
						}
					}
				});
			},
			openAR() {
				uni.showModal({
					title: 'AR体验',
					content: '即将启动AR模式体验该文物',
					confirmText: '开始体验',
					confirmColor: '#8B4513',
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								title: 'AR模式准备中...',
								icon: 'loading',
								duration: 1500
							});
							
							// 模拟加载AR功能
							setTimeout(() => {
								uni.navigateTo({
									url: '../AR/index?id=' + this.heritage.id
								});
							}, 1500);
						}
					}
				});
			},
			handleScroll(e) {
				this.scrollTop = e.detail.scrollTop;

				// Dynamic navbar styling based on scroll position
				if (this.scrollTop > 50) {
					// Calculate opacity based on scroll position (max 0.9)
					this.navbarOpacity = Math.min(0.9, (this.scrollTop - 50) / 150);
					this.navbarShadow = `0 4rpx 20rpx rgba(0, 0, 0, ${this.navbarOpacity * 0.2})`;
					this.navbarBackground = `rgba(255, 255, 255, ${this.navbarOpacity})`;
				} else {
					this.navbarOpacity = 0;
					this.navbarShadow = 'none';
					this.navbarBackground = 'transparent';
				}
			},
			openMap() {
				// 检查是否有位置信息
				if (!this.heritage.location) {
					uni.showToast({
						title: '暂无位置信息',
						icon: 'none'
					});
					return;
				}

				// 根据不同文物设置不同位置（模拟数据）
				this.setMapLocation();

				// 检查地图模块是否可用
				uni.getSystemInfo({
					success: (sysInfo) => {
						console.log('当前系统:', sysInfo.platform);
						console.log('当前SDK版本:', sysInfo.SDKVersion);

						// 弹出确认框
						uni.showModal({
							title: '地图导航',
							content: `是否打开地图查看"${this.heritage.name}"的位置？`,
							confirmText: '打开',
							cancelText: '应用内查看',
							success: (res) => {
								if (res.confirm) {
									// 打开系统地图
									try {
										this.openSystemMap();
									} catch (err) {
										console.error('打开地图出错:', err);
										uni.showToast({
											title: '地图打开失败',
											icon: 'none'
										});
										// 如果系统地图打开失败，显示应用内地图
										this.showMapPopup = true;
									}
								} else if (res.cancel) {
									// 显示应用内地图
									this.showMapPopup = true;
								}
							}
						});
					},
					fail: (err) => {
						console.error('获取系统信息失败:', err);
						// 直接显示应用内地图
						this.showMapPopup = true;
					}
				});
			},

			setMapLocation() {
				// 根据文物ID设置不同的地图位置（模拟数据）
				// 实际应用中这些坐标应从后端API获取
				switch (this.heritage.id) {
					case 1: // 晋祠圣母殿
						this.mapLocation = {
							latitude: 37.708904,
							longitude: 112.434296
						};
						break;
					case 2: // 应县木塔
						this.mapLocation = {
							latitude: 39.554561,
							longitude: 113.187607
						};
						break;
					case 3: // 平遥古城
						this.mapLocation = {
							latitude: 37.201266,
							longitude: 112.174349
						};
						break;
					case 4: // 云冈石窟
						this.mapLocation = {
							latitude: 40.110764,
							longitude: 113.132103
						};
						break;
					default: // 默认太原市
						this.mapLocation = {
							latitude: 37.87059,
							longitude: 112.548879
						};
				}

				// 设置地图标记
				this.mapMarkers = [{
					id: 1,
					latitude: this.mapLocation.latitude,
					longitude: this.mapLocation.longitude,
					title: this.heritage.name,
					iconPath: '/static/index/marker1.png', // 使用已有图标
					width: 32,
					height: 32,
					callout: {
						content: this.heritage.name,
						color: '#ffffff',
						fontSize: 14,
						borderRadius: 4,
						bgColor: '#8B4513',
						padding: 5,
						display: 'ALWAYS'
					}
				}];
			},

			openSystemMap() {
				// 打开系统地图
				uni.openLocation({
					latitude: this.mapLocation.latitude,
					longitude: this.mapLocation.longitude,
					name: this.heritage.name,
					address: this.heritage.location,
					success: () => {
						console.log('地图打开成功');
					},
					fail: (err) => {
						console.error('地图打开失败', err);
						uni.showToast({
							title: '地图打开失败',
							icon: 'none'
						});
						// 如果系统地图打开失败，显示应用内地图
						this.showMapPopup = true;
					}
				});
			},

			closeMapPopup() {
				this.showMapPopup = false;
			},

			onReady() {
				// 创建地图上下文对象
				this.mapContext = uni.createMapContext('myMap', this);
			}
		}
	}
</script>

<style lang="scss">
.heritage-detail-page {
  position: relative;
  min-height: 100vh;
  background-color: #f8f5f0;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* 顶部图片区域 */
.header-section {
  position: relative;
  height: 500rpx;
  overflow: hidden;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.2), 
    rgba(0, 0, 0, 0.4) 70%, 
    rgba(0, 0, 0, 0.7) 100%);
}

/* 古建筑风格顶部装饰 */
.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20rpx;
  z-index: 5;
  overflow: hidden;
}

.decoration-line {
  width: 100%;
  height: 15rpx;
  background-image: repeating-linear-gradient(90deg, 
    rgba(255,255,255,0.6) 0px, 
    rgba(255,255,255,0.6) 10px, 
    transparent 10px, 
    transparent 20px);
}

/* 顶部导航栏 */
.top-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  height: 70rpx;
  padding: 0 20rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 35rpx;
  backdrop-filter: blur(5px);
}

.back-icon {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-right: 8rpx;
}

.back-text {
  font-size: 28rpx;
  color: #fff;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 35rpx;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
  backdrop-filter: blur(5px);
}

.icon-star, .icon-share {
  font-size: 36rpx;
  color: #fff;
}

.icon-star.filled {
  color: #FFD700;
}

/* 标题信息区域 */
.header-info {
  position: absolute;
  left: 30rpx;
  right: 30rpx;
  bottom: 80rpx;
  z-index: 10;
}

.header-category {
  display: inline-block;
  font-size: 24rpx;
  color: #fff;
  background-color: rgba(139, 69, 19, 0.8);
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
}

.header-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-period {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15rpx;
}

.header-location {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.location-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 波浪形装饰 */
.header-wave {
  position: absolute;
  bottom: -2rpx;
  left: 0;
  right: 0;
  height: 40rpx;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23f8f5f0" fill-opacity="1" d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,128C840,128,960,160,1080,176C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>');
  background-size: cover;
  background-position: center;
  z-index: 5;
}

/* 内容区域 */
.content-scroll {
  position: relative;
  flex: 1;
  width: 100%;
  height: calc(100vh - 500rpx);
  z-index: 2;
}

.content-card {
  padding: 30rpx;
  padding-top: 0;
  background-color: #f8f5f0;
  position: relative;
  z-index: 3;
}

/* 区块通用样式 */
.section {
  margin-bottom: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  /* 背景纹理 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(45deg, 
      rgba(139, 69, 19, 0.02) 0px, 
      rgba(139, 69, 19, 0.02) 2px, 
      transparent 2px, 
      transparent 12px);
    opacity: 0.3;
    z-index: -1;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25rpx;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #654321;
}

.title-decoration {
  width: 8rpx;
  height: 30rpx;
  background-color: #8B4513;
  margin-right: 15rpx;
  border-radius: 4rpx;
}

/* 描述区块 */
.description-text {
  font-size: 28rpx;
  line-height: 1.7;
  color: #333;
  text-align: justify;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  transition: all 0.3s ease;
}

.description-text.expanded {
  -webkit-line-clamp: unset;
  max-height: none;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #8B4513;
}

.expand-icon {
  margin-left: 10rpx;
}

/* 特点标签区域 */
.features-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.feature-tag {
  font-size: 24rpx;
  padding: 10rpx 25rpx;
  border-radius: 30rpx;
  color: #8B4513;
  background-color: rgba(139, 69, 19, 0.08);
  border: 1px solid rgba(139, 69, 19, 0.1);
}

/* 评分区域 */
.rating-container {
  background-color: rgba(248, 245, 240, 0.5);
  border-radius: 16rpx;
  padding: 20rpx;
}

.rating-stars {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.star-row {
  display: flex;
  margin-right: 20rpx;
}

.star {
  font-size: 40rpx;
  color: #ddd;
  margin-right: 10rpx;
}

.star.active {
  color: #FFBB00;
}

.rating-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.rating-bars .rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.rating-label {
  width: 120rpx;
  font-size: 26rpx;
  color: #666;
}

.rating-bar-bg {
  flex: 1;
  height: 10rpx;
  background-color: #e0e0e0;
  border-radius: 5rpx;
  overflow: hidden;
  margin: 0 20rpx;
}

.rating-bar {
  height: 100%;
  background: linear-gradient(to right, #8B4513, #D2691E);
  border-radius: 5rpx;
}

.rating-number {
  font-size: 26rpx;
  color: #333;
}

/* 相关文物 */
.related-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.related-item {
  border-radius: 15rpx;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.item-image-container {
  height: 180rpx;
  position: relative;
  
  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.4));
  }
}

.item-info {
  padding: 15rpx;
}

.item-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-period {
  font-size: 22rpx;
  color: #8B4513;
}

/* 底部安全区域 */
.safe-area-bottom {
  height: 120rpx;
}

/* 底部操作按钮 */
.bottom-action {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 30rpx;
  z-index: 50;
  display: flex;
  gap: 20rpx;
}

.action-button {
  flex: 1;
  height: 90rpx;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(139, 69, 19, 0.2);
}

.ar-button {
  background: linear-gradient(135deg, #9B5523, #7B3503);
}

.view3d-button {
  background: linear-gradient(135deg, #8B4513, #A0522D);
}

.map-button {
  background-color: rgba(139, 69, 19, 0.2);
}

.action-icon {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-right: 10rpx;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5rpx 10rpx;
  border-radius: 10rpx;
}

.action-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}

.map-button .action-icon,
.map-button .action-text {
  color: #8B4513;
}

/* 地图弹窗 */
.map-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-container {
  width: 90%;
  height: 80%;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.map-header {
  height: 100rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.map-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30rpx;
  color: #666;
}

.location-map {
  flex: 1;
  width: 100%;
}

.map-footer {
  height: 150rpx;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.address {
  font-size: 28rpx;
  color: #666;
}

.navigation-btn {
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(to right, #D2691E, #8B4513);
  color: white;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.2);
  margin: 0;
}

/* 加载中状态 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(248, 245, 240, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 70rpx;
  height: 70rpx;
  border: 4rpx solid rgba(139, 69, 19, 0.1);
  border-top-color: #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 28rpx;
  color: #8B4513;
  margin-top: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>