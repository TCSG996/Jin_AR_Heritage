<template>
	<view class="heritage-detail">
		<view class="nav-bar" :style="{ 
			opacity: navbarOpacity, 
			boxShadow: navbarShadow,
			backgroundColor: navbarBackground
		}">
			<view class="back-btn" :style="{
				backgroundColor: navbarOpacity > 0.5 ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.15)'
			}" @click="goBack">
				<view class="back-icon" :style="{ color: navbarOpacity > 0.5 ? '#333' : '#fff' }">〈</view>
				<view class="back-ripple" :class="{ 'animate': backRipple }"></view>
			</view>
			<view class="nav-title"
				:style="{ opacity: navbarTitleOpacity, color: navbarOpacity > 0.5 ? '#333' : '#fff' }">
				{{ heritage.name }}
			</view>
			<view class="action-btn" :style="{
				backgroundColor: navbarOpacity > 0.5 ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.15)'
			}" @click="toggleShare">
				<view class="action-icon" :style="{ color: navbarOpacity > 0.5 ? '#333' : '#fff' }">⋮</view>
				<view class="action-menu" v-if="showShareMenu">
					<view class="menu-item" @click.stop="shareToWechat">
						<text class="menu-icon">💬</text>
						<text class="menu-text">微信分享</text>
					</view>
					<view class="menu-item" @click.stop="addToFavorites">
						<text class="menu-icon">♥</text>
						<text class="menu-text">添加收藏</text>
					</view>
					<view class="menu-item" @click.stop="reportIssue">
						<text class="menu-icon">⚠️</text>
						<text class="menu-text">报告问题</text>
					</view>
				</view>
			</view>
		</view>

		<scroll-view class="heritage-container" scroll-y @scroll="handleScroll" scroll-with-animation>
			<view class="heritage-gallery" :style="{ height: galleryHeight + 'px' }">
				<swiper class="gallery-swiper" @change="onSwiperChange" :current="currentSwiper" :indicator-dots="false"
					autoplay interval="4000" circular>
					<swiper-item v-for="(image, index) in heritage.images" :key="index">
						<image class="gallery-image" :src="image" mode="aspectFill" @click="previewImage(image)">
						</image>
					</swiper-item>
				</swiper>
				<view class="gallery-indicator">
					<view class="indicator-dot" v-for="(_, index) in heritage.images" :key="index"
						:class="{ active: index === currentSwiper }"></view>
				</view>
				<view class="view-3d-btn" @click="open3DView">
					<text class="icon">3D</text>
					<text class="text">查看3D</text>
				</view>
			</view>
		</scroll-view>

		<view class="heritage-content">
			<view class="title-row">
				<text class="heritage-name">{{heritage.name}}</text>
				<view class="favorite-btn" @click="toggleFavorite">
					<text :class="['favorite-icon', isFavorite ? 'active' : '']">♥</text>
					<view class="favorite-tooltip" v-if="showTooltip">已添加到收藏</view>
				</view>
			</view>

			<view class="tag-row">
				<view class="heritage-tag primary">{{heritage.period}}</view>
				<view class="heritage-tag">国家一级文物</view>
				<view class="heritage-tag">山西特色</view>
			</view>

			<view class="heritage-info">
				<view class="info-item">
					<view class="info-icon">🕰️</view>
					<text class="label">年代</text>
					<text class="value">{{heritage.period}}</text>
				</view>
				<view class="info-item">
					<view class="info-icon">📍</view>
					<text class="label">位置</text>
					<text class="value">{{heritage.location}}</text>
				</view>
				<view class="info-item">
					<view class="info-icon">🕒</view>
					<text class="label">开放时间</text>
					<text class="value">9:00-17:00</text>
				</view>
			</view>

			<view class="heritage-description">
				<view class="section-title">
					<text class="title-text">文物简介</text>
					<view class="title-line"></view>
				</view>
				<text class="description-content" :class="{'expanded': isExpanded}">{{heritage.description}}</text>
				<view class="expand-btn" @click="toggleExpand">
					<text>{{isExpanded ? '收起' : '展开'}}</text>
					<text :class="['expand-icon', isExpanded ? 'up' : '']">▼</text>
				</view>
			</view>

			<view class="heritage-features">
				<view class="section-title">
					<text class="title-text">文物特色</text>
					<view class="title-line"></view>
				</view>
				<view class="feature-items">
					<view class="feature-item" v-for="(feature, idx) in features" :key="idx">
						<view class="feature-icon">{{feature.icon}}</view>
						<text class="feature-text">{{feature.name}}</text>
					</view>
				</view>
			</view>

			<view class="heritage-rating">
				<view class="section-title">
					<text class="title-text">评分</text>
					<view class="title-line"></view>
				</view>
				<view class="rating-container">
					<view class="rating-stars">
						<view class="star-row">
							<view v-for="i in 5" :key="i" class="star" :class="{ 'active': i <= rating }"
								@click="setRating(i)">★</view>
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

			<view class="nearby-heritage">
				<view class="section-title">
					<text class="title-text">附近文物</text>
					<view class="title-line"></view>
				</view>
				<scroll-view scroll-x class="nearby-scroll" :show-scrollbar="false">
					<view class="nearby-items">
						<view class="nearby-item" v-for="(item, idx) in relatedHeritages" :key="idx"
							@click="goToDetail(item.id)">
							<view class="nearby-image-container">
								<image :src="item.image" mode="aspectFill" class="nearby-image"></image>
								<view class="nearby-overlay"></view>
							</view>
							<text class="nearby-name">{{item.name}}</text>
							<text class="nearby-distance">距离 {{1 + idx}}km</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<view class="action-bar">
			<button class="ar-btn">
				<text class="btn-icon">🔍</text>
				AR体验
			</button>
			<button class="map-btn" @click="openMap">
				<text class="btn-icon">🗺️</text>
				查看地图
			</button>
		</view>

		<!-- 地图弹窗 -->
		<view class="map-popup" v-if="showMapPopup">
			<view class="map-container">
				<view class="map-header">
					<text class="map-title">{{heritage.name}}的位置</text>
					<view class="close-btn" @click="closeMapPopup">✕</view>
				</view>
				<map 
					id="myMap"
					class="location-map" 
					:latitude="mapLocation.latitude" 
					:longitude="mapLocation.longitude"
					:markers="mapMarkers"
					scale="14"
					show-location
					type="amap"
					:style="{height: '100%'}"
				></map>
				<view class="map-footer">
					<text class="address">{{heritage.location}}</text>
					<button class="navigation-btn" @click="openSystemMap">导航到此处</button>
				</view>
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
				return this.heritageList.filter(item => item.id !== this.heritage.id).slice(0, 3);
			},
			heritageList() {
				return heritageList;
			}
		},
		onLoad(option) {
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
					iconPath: '/static/index/heritage.png', // 使用已有图标
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
	@keyframes ripple {
		0% {
			transform: scale(0.5);
			opacity: 0.5;
		}

		100% {
			transform: scale(2.5);
			opacity: 0;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.heritage-detail {
		min-height: 100vh;
		background-color: #fff;
		position: relative;

		.nav-bar {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			z-index: 10;
			padding: 0 30rpx;
			box-sizing: border-box;
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 100rpx;
			transition: background-color 0.3s, box-shadow 0.3s;
			backdrop-filter: blur(10rpx);
			background-color: v-bind(navbarBackground);
			box-shadow: v-bind(navbarShadow);

			.back-btn,
			.action-btn {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
				border-radius: 50%;
				transform: scale(1);
				transition: all 0.2s ease;

				&:active {
					transform: scale(0.9);
				}
			}

			.back-btn {
				.back-icon {
					font-size: 36rpx;
					color: #666;
				}

				.back-ripple {
					position: absolute;
					width: 100%;
					height: 100%;
					border-radius: 50%;
					background-color: rgba(139, 69, 19, 0.2);
					transform: scale(0);
					opacity: 0;

					&.animate {
						animation: ripple 0.8s cubic-bezier(0, 0.5, 0.5, 1);
					}
				}
			}

			.action-btn {
				.action-icon {
					font-size: 32rpx;
					font-weight: bold;
					transform: rotate(90deg);
				}

				.action-menu {
					position: absolute;
					top: 90rpx;
					right: 0;
					width: 240rpx;
					background-color: #fff;
					border-radius: 15rpx;
					box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.15);
					padding: 15rpx 0;
					z-index: 101;
					animation: fadeIn 0.2s ease;

					&:before {
						content: '';
						position: absolute;
						top: -10rpx;
						right: 30rpx;
						width: 0;
						height: 0;
						border-left: 10rpx solid transparent;
						border-right: 10rpx solid transparent;
						border-bottom: 10rpx solid #fff;
					}

					.menu-item {
						display: flex;
						align-items: center;
						padding: 20rpx 30rpx;
						transition: background-color 0.2s ease;

						&:active {
							background-color: #f5f5f5;
						}

						.menu-icon {
							margin-right: 15rpx;
							font-size: 32rpx;
						}

						.menu-text {
							font-size: 28rpx;
							color: #333;
						}
					}
				}
			}

			.nav-title {
				font-size: 34rpx;
				font-weight: bold;
				transition: opacity 0.3s, transform 0.3s;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 60%;
				text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
				color: #333;
				opacity: v-bind(navbarOpacity);
				transform: translateY(v-bind('navbarOpacity * 0 + "rpx"'));
			}
		}

		.heritage-gallery {
			position: relative;
			width: 100%;
			overflow: hidden;

			.gallery-swiper {
				width: 100%;
				height: 100%;
			}

			.gallery-image {
				width: 100%;
				height: 100%;
			}

			.gallery-indicator {
				position: absolute;
				bottom: 30rpx;
				left: 50%;
				transform: translateX(-50%);
				display: flex;

				.indicator-dot {
					width: 16rpx;
					height: 16rpx;
					border-radius: 50%;
					background-color: rgba(255, 255, 255, 0.5);
					margin: 0 8rpx;
					transition: all 0.3s;

					&.active {
						width: 40rpx;
						border-radius: 8rpx;
						background-color: white;
					}
				}
			}

			.view-3d-btn {
				position: absolute;
				bottom: 30rpx;
				right: 30rpx;
				background-color: rgba(255, 255, 255, 0.8);
				border-radius: 30rpx;
				padding: 10rpx 20rpx;
				display: flex;
				align-items: center;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
				backdrop-filter: blur(5px);
				border: 1rpx solid rgba(255, 255, 255, 0.8);
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.95);
					background-color: rgba(255, 255, 255, 1);
				}

				.icon {
					font-size: 28rpx;
					color: #8B4513;
					font-weight: bold;
					margin-right: 6rpx;
				}

				.text {
					font-size: 26rpx;
					color: #8B4513;
				}
			}
		}

		.heritage-content {
			padding: 40rpx 30rpx 120rpx;
			margin-top: -100rpx;
			border-radius: 40rpx 40rpx 0 0;
			background-color: #fff;
			position: relative;
			z-index: 1;
			box-shadow: 0 -30rpx 60rpx rgba(0, 0, 0, 0.1);

			.title-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.heritage-name {
					font-size: 44rpx;
					font-weight: bold;
					color: #333;
					flex: 1;
					text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
					background: linear-gradient(90deg, #8B4513, #D2691E);
					-webkit-background-clip: text;
					color: transparent;
				}

				.favorite-btn {
					width: 80rpx;
					height: 80rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					position: relative;

					.favorite-icon {
						font-size: 46rpx;
						color: #ddd;
						transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
						transform-origin: center;

						&.active {
							color: #ff4a4a;
							transform: scale(1.2);
							animation: pulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
						}

						@keyframes pulse {
							0% {
								transform: scale(1);
							}

							50% {
								transform: scale(1.4);
							}

							100% {
								transform: scale(1.2);
							}
						}
					}

					.favorite-tooltip {
						position: absolute;
						top: -60rpx;
						right: -40rpx;
						background-color: rgba(0, 0, 0, 0.7);
						color: white;
						padding: 10rpx 20rpx;
						border-radius: 10rpx;
						font-size: 24rpx;
						white-space: nowrap;
						animation: fadeIn 0.3s ease;

						&:after {
							content: '';
							position: absolute;
							bottom: -10rpx;
							right: 50rpx;
							width: 0;
							height: 0;
							border-left: 10rpx solid transparent;
							border-right: 10rpx solid transparent;
							border-top: 10rpx solid rgba(0, 0, 0, 0.7);
						}

						@keyframes fadeIn {
							from {
								opacity: 0;
								transform: translateY(10rpx);
							}

							to {
								opacity: 1;
								transform: translateY(0);
							}
						}
					}
				}
			}

			.tag-row {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				gap: 16rpx;
				margin-bottom: 30rpx;

				.heritage-tag {
					padding: 10rpx 24rpx;
					background-color: rgba(139, 69, 19, 0.1);
					color: #8B4513;
					border-radius: 20rpx;
					font-size: 24rpx;
					transform: translateY(0);
					transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
					backdrop-filter: blur(5px);
					border: 1rpx solid rgba(255, 255, 255, 0.8);

					&.primary {
						background-color: rgba(139, 69, 19, 0.8);
						color: white;
					}

					&:active {
						transform: translateY(-6rpx);
						box-shadow: 0 6rpx 10rpx rgba(139, 69, 19, 0.1);
					}
				}
			}

			.heritage-info {
				display: flex;
				justify-content: space-between;
				margin-bottom: 50rpx;
				padding: 30rpx;
				background-color: rgba(249, 245, 240, 0.8);
				border-radius: 16rpx;
				box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03), 0 1rpx 4rpx rgba(0, 0, 0, 0.02);
				backdrop-filter: blur(5px);
				border: 1rpx solid rgba(255, 255, 255, 0.8);

				.info-item {
					text-align: center;
					position: relative;

					&:not(:last-child):after {
						content: '';
						position: absolute;
						right: -20rpx;
						top: 50%;
						transform: translateY(-50%);
						height: 60%;
						width: 1px;
						background: rgba(0, 0, 0, 0.1);
					}

					.info-icon {
						font-size: 36rpx;
						margin-bottom: 10rpx;
					}

					.label {
						font-size: 24rpx;
						color: #666;
						margin-bottom: 10rpx;
						display: block;
					}

					.value {
						font-size: 30rpx;
						color: #333;
						font-weight: 500;
					}
				}
			}

			.heritage-description {
				margin-bottom: 50rpx;

				.section-title {
					display: flex;
					align-items: center;
					margin-bottom: 30rpx;

					.title-text {
						font-size: 36rpx;
						font-weight: bold;
						color: #333;
						margin-right: 20rpx;
						position: relative;

						&:after {
							content: '';
							position: absolute;
							bottom: -8rpx;
							left: 0;
							width: 40rpx;
							height: 4rpx;
							background: linear-gradient(to right, #8B4513, transparent);
							border-radius: 2rpx;
						}
					}

					.title-line {
						flex: 1;
						height: 2rpx;
						background: linear-gradient(to right, #8B4513, transparent);
					}
				}

				.description-content {
					font-size: 30rpx;
					color: #666;
					line-height: 1.8;
					text-align: justify;
					max-height: 180rpx;
					overflow: hidden;
					transition: all 0.3s ease;
					background-color: rgba(249, 245, 240, 0.4);
					padding: 20rpx;
					border-radius: 16rpx;
					box-shadow: inset 0 0 10rpx rgba(0, 0, 0, 0.03);
					position: relative;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 9;

					&.expanded {
						-webkit-line-clamp: unset;
						max-height: none;
					}
				}

				.expand-btn {
					margin-top: 20rpx;
					text-align: center;
					color: #8B4513;
					font-size: 28rpx;
					padding: 10rpx 0;
					background-color: rgba(249, 245, 240, 0.8);
					border-radius: 10rpx;
					width: 200rpx;
					margin-left: auto;
					margin-right: auto;
					position: relative;

					&:active {
						opacity: 0.7;
					}

					.expand-icon {
						font-size: 24rpx;
						margin-left: 10rpx;
						transition: transform 0.3s;
						display: inline-block;

						&.up {
							transform: rotate(180deg);
						}
					}
				}
			}

			.heritage-features {
				margin-bottom: 50rpx;

				.feature-items {
					display: flex;
					justify-content: space-between;
					padding: 10rpx 0;

					.feature-item {
						width: 30%;
						background-color: rgba(249, 245, 240, 0.6);
						border-radius: 16rpx;
						padding: 30rpx 20rpx;
						text-align: center;
						box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
						transform: translateY(0);
						transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
						backdrop-filter: blur(5px);
						border: 1rpx solid rgba(255, 255, 255, 0.8);

						&:active {
							transform: translateY(-10rpx);
							box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
						}

						.feature-icon {
							font-size: 50rpx;
							margin-bottom: 20rpx;
						}

						.feature-text {
							font-size: 26rpx;
							color: #333;
							font-weight: 500;
						}
					}
				}
			}

			.heritage-rating {
				margin-bottom: 50rpx;

				.rating-container {
					background-color: #f9f5f0;
					border-radius: 16rpx;
					padding: 30rpx;

					.rating-stars {
						display: flex;
						align-items: center;
						margin-bottom: 30rpx;

						.star-row {
							display: flex;
							margin-right: 20rpx;
						}

						.star {
							font-size: 40rpx;
							color: #ddd;
							margin-right: 10rpx;

							&.active {
								color: #FFBB00;
							}
						}

						.rating-value {
							font-size: 36rpx;
							font-weight: bold;
							color: #333;
						}
					}

					.rating-bars {
						.rating-item {
							display: flex;
							align-items: center;
							margin-bottom: 20rpx;

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

								.rating-bar {
									height: 100%;
									background: linear-gradient(to right, #8B4513, #D2691E);
									border-radius: 5rpx;
								}
							}

							.rating-number {
								font-size: 26rpx;
								color: #333;
							}
						}
					}
				}
			}

			.nearby-heritage {
				.nearby-scroll {
					margin: 0 -30rpx;

					.nearby-items {
						display: flex;
						padding: 20rpx 30rpx;

						.nearby-item {
							margin-right: 30rpx;
							width: 220rpx;
							transform: scale(1);
							transition: transform 0.3s ease;

							&:active {
								transform: scale(0.95);
							}

							.nearby-image-container {
								position: relative;
								width: 220rpx;
								height: 160rpx;
								border-radius: 12rpx;
								overflow: hidden;
								margin-bottom: 12rpx;
								box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

								.nearby-image {
									width: 100%;
									height: 100%;
									object-fit: cover;
								}

								.nearby-overlay {
									position: absolute;
									left: 0;
									top: 0;
									right: 0;
									bottom: 0;
									background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3));
								}
							}

							.nearby-name {
								font-size: 26rpx;
								color: #333;
								white-space: nowrap;
								text-overflow: ellipsis;
								overflow: hidden;
								display: block;
							}

							.nearby-distance {
								font-size: 22rpx;
								color: #8B4513;
							}
						}
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
			justify-content: space-between;
			align-items: center;
			backdrop-filter: blur(10px);
			box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
			z-index: 5;
			background-color: rgba(255, 255, 255, 0.9);

			button {
				// width: 200rpx;
				// height: 80rpx;
				border-radius: 40rpx;
				font-size: 28rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				transition: all 0.2s ease;
				border: none;

				&:active {
					transform: scale(0.95);
				}

				.button-icon {
					font-size: 32rpx;
					margin-right: 10rpx;
				}
			}

			.ar-btn {
				background: linear-gradient(to right, #D2691E, #8B4513);
				color: white;
				font-weight: 500;
				box-shadow: 0 6rpx 12rpx rgba(139, 69, 19, 0.2);
			}

			.map-btn {
				background-color: rgba(139, 69, 19, 0.1);
				color: #8B4513;
				font-weight: 500;
			}
		}

		.map-popup {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 100;
			display: flex;
			justify-content: center;
			align-items: center;

			.map-container {
				width: 90%;
				height: 80%;
				background-color: #fff;
				border-radius: 20rpx;
				overflow: hidden;
				display: flex;
				flex-direction: column;
				box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);

				.map-header {
					height: 100rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 0 30rpx;
					border-bottom: 1rpx solid #f0f0f0;

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

						&:active {
							background-color: #e0e0e0;
						}
					}
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

						&:active {
							transform: scale(0.98);
						}
					}
				}
			}
		}
	}
</style>