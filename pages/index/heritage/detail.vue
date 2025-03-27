<template>
	<view class="heritage-detail-page">
		<!-- 顶部图片区域 -->
		<view class="header-section">
			<image class="header-image" :src="detail.image" mode="aspectFill"></image>
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
					<view class="action-btn collect-btn" @tap="toggleCollect">
						<text class="icon-star" :class="{'filled': isCollected}">♥</text>
					</view>
					<view class="action-btn share-btn" @tap="shareHeritage">
						<text class="icon-share">⊕</text>
					</view>
				</view>
			</view>
			
			<!-- 标题信息区域 -->
			<view class="header-info">
				<view class="header-category">{{detail.category || '文物景点'}}</view>
				<view class="header-title">{{detail.name}}</view>
				<view class="header-period">{{detail.period}}</view>
				<view class="header-location" @tap="viewLocation">
					<text class="location-icon">📍</text>
					<text class="location-text">{{detail.location}}</text>
				</view>
			</view>
			
			<!-- 波浪形装饰 -->
			<view class="header-wave"></view>
		</view>
		
		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y="true" :bounces="false" enhanced>
			<!-- 描述卡片 -->
			<view class="content-card">
				<view class="section description-section">
					<view class="section-header">
						<view class="section-title">
							<view class="title-decoration"></view>
							<text>文物简介</text>
						</view>
					</view>
					<view class="section-content">
						<text class="description-text" :class="{'expanded': descExpanded}">{{detail.description}}</text>
						<view class="expand-btn" @tap="toggleDesc">
							<text>{{descExpanded ? '收起' : '展开'}}</text>
							<text class="expand-icon">{{descExpanded ? '↑' : '↓'}}</text>
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
						<view class="feature-tag">建于{{detail.period}}</view>
						<view class="feature-tag">{{detail.category}}类别</view>
						<view class="feature-tag">国家一级文物</view>
						<view class="feature-tag">可AR体验</view>
					</view>
				</view>
				
				<!-- 图片区域 -->
				<view class="section gallery-section" v-if="galleryImages.length > 0">
					<view class="section-header">
						<view class="section-title">
							<view class="title-decoration"></view>
							<text>实景图集</text>
						</view>
						<view class="view-all" @tap="viewAllImages">
							<text>查看全部</text>
							<text class="arrow-icon">›</text>
						</view>
					</view>
					<scroll-view class="gallery-scroll" scroll-x="true" :show-scrollbar="false" enhanced>
						<view class="gallery-items">
							<view 
								class="gallery-item" 
								v-for="(img, index) in galleryImages" 
								:key="index"
								@tap="previewImage(index)"
							>
								<image :src="img" mode="aspectFill"></image>
								<view class="item-overlay"></view>
							</view>
						</view>
					</scroll-view>
				</view>
				
				<!-- 相关推荐 -->
				<view class="section related-section">
					<view class="section-header">
						<view class="section-title">
							<view class="title-decoration"></view>
							<text>相关文物</text>
						</view>
					</view>
					<view class="related-items">
						<view 
							class="related-item" 
							v-for="(item, index) in relatedItems" 
							:key="index"
							@tap="viewRelatedItem(item)"
						>
							<view class="item-image-container">
								<image :src="item.image" mode="aspectFill"></image>
								<view class="item-overlay"></view>
							</view>
							<view class="item-info">
								<text class="item-name">{{item.name}}</text>
								<text class="item-period">{{item.period}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部安全区域 -->
			<view class="safe-area-bottom"></view>
		</scroll-view>
		
		<!-- 底部AR体验按钮 -->
		<view class="bottom-action">
			<view class="ar-button" @tap="viewAR">
				<text class="ar-icon">AR</text>
				<text class="ar-text">体验此文物</text>
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
	import { heritageList } from './mock.js'
	
	export default {
		data() {
			return {
				statusBarHeight: 20,
				heritageId: null,
				isLoading: true,
				descExpanded: false,
				isCollected: false,
				detail: {},
				relatedItems: [],
				galleryImages: []
			};
		},
		computed: {
			// 计算相关文物，获取同类别的最多4个文物
			computedRelatedItems() {
				if (!this.detail || !this.detail.category) return [];
				
				return heritageList
					.filter(item => 
						item.category === this.detail.category && 
						item.id !== this.detail.id
					)
					.slice(0, 4);
			}
		},
		onLoad(option) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			
			// 获取传入的文物ID
			if (option && option.id) {
				console.log('接收到ID参数:', option.id, '类型:', typeof option.id);
				// 保存原始ID字符串
				const originalId = option.id;
				// 尝试转换为数字
				this.heritageId = parseInt(option.id);
				
				// 如果转换失败（NaN），则使用原始ID
				if (isNaN(this.heritageId)) {
					this.heritageId = originalId;
				}
				
				console.log('处理后ID:', this.heritageId, '类型:', typeof this.heritageId);
				this.fetchHeritageDetail();
				this.checkCollectionStatus();
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
			// 获取文物详情
			fetchHeritageDetail() {
				this.isLoading = true;
				
				// 从mock数据获取文物详情
				setTimeout(() => {
					let item;
					
					// 先尝试精确类型匹配
					item = heritageList.find(h => h.id === this.heritageId);
					
					// 如果没找到，尝试字符串比较
					if (!item) {
						item = heritageList.find(h => String(h.id) === String(this.heritageId));
					}
					
					// 如果仍然没找到，尝试数字比较
					if (!item) {
						const numericId = parseInt(this.heritageId);
						if (!isNaN(numericId)) {
							item = heritageList.find(h => {
								const hId = parseInt(h.id);
								return !isNaN(hId) && hId === numericId;
							});
						}
					}
					
					if (item) {
						this.detail = {...item};
						
						// 生成图集 - 实际项目中这应该从API获取
						this.galleryImages = [
							this.detail.image,
							// 添加几个模拟图片
							'https://tse1-mm.cn.bing.net/th/id/OIP-C.92RfCiBBxLcASR6CJ0GdXgHaEb?w=282&h=180&c=7&r=0&o=5&pid=1.7',
							'https://tse2-mm.cn.bing.net/th/id/OIP-C.RR7H1OfckA28aB1uq0n6bQHaE8?w=227&h=180&c=7&r=0&o=5&pid=1.7',
							'https://tse3-mm.cn.bing.net/th/id/OIP-C.db3MOrsKiJHGp7dvizGrtAHaFj?w=232&h=180&c=7&r=0&o=5&pid=1.7'
						];
						
						// 获取相关文物
						this.relatedItems = this.computedRelatedItems;
						
						this.isLoading = false;
					} else {
						uni.showToast({
							title: '文物不存在',
							icon: 'none'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				}, 800);
			},
			
			// 返回按钮
			goBack() {
				uni.navigateBack();
			},
			
			// 切换描述展开状态
			toggleDesc() {
				this.descExpanded = !this.descExpanded;
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
				}
			},
			
			// 检查收藏状态
			checkCollectionStatus() {
				try {
					const collectionList = uni.getStorageSync('collections') || [];
					this.isCollected = collectionList.some(item => item.id === this.heritageId);
				} catch (e) {
					console.error('检查收藏状态失败:', e);
					this.isCollected = false;
				}
			},
			
			// 分享文物
			shareHeritage() {
				uni.showToast({
					title: '分享功能开发中',
					icon: 'none'
				});
			},
			
			// 查看位置
			viewLocation() {
				uni.showToast({
					title: '位置查看功能开发中',
					icon: 'none'
				});
			},
			
			// 预览图片
			previewImage(index) {
				uni.previewImage({
					urls: this.galleryImages,
					current: index
				});
			},
			
			// 查看所有图片
			viewAllImages() {
				this.previewImage(0);
			},
			
			// AR查看体验
			viewAR() {
				uni.showToast({
					title: 'AR体验功能开发中',
					icon: 'none'
				});
			},
			
			// 查看相关文物
			viewRelatedItem(item) {
				uni.navigateTo({
					url: `./detail?id=${item.id}`
				});
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

.view-all {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #8B4513;
}

.arrow-icon {
  margin-left: 5rpx;
  font-size: 26rpx;
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

/* 图片区域 */
.gallery-scroll {
  width: 100%;
  white-space: nowrap;
}

.gallery-items {
  display: inline-flex;
  padding: 10rpx 0;
}

.gallery-item {
  width: 240rpx;
  height: 180rpx;
  border-radius: 15rpx;
  overflow: hidden;
  margin-right: 20rpx;
  position: relative;
  
  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.5));
  }
  
  &:active {
    image {
      transform: scale(1.05);
    }
  }
}

/* 相关推荐 */
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

/* 底部AR体验按钮 */
.bottom-action {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 30rpx;
  z-index: 50;
}

.ar-button {
  height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(135deg, #9B5523, #7B3503);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(139, 69, 19, 0.3);
}

.ar-icon {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-right: 15rpx;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5rpx 10rpx;
  border-radius: 10rpx;
}

.ar-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
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
