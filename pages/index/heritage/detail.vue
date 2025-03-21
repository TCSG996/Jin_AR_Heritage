<template>
	<view class="detail-container">
		<!-- 页面背景装饰 -->
		<view class="page-header">
			<image class="header-image" :src="detail.image || '/static/spot-default.png'" mode="aspectFill"></image>
			<view class="header-gradient"></view>
			
			<!-- 顶部工具栏 -->
			<view class="header-toolbar" :style="{paddingTop: statusBarHeight + 'px'}">
				<view class="back-btn" @tap="goBack">
					<view class="back-icon"></view>
					<text>返回</text>
				</view>
				<view class="action-buttons">
					<view class="toolbar-btn collect-btn" @tap="toggleCollect">
						<uni-icons :type="isCollected ? 'star-filled' : 'star'" size="22" color="#FFFFFF"></uni-icons>
					</view>
					<view class="toolbar-btn share-btn" @tap="shareHeritage">
						<uni-icons type="redo" size="22" color="#FFFFFF"></uni-icons>
					</view>
				</view>
			</view>
			
			<!-- 标题信息 -->
			<view class="header-info">
				<view class="header-tag">文物景点</view>
				<view class="header-title">{{detail.name}}</view>
				<view class="header-meta">
					<view class="rating-stars">
						<uni-icons type="star-filled" size="16" color="#FFD700"></uni-icons>
						<uni-icons type="star-filled" size="16" color="#FFD700"></uni-icons>
						<uni-icons type="star-filled" size="16" color="#FFD700"></uni-icons>
						<uni-icons type="star-filled" size="16" color="#FFD700"></uni-icons>
						<uni-icons type="star-half" size="16" color="#FFD700"></uni-icons>
					</view>
					<text class="rating-value">{{detail.rating}}</text>
					<text class="rating-count">({{detail.ratingCount}}条评价)</text>
				</view>
				<view class="header-quick-info">
					<view class="quick-info-item" @tap="viewLocation">
						<uni-icons type="location" size="16" color="#FFFFFF"></uni-icons>
						<text>{{detail.location}}</text>
					</view>
					<view class="quick-info-item">
						<uni-icons type="calendar" size="16" color="#FFFFFF"></uni-icons>
						<text>建于{{detail.foundYear}}</text>
					</view>
				</view>
			</view>
			
			<!-- 波浪形装饰 -->
			<view class="header-wave"></view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 景点详情内容 -->
		<scroll-view v-else class="detail-scroll" scroll-y="true">
			<!-- 信息卡片 -->
			<view class="detail-card">
				<!-- 地址信息 -->
				<view class="info-section">
					<view class="section-title">
						<view class="title-icon location-icon"></view>
						<text>景点位置</text>
					</view>
					<view class="section-content location-content" @tap="viewLocation">
						<text>{{detail.location}}</text>
						<view class="location-action">
							<text>查看地图</text>
							<uni-icons type="right" size="14" color="#8B4513"></uni-icons>
						</view>
					</view>
				</view>
				
				<!-- 简介 -->
				<view class="info-section">
					<view class="section-title">
						<view class="title-icon intro-icon"></view>
						<text>文物简介</text>
					</view>
					<view class="section-content">
						<text class="heritage-desc" :class="{'expanded': descExpanded}" @tap="toggleDesc">{{detail.description}}</text>
						<view class="expand-btn" @tap="toggleDesc">
							<text>{{descExpanded ? '收起' : '展开全部'}}</text>
							<uni-icons :type="descExpanded ? 'top' : 'bottom'" size="14" color="#8B4513"></uni-icons>
						</view>
					</view>
				</view>
				
				<!-- 图片集 -->
				<view class="info-section" v-if="detail.images && detail.images.length > 0">
					<view class="section-title">
						<view class="title-icon gallery-icon"></view>
						<text>景点图集</text>
					</view>
					<scroll-view class="gallery-scroll" scroll-x="true" show-scrollbar="false">
						<view class="gallery-container">
							<view class="gallery-item" v-for="(img, index) in detail.images" :key="index" @tap="previewImage(index)">
								<image :src="img" mode="aspectFill"></image>
							</view>
						</view>
					</scroll-view>
				</view>
				
				<!-- 景点特色 -->
				<view class="info-section">
					<view class="section-title">
						<view class="title-icon feature-icon"></view>
						<text>文物特色</text>
					</view>
					<view class="section-content">
						<view class="feature-item" v-for="(feature, index) in detail.features" :key="index">
							<view class="feature-title">{{feature.title}}</view>
							<view class="feature-description">{{feature.description}}</view>
						</view>
					</view>
				</view>
				
				<!-- 游客数据 -->
				<view class="info-section visitors-section">
					<view class="visitor-item">
						<text class="visitor-count">{{detail.monthlyCounts.length}}人</text>
						<text class="visitor-label">月访问量</text>
					</view>
					<view class="visitor-item">
						<text class="visitor-count">{{detail.foundYear}}</text>
						<text class="visitor-label">建成年份</text>
					</view>
					<view class="visitor-item">
						<text class="visitor-count">{{detail.popularity}}%</text>
						<text class="visitor-label">游客满意度</text>
					</view>
				</view>
			</view>
			
			<!-- 相关推荐 -->
			<view class="related-section" v-if="relatedItems.length > 0">
				<view class="section-header">
					<text>相关推荐</text>
					<view class="header-decor"></view>
				</view>
				
				<view class="related-list">
					<view class="related-item" v-for="(item, index) in relatedItems" :key="index" @tap="viewRelatedItem(item)">
						<image :src="item.image" mode="aspectFill"></image>
						<view class="related-info">
							<text class="related-name">{{item.name}}</text>
							<view class="related-meta">
								<view class="related-rating">
									<uni-icons type="star-filled" size="12" color="#FFD700"></uni-icons>
									<text>{{item.rating}}</text>
								</view>
								<text class="related-distance">{{item.distance}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部装饰 -->
			<view class="bottom-space"></view>
		</scroll-view>
		
		<!-- 底部操作栏 -->
		<view class="action-bar">
			<view class="action-btn share-btn" @tap="shareHeritage">
				<uni-icons type="redo" size="20" color="#8B4513"></uni-icons>
				<text>分享</text>
			</view>
			<view class="action-btn collect-btn" @tap="toggleCollect">
				<uni-icons :type="isCollected ? 'star-filled' : 'star'" size="20" :color="isCollected ? '#FFD700' : '#8B4513'"></uni-icons>
				<text>{{isCollected ? '已收藏' : '收藏'}}</text>
			</view>
			<view class="action-btn ar-btn" @tap="viewAR">
				<uni-icons type="eye-filled" size="20" color="#FFFFFF"></uni-icons>
				<text>AR体验</text>
			</view>
		</view>
	</view>
</template>

<script>
	import api from '@/api/index.js';
	
	export default {
		data() {
			return {
				statusBarHeight: 0,
				heritageId: null,
				isLoading: true,
				descExpanded: false,
				isCollected: false,
				baseURL: 'http://192.168.194.9:8080',
				detail: {
					id: 0,
					name: '',
					description: '',
					image: '',
					location: '',
					rating: 0,
					ratingCount: 0,
					monthlyCounts: [],
					foundYear: '',
					popularity: 0,
					images: [],
					features: []
				},
				relatedItems: [],
				isShowDesc: false
			};
		},
		onLoad(option) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			
			// 获取传入的景点ID
			if (option && option.id) {
				this.heritageId = parseInt(option.id);
				this.fetchHeritageDetail(this.heritageId);
				this.checkCollectionStatus(this.heritageId);
			} else {
				uni.showToast({
					title: '参数无效',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},
		methods: {
			// 获取景点详情
			fetchHeritageDetail(id) {
				this.isLoading = true;
				
				// 使用与more.vue页面相同的默认图片
				const defaultImage = '/static/spot-default.png';
				
				// 调用API获取数据
				api.user.home()
					.then(response => {
						console.log('API响应数据:', response);
						
						if (response.code === 200 || response.code === 0) {
							// 从featuredBuildings数组中查找对应ID的景点
							const buildings = response.data?.featuredBuildings || [];
							const building = buildings.find(item => Number(item.id) === Number(id));
							
							if (building) {
								// 确保图片路径有效，处理不同情况的URL
								let imageUrl = defaultImage;
								
								if (building.arModelUrl) {
									// 如果已经是绝对URL
									if (building.arModelUrl.startsWith('http')) {
										imageUrl = building.arModelUrl;
									}
									// 如果是相对路径
									else {
										imageUrl = `${this.baseURL}${building.arModelUrl}`;
									}
								}
								
								// 设置景点详情信息
								this.detail = {
									id: building.id,
									name: building.name,
									description: building.description || '这是一座历史悠久的古建筑，具有典型的晋派建筑风格。建筑结构精巧，工艺精湛，是研究中国古代建筑艺术和历史文化的重要实例。',
									image: imageUrl,
									location: building.location || '山西省太原市',
									rating: ((Math.random() * 0.5) + 4.5).toFixed(1),
									ratingCount: Math.floor(Math.random() * 500) + 300,
									monthlyCounts: [1200, 1400, 1800, 2000, 2200, 2500, 3000, 3200, 2800, 2600, 2400, 2000],
									foundYear: `${Math.floor(Math.random() * 500) + 1000}年`,
									popularity: Math.floor(Math.random() * 10) + 90,
									images: [
										imageUrl,
										defaultImage,
										defaultImage,
										defaultImage
									],
									features: [
										{
											title: '历史价值',
											description: '见证了中国北方地区建筑风格的发展变迁，是研究传统建筑工艺的重要实物资料。'
										},
										{
											title: '艺术价值',
											description: '建筑装饰精美，木雕、砖雕和彩绘艺术水平高超，展现了古代工匠的卓越技艺。'
										},
										{
											title: '文化价值',
											description: '蕴含丰富的历史文化信息，对研究古代社会生活和民俗文化具有重要意义。'
										}
									]
								};
								
								// 生成相关景点推荐
								this.relatedItems = buildings
									.filter(item => Number(item.id) !== Number(id))
									.slice(0, 3)
									.map(item => {
										// 确保图片路径有效
										let itemImage = defaultImage;
										if (item.arModelUrl) {
											if (item.arModelUrl.startsWith('http')) {
												itemImage = item.arModelUrl;
											} else {
												itemImage = `${this.baseURL}${item.arModelUrl}`;
											}
										}
										
										return {
											id: item.id,
											name: item.name,
											image: itemImage,
											rating: ((Math.random() * 0.5) + 4.5).toFixed(1),
											distance: `${(Math.random() * 10 + 1).toFixed(1)}公里`
										};
									});
							} else {
								uni.showToast({
									title: '未找到景点信息',
									icon: 'none'
								});
								setTimeout(() => {
									this.goBack();
								}, 1500);
							}
						} else {
							uni.showToast({
								title: response.msg || '获取数据失败',
								icon: 'none'
							});
						}
					})
					.catch(error => {
						console.error('请求数据出错:', error);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					})
					.finally(() => {
						this.isLoading = false;
					});
			},
			// 切换收藏状态
			toggleCollect() {
				try {
					// 获取已收藏的列表
					let collectionList = uni.getStorageSync('collections') || [];
					if (!Array.isArray(collectionList)) {
						collectionList = [];
					}
					
					// 判断是否已收藏
					const index = collectionList.findIndex(item => item.id === this.detail.id);
					
					if (index === -1) {
						// 添加到收藏
						collectionList.push({
							id: this.detail.id,
							name: this.detail.name,
							image: this.detail.image,
							timestamp: Date.now()
						});
						
						this.isCollected = true;
						uni.showToast({
							title: '收藏成功',
							icon: 'success'
						});
					} else {
						// 取消收藏
						collectionList.splice(index, 1);
						this.isCollected = false;
						uni.showToast({
							title: '已取消收藏',
							icon: 'none'
						});
					}
					
					// 保存更新后的收藏列表
					uni.setStorageSync('collections', collectionList);
				} catch (e) {
					console.error('收藏操作失败:', e);
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					});
				}
			},
			// 检查收藏状态
			checkCollectionStatus(id) {
				try {
					const collectionList = uni.getStorageSync('collections') || [];
					const isFound = collectionList.some(item => item.id === id);
					this.isCollected = isFound;
				} catch (e) {
					console.error('检查收藏状态失败:', e);
					this.isCollected = false;
				}
			},
			// 分享景点
			shareHeritage() {
				const title = this.detail.name;
				const summary = this.detail.description.substring(0, 50) + '...';
				const imageUrl = this.detail.image;
				const path = `/pages/index/heritage/detail?id=${this.detail.id}`;
				
				// 真机环境
				if (typeof plus !== 'undefined') {
					plus.share.sendWithSystem({
						type: 'web',
						title: title,
						href: path,
						pictures: [imageUrl],
						summary: summary
					}, function() {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						});
					}, function(e) {
						uni.showToast({
							title: '分享失败',
							icon: 'none'
						});
						console.error('分享失败: ' + JSON.stringify(e));
					});
				} else {
					// 开发环境
					uni.showModal({
						title: '分享',
						content: `分享"${title}"到社交媒体`,
						success: function(res) {
							if (res.confirm) {
								uni.showToast({
									title: '分享成功(模拟)',
									icon: 'success'
								});
							}
						}
					});
				}
			},
			// 查看位置
			viewLocation() {
				uni.showToast({
					title: '正在打开地图...',
					icon: 'none'
				});
				// 这里应该打开地图并定位到景点位置
			},
			// 预览图片
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.detail.images,
					indicator: 'number',
					loop: true
				});
			},
			// 返回
			goBack() {
				console.log('返回按钮被点击');
				// 显示点击反馈
				uni.showToast({
					title: '正在返回...',
					icon: 'none',
					duration: 300
				});
				// 返回上一页
				setTimeout(() => {
					uni.navigateBack({
						delta: 1,
						fail: function() {
							// 如果返回失败，可能是没有上一页，则跳转到首页
							uni.switchTab({
								url: '/pages/index/index'
							});
						}
					});
				}, 200);
			},
			// 切换描述展开/收起
			toggleDesc() {
				this.descExpanded = !this.descExpanded;
			},
			// 查看AR
			viewAR() {
				uni.showToast({
					title: '正在打开AR体验...',
					icon: 'none'
				});
				// 这里应该跳转到AR体验页面
				// uni.navigateTo({
				//     url: `/pages/ar/viewer?id=${this.detail.id}`
				// });
			},
			// 查看相关景点
			viewRelatedItem(item) {
				uni.navigateTo({
					url: `/pages/index/heritage/detail?id=${item.id}`
				});
			}
		}
	}
</script>

<style lang="scss">
	.detail-container {
		min-height: 100vh;
		background-color: #f8f4eb;
		position: relative;
		
		// 页面背景装饰
		.page-header {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 460rpx;
			overflow: hidden;
			z-index: 5;
			
			.header-image {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
			
			.header-gradient {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(to bottom, 
					rgba(0, 0, 0, 0.2), 
					rgba(0, 0, 0, 0.5) 70%, 
					rgba(0, 0, 0, 0.7) 100%);
			}
			
			.header-toolbar {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 30rpx;
				z-index: 10;
				height: 100rpx;
				pointer-events: auto;
				
				.back-btn {
					display: flex;
					align-items: center;
					padding: 12rpx 24rpx;
					border-radius: 50rpx;
					background: rgba(0, 0, 0, 0.3);
					backdrop-filter: blur(10px);
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
					transition: all 0.25s ease;
					pointer-events: auto;
					
					&:active {
						transform: scale(0.95);
						background: rgba(0, 0, 0, 0.4);
					}
					
					.back-icon {
						width: 34rpx;
						height: 34rpx;
						position: relative;
						
						&::before, &::after {
							content: '';
							position: absolute;
							left: 10rpx;
							width: 20rpx;
							height: 3rpx;
							background-color: #ffffff;
							border-radius: 4rpx;
						}
						
						&::before {
							top: 10rpx;
							transform: rotate(-45deg);
						}
						
						&::after {
							bottom: 10rpx;
							transform: rotate(45deg);
						}
					}
					
					text {
						font-size: 28rpx;
						color: rgba(255, 255, 255, 0.95);
						letter-spacing: 2rpx;
						margin-left: 6rpx;
					}
				}
				
				.action-buttons {
					display: flex;
					align-items: center;
					gap: 20rpx;
					
					.toolbar-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 70rpx;
						height: 70rpx;
						border-radius: 50%;
						background: rgba(0, 0, 0, 0.3);
						backdrop-filter: blur(10px);
						box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
						transition: all 0.25s ease;
						pointer-events: auto;
						
						&:active {
							transform: scale(0.92);
							background: rgba(0, 0, 0, 0.4);
						}
					}
				}
			}
			
			.header-info {
				position: absolute;
				bottom: 90rpx;
				left: 40rpx;
				right: 40rpx;
				z-index: 2;
				
				.header-tag {
					display: inline-block;
					font-size: 24rpx;
					font-weight: bold;
					color: #ffffff;
					background-color: rgba(139, 69, 19, 0.8);
					padding: 6rpx 16rpx;
					border-radius: 6rpx;
					margin-bottom: 16rpx;
					text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
				}
				
				.header-title {
					font-size: 48rpx;
					font-weight: bold;
					color: #ffffff;
					margin-bottom: 16rpx;
					text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
					letter-spacing: 2rpx;
				}
				
				.header-meta {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					.rating-stars {
						display: flex;
						align-items: center;
						
						uni-icons {
							margin-right: 4rpx;
						}
					}
					
					.rating-value {
						font-size: 30rpx;
						font-weight: bold;
						color: #ffffff;
						margin: 0 12rpx;
					}
					
					.rating-count {
						font-size: 24rpx;
						color: rgba(255, 255, 255, 0.8);
					}
				}
				
				.header-quick-info {
					display: flex;
					align-items: center;
					gap: 30rpx;
					margin-top: 20rpx;
					
					.quick-info-item {
						display: flex;
						align-items: center;
						font-size: 26rpx;
						color: #ffffff;
						background-color: rgba(0, 0, 0, 0.25);
						padding: 8rpx 20rpx;
						border-radius: 50rpx;
						backdrop-filter: blur(10px);
						
						text {
							margin-left: 8rpx;
						}
						
						&:active {
							background-color: rgba(0, 0, 0, 0.35);
						}
					}
				}
			}
			
			.header-wave {
				position: absolute;
				bottom: -2rpx;
				left: 0;
				right: 0;
				height: 40rpx;
				background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="white" fill-opacity="1" d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,128C840,128,960,160,1080,176C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>');
				background-size: cover;
				background-position: center;
			}
		}
		
		// 加载状态
		.loading-container {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			background-color: #f8f4eb;
			z-index: 20;
			
			.loading-spinner {
				width: 60rpx;
				height: 60rpx;
				border: 5rpx solid rgba(139, 69, 19, 0.2);
				border-top-color: rgba(139, 69, 19, 0.8);
				border-radius: 50%;
				margin-bottom: 30rpx;
				animation: spin 1.2s linear infinite;
			}
			
			.loading-text {
				font-size: 28rpx;
				color: #8B4513;
			}
		}
		
		// 详情滚动区域
		.detail-scroll {
			position: relative;
			flex: 1;
			width: 100%;
			height: calc(100vh - 100rpx); // 减去底部操作栏高度
			z-index: 2;
			padding-top: 460rpx; // 添加顶部边距，避免内容被头部遮挡
			
			// 详情卡片区域
			.detail-card {
				padding: 20rpx 30rpx;
				background-color: #ffffff;
				border-radius: 30rpx 30rpx 0 0;
				position: relative;
				z-index: 3;
				box-shadow: 0 -6rpx 20rpx rgba(0, 0, 0, 0.08);
				min-height: calc(100vh - 460rpx); // 确保内容区域足够高
				
				// 添加中国风纹理背景
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-image: 
						repeating-linear-gradient(45deg, 
							rgba(139, 69, 19, 0.02) 0px, 
							rgba(139, 69, 19, 0.02) 2px, 
							transparent 2px, 
							transparent 12px);
					opacity: 0.5;
					border-radius: 30rpx 30rpx 0 0;
					z-index: -1;
				}
				
				// 信息区块
				.info-section {
					margin-bottom: 50rpx;
					
					.section-title {
						display: flex;
						align-items: center;
						margin-bottom: 20rpx;
						
						.title-icon {
							width: 36rpx;
							height: 36rpx;
							margin-right: 14rpx;
							background-size: contain;
							background-repeat: no-repeat;
							background-position: center;
							display: flex;
							align-items: center;
							justify-content: center;
							border-radius: 50%;
						}
						
						.location-icon {
							/* 删除对外部图片的依赖 */
							/*background-image: url('/static/icons/location.png');*/
							background-color: rgba(139, 69, 19, 0.1);
							position: relative;
							/* 使用CSS创建图标 */
							&::before {
								content: '';
								width: 14rpx;
								height: 14rpx;
								background-color: #8B4513;
								border-radius: 50%;
								position: absolute;
							}
							&::after {
								content: '';
								width: 24rpx;
								height: 24rpx;
								border: 2rpx solid #8B4513;
								border-radius: 50%;
							}
						}
						
						.intro-icon {
							/* 删除对外部图片的依赖 */
							/*background-image: url('/static/icons/info.png');*/
							background-color: rgba(139, 69, 19, 0.1);
							position: relative;
							/* 使用CSS创建图标 */
							&::before {
								content: 'i';
								font-style: italic;
								font-weight: bold;
								color: #8B4513;
								font-size: 24rpx;
							}
						}
						
						.gallery-icon {
							/* 删除对外部图片的依赖 */
							/*background-image: url('/static/icons/gallery.png');*/
							background-color: rgba(139, 69, 19, 0.1);
							position: relative;
							/* 使用CSS创建图标 */
							&::before {
								content: '';
								width: 20rpx;
								height: 16rpx;
								border: 2rpx solid #8B4513;
								position: absolute;
								background-color: rgba(139, 69, 19, 0.1);
							}
							&::after {
								content: '';
								width: 16rpx;
								height: 12rpx;
								border: 2rpx solid #8B4513;
								position: absolute;
								background-color: rgba(139, 69, 19, 0.2);
								top: 4rpx;
								left: 4rpx;
							}
						}
						
						.feature-icon {
							/* 删除对外部图片的依赖 */
							/*background-image: url('/static/icons/feature.png');*/
							background-color: rgba(139, 69, 19, 0.1);
							position: relative;
							/* 使用CSS创建图标 */
							&::before {
								content: '✓';
								color: #8B4513;
								font-size: 24rpx;
								font-weight: bold;
							}
						}
						
						text {
							font-size: 32rpx;
							font-weight: 600;
							color: #333;
							position: relative;
							
							&::after {
								content: '';
								position: absolute;
								bottom: -6rpx;
								left: 0;
								width: 40rpx;
								height: 4rpx;
								background: linear-gradient(to right, #8B4513, transparent);
								border-radius: 2rpx;
							}
						}
					}
					
					.section-content {
						font-size: 28rpx;
						color: #666;
						line-height: 1.6;
					}
					
					// 地址内容样式
					.location-content {
						display: flex;
						justify-content: space-between;
						align-items: center;
						background-color: rgba(139, 69, 19, 0.05);
						padding: 20rpx 24rpx;
						border-radius: 16rpx;
						
						.location-action {
							display: flex;
							align-items: center;
							font-size: 26rpx;
							color: #8B4513;
							
							text {
								margin-right: 8rpx;
							}
						}
					}
					
					// 描述内容样式
					.heritage-desc {
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 3;
						overflow: hidden;
						
						&.expanded {
							-webkit-line-clamp: initial;
						}
					}
					
					.expand-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						margin-top: 16rpx;
						font-size: 26rpx;
						color: #8B4513;
						
						text {
							margin-right: 8rpx;
						}
					}
					
					// 图片集样式
					.gallery-scroll {
						width: 100%;
						white-space: nowrap;
						
						.gallery-container {
							display: inline-flex;
							padding: 10rpx 0;
							
							.gallery-item {
								width: 240rpx;
								height: 160rpx;
								margin-right: 20rpx;
								border-radius: 16rpx;
								overflow: hidden;
								box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
								
								image {
									width: 100%;
									height: 100%;
									object-fit: cover;
								}
								
								&:last-child {
									margin-right: 0;
								}
							}
						}
					}
					
					// 特色列表样式
					.feature-item {
						display: flex;
						flex-direction: column;
						margin-bottom: 24rpx;
						padding: 16rpx 20rpx;
						background-color: rgba(139, 69, 19, 0.05);
						border-radius: 12rpx;
						border-left: 6rpx solid #8B4513;
						
						.feature-dot {
							display: none;
						}
						
						.feature-title {
							font-size: 28rpx;
							font-weight: 600;
							color: #8B4513;
							margin-bottom: 8rpx;
						}
						
						.feature-description {
							font-size: 26rpx;
							color: #666;
							line-height: 1.5;
						}
					}
				}
				
				// 游客数据区域
				.visitors-section {
					display: flex;
					justify-content: space-around;
					background-color: rgba(139, 69, 19, 0.05);
					border-radius: 20rpx;
					padding: 30rpx 0;
					margin-bottom: 0;
					
					.visitor-item {
						display: flex;
						flex-direction: column;
						align-items: center;
						
						.visitor-count {
							font-size: 36rpx;
							font-weight: bold;
							color: #8B4513;
							margin-bottom: 10rpx;
						}
						
						.visitor-label {
							font-size: 24rpx;
							color: #666;
						}
					}
				}
			}
			
			// 相关推荐区域
			.related-section {
				margin: 50rpx 30rpx;
				
				.section-header {
					display: flex;
					align-items: center;
					margin-bottom: 30rpx;
					
					text {
						font-size: 34rpx;
						font-weight: 600;
						color: #333;
						margin-right: 20rpx;
					}
					
					.header-decor {
						flex: 1;
						height: 1px;
						background: linear-gradient(to right, #8B4513, transparent);
					}
				}
				
				.related-list {
					.related-item {
						display: flex;
						background-color: #ffffff;
						box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
						border-radius: 20rpx;
						padding: 20rpx;
						margin-bottom: 24rpx;
						
						image {
							width: 160rpx;
							height: 120rpx;
							border-radius: 12rpx;
							margin-right: 20rpx;
							object-fit: cover;
						}
						
						.related-info {
							flex: 1;
							display: flex;
							flex-direction: column;
							justify-content: space-between;
							
							.related-name {
								font-size: 28rpx;
								font-weight: 600;
								color: #333;
							}
							
							.related-meta {
								display: flex;
								align-items: center;
								justify-content: space-between;
								
								.related-rating {
									display: flex;
									align-items: center;
									
									text {
										font-size: 24rpx;
										color: #666;
										margin-left: 6rpx;
									}
								}
								
								.related-distance {
									font-size: 24rpx;
									color: #8B4513;
								}
							}
						}
					}
				}
			}
			
			.bottom-space {
				height: 120rpx;
			}
		}
		
		// 底部操作栏
		.action-bar {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			height: 100rpx;
			background-color: #ffffff;
			display: flex;
			align-items: center;
			box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
			z-index: 10;
			
			.action-btn {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				height: 100%;
				
				text {
					font-size: 24rpx;
					margin-top: 6rpx;
					color: #666;
				}
				
				&.ar-btn {
					flex: 1.5;
					background: linear-gradient(135deg, #8B4513, #D2691E);
					margin: 10rpx 30rpx;
					border-radius: 50rpx;
					box-shadow: 0 6rpx 16rpx rgba(139, 69, 19, 0.2);
					
					text {
						color: #FFFFFF;
						font-weight: 500;
					}
				}
				
				&:active {
					opacity: 0.8;
				}
			}
		}
	}
	
	// 动画
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
