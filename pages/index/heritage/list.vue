<template>
	<view class="heritage-list-page">
		<view class="status-bar" :style="{ 
			backgroundColor: scrollTop > 50 ? 'rgba(255, 255, 255, 0.95)' : 'transparent', 
			boxShadow: scrollTop > 50 ? '0 4rpx 20rpx rgba(0, 0, 0, 0.08)' : 'none' 
		}">
			<view class="back-btn" :style="{
				backgroundColor: scrollTop > 50 ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.15)'
			}" @click="goBack">
				<view class="back-icon" :style="{ color: scrollTop > 50 ? '#333' : '#fff' }">〈</view>
				<view class="back-ripple" :class="{ 'animate': backRipple }"></view>
			</view>
			<view class="page-title-container">
				<text class="page-title" :style="{ 
					color: scrollTop > 50 ? '#333' : '#fff', 
					transform: scrollTop > 50 ? 'scale(0.95)' : 'scale(1)' 
				}">文物列表</text>
				<view class="title-decoration">
					<view class="decoration-dot" :style="{ backgroundColor: scrollTop > 50 ? '#8B4513' : '#fff' }"></view>
					<view class="decoration-line" :style="{ background: scrollTop > 50 ? 'linear-gradient(to right, #8B4513, transparent)' : 'linear-gradient(to right, #fff, transparent)' }"></view>
				</view>
			</view>
			<view class="menu-btn" :style="{
				backgroundColor: scrollTop > 50 ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.15)'
			}" @click="showMenu">
				<view class="menu-line" :style="{ backgroundColor: scrollTop > 50 ? '#333' : '#fff' }"></view>
				<view class="menu-line" :style="{ backgroundColor: scrollTop > 50 ? '#333' : '#fff' }"></view>
				<view class="menu-line" :style="{ backgroundColor: scrollTop > 50 ? '#333' : '#fff' }"></view>
			</view>
		</view>
		
		<view class="header-bg"></view>
		
		<view class="content-container">
			<view class="search-container">
				<view class="search-box" :class="{ 'focused': searchFocused }">
					<text class="search-icon">🔍</text>
					<input v-model="searchText" type="text" placeholder="搜索文物名称、朝代" confirm-type="search" class="search-input" @focus="onSearchFocus" @blur="onSearchBlur" />
					<text v-if="searchText" class="clear-icon" @click="clearSearch">✕</text>
				</view>
			</view>
			
			<view class="filter-container">
				<scroll-view class="filter-scroll" scroll-x :show-scrollbar="false" enhanced>
					<view class="filter-tabs">
						<view 
							v-for="(category, index) in categories" 
							:key="index"
							class="filter-tab"
							:class="{ 'active': currentCategory === category.name }"
							@click="setCategory(category.name)"
						>
							<text class="tab-text">{{ category.name }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			
			<scroll-view 
				scroll-y 
				class="heritage-list-scroll"
				@scrolltolower="onLoadMore"
				@scroll="onScroll"
                enhanced
                :enable-passive="true"
                :bounces="false"
                lower-threshold="150"
			>
				<view class="loading-container" v-if="isLoading">
					<view class="skeleton-item" v-for="i in 3" :key="i">
						<view class="skeleton-image skeleton-shine"></view>
						<view class="skeleton-content">
							<view class="skeleton-title skeleton-shine"></view>
							<view class="skeleton-text skeleton-shine"></view>
							<view class="skeleton-text skeleton-shine short"></view>
						</view>
					</view>
				</view>
				
				<view class="empty-state" v-else-if="filteredHeritageList.length === 0">
					<view class="empty-icon">📜</view>
					<view class="empty-text">没有找到相关文物</view>
					<view class="empty-tip">请尝试更换关键词或分类</view>
				</view>
				
				<view class="heritage-list" v-else>
					<view 
						class="heritage-item" 
						v-for="(item, index) in filteredHeritageList" 
						:key="item.id"
						@click="goToDetail(item.id)"
						:style="{'animation-delay': Math.min(index, 5) * 0.05 + 's'}"
					>
						<view class="item-image-container">
							<image :src="item.image" mode="aspectFill" class="item-image" />
							<view class="item-overlay"></view>
							<view class="item-badge" v-if="item.isNew">新增</view>
						</view>
						<view class="item-content">
							<view class="item-title-row">
								<text class="item-title">{{item.name}}</text>
								<text class="item-favorite" :class="{ 'active': item.isFavorite }">♥</text>
							</view>
							<view class="item-period">{{item.period}}</view>
							<view class="item-location">
								<text class="location-icon">📍</text>
								<text class="location-text">{{item.location}}</text>
							</view>
						</view>
					</view>
					
					<view class="list-end-text" v-if="noMoreData">— 没有更多数据 —</view>
					<view class="loading-more" v-else-if="isLoadingMore">加载中...</view>
				</view>
                
                <!-- 底部安全区域，防止内容被遮挡 -->
                <view class="safe-area-bottom"></view>
			</scroll-view>
		</view>
		
		<view class="back-to-top" v-if="showBackToTop" @click="scrollToTop">
			<text class="top-icon">↑</text>
		</view>
	</view>
</template>

<script>
	import { heritageList } from './mock.js'
	
	export default {
		data() {
			return {
				heritageData: [],
				allLoadedData: [],
				currentCategory: '全部',
				searchText: '',
				searchFocused: false,
				isLoading: true,
				isLoadingMore: false,
				noMoreData: false,
				showBackToTop: false,
				scrollTop: 0,
				itemsPerPage: 10,
				currentPage: 1,
				backRipple: false,
                lastLoadMoreTime: 0, // 添加最后一次加载更多的时间
				categories: [
					{ name: '全部', count: 0 },
					{ name: '古建筑', count: 0 },
					{ name: '石窟寺', count: 0 },
					{ name: '陶瓷器', count: 0 },
					{ name: '佛像', count: 0 },
					{ name: '壁画', count: 0 },
					{ name: '青铜器', count: 0 }
				]
			}
		},
		onLoad() {
			this.initData();
		},
		computed: {
			filteredHeritageList() {
				// 搜索筛选，不再需要类别筛选，因为 heritageData 中已经是当前类别的数据
				return this.heritageData.filter(item => {
					// 搜索筛选
					const searchMatch = this.searchText === '' || 
						item.name.includes(this.searchText) || 
						item.period.includes(this.searchText) ||
						item.location.includes(this.searchText);
						
					return searchMatch;
				});
			}
		},
		methods: {
			initData() {
				// 模拟网络请求延迟
				setTimeout(() => {
					// 使用mock数据中的category，仅添加收藏和新增标记
					const initialData = heritageList.map(item => {
						return {
							...item,
							isFavorite: Math.random() > 0.7,
							isNew: Math.random() > 0.8
						}
					}).slice(0, this.itemsPerPage);
					
					this.allLoadedData = [...initialData];
					this.heritageData = [...initialData];
					
					// 更新分类数量
					this.updateCategoryCounts();
					
					this.isLoading = false;
				}, 1500);
			},
			updateCategoryCounts() {
				// 更新每个分类的数量
				this.categories.forEach((category, index) => {
					if (index === 0) {
						category.count = heritageList.length;
					} else {
						category.count = heritageList.filter(item => item.category === category.name).length;
					}
				});
			},
			onLoadMore() {
                // 防止频繁触发加载更多
                const now = Date.now();
                if (this.isLoadingMore || this.noMoreData || now - this.lastLoadMoreTime < 500) return;
				
                this.lastLoadMoreTime = now;
				this.isLoadingMore = true;
				
				// 如果是特定分类，则加载该分类的更多数据
				if (this.currentCategory !== '全部') {
					// 找出原始数据中所有符合当前分类的数据
					const categoryItems = heritageList.filter(item => item.category === this.currentCategory);
					
					// 找出已经加载的该分类数据的ID列表
					const loadedIds = this.heritageData.map(item => item.id);
					
					// 过滤出尚未加载的该分类数据
					const notLoadedItems = categoryItems.filter(item => !loadedIds.includes(item.id));
					
					// 如果没有更多数据，则设置noMoreData为true
					if (notLoadedItems.length === 0) {
						this.noMoreData = true;
						this.isLoadingMore = false;
						return;
					}
					
					// 从未加载数据中取出最多itemsPerPage个
					const newItems = notLoadedItems.slice(0, this.itemsPerPage).map(item => {
						return {
							...item,
							isFavorite: Math.random() > 0.7,
							isNew: Math.random() > 0.8
						}
					});
					
					// 模拟网络请求延迟
					setTimeout(() => {
						// 将新数据添加到heritageData和allLoadedData中
						this.heritageData = [...this.heritageData, ...newItems];
						this.allLoadedData = [...this.allLoadedData, ...newItems];
						
						// 检查是否还有更多该分类的数据可以加载
						this.noMoreData = this.heritageData.length >= categoryItems.length;
						
						this.isLoadingMore = false;
					}, 1000);
				} else {
					// 全部分类的加载逻辑
					const nextPage = this.currentPage + 1;
					const start = this.itemsPerPage * (nextPage - 1);
					const end = this.itemsPerPage * nextPage;
					
					// 找出已经加载的数据的ID列表
					const loadedIds = this.allLoadedData.map(item => item.id);
					
					// 过滤出尚未加载的数据
					const notLoadedItems = heritageList.filter(item => !loadedIds.includes(item.id));
					
					// 从未加载数据中取出最多itemsPerPage个
					const newItems = notLoadedItems.slice(0, this.itemsPerPage).map(item => {
						return {
							...item,
							isFavorite: Math.random() > 0.7,
							isNew: Math.random() > 0.8
						}
					});
					
					// 模拟网络请求延迟
					setTimeout(() => {
						if (newItems.length > 0) {
							this.heritageData = [...this.heritageData, ...newItems];
							this.allLoadedData = [...this.allLoadedData, ...newItems];
							this.currentPage = nextPage;
						} else {
							this.noMoreData = true;
						}
						
						this.isLoadingMore = false;
					}, 1000);
				}
			},
			setCategory(category) {
				this.currentCategory = category;
				
				// 如果是全部分类，直接显示所有已加载数据
				if (category === '全部') {
					this.heritageData = [...this.allLoadedData];
					// 重置noMoreData状态，因为切换到全部类别可能有更多数据可加载
					this.noMoreData = this.allLoadedData.length >= heritageList.length;
					return;
				}
				
				// 首先从已加载的数据中过滤符合当前分类的数据
				this.heritageData = this.allLoadedData.filter(item => item.category === category);
				
				// 如果过滤后没有数据或数据很少，尝试从原始数据中加载更多该分类的数据
				if (this.heritageData.length < 5) {
					this.loadMoreForCategory(category);
				} else {
					// 检查是否还有更多该分类的数据可以加载
					const totalCategoryCount = heritageList.filter(item => item.category === category).length;
					this.noMoreData = this.heritageData.length >= totalCategoryCount;
				}
			},
			loadMoreForCategory(category) {
				this.isLoading = true;
				
				// 找出原始数据中所有符合当前分类的数据
				const categoryItems = heritageList.filter(item => item.category === category);
				
				// 找出已经加载的该分类数据的ID列表
				const loadedIds = this.heritageData.map(item => item.id);
				
				// 过滤出尚未加载的该分类数据
				const notLoadedItems = categoryItems.filter(item => !loadedIds.includes(item.id));
				
				// 如果没有更多数据，则设置noMoreData为true
				if (notLoadedItems.length === 0) {
					this.noMoreData = true;
					this.isLoading = false;
					return;
				}
				
				// 从未加载数据中取出最多itemsPerPage个
				const newItems = notLoadedItems.slice(0, this.itemsPerPage).map(item => {
					return {
						...item,
						isFavorite: Math.random() > 0.7,
						isNew: Math.random() > 0.8
					}
				});
				
				// 模拟网络请求延迟
				setTimeout(() => {
					// 将新数据添加到heritageData和allLoadedData中
					this.heritageData = [...this.heritageData, ...newItems];
					this.allLoadedData = [...this.allLoadedData, ...newItems];
					
					// 检查是否还有更多该分类的数据可以加载
					this.noMoreData = this.heritageData.length >= categoryItems.length;
					
					this.isLoading = false;
				}, 1000);
			},
			goToDetail(id) {
				uni.navigateTo({
					url: `./heritage?id=${id}`
				});
			},
			goBack() {
				this.backRipple = true;
				setTimeout(() => {
					this.backRipple = false;
					uni.navigateBack();
				}, 300);
			},
			showMenu() {
				uni.showToast({
					title: '菜单功能开发中',
					icon: 'none'
				});
			},
			onSearchFocus() {
				this.searchFocused = true;
			},
			onSearchBlur() {
				this.searchFocused = false;
			},
			clearSearch() {
				this.searchText = '';
			},
			onScroll(e) {
				this.scrollTop = e.detail.scrollTop;
				this.showBackToTop = this.scrollTop > 500;
			},
			scrollToTop() {
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 300
				});
			}
		}
	}
</script>

<style lang="scss">
.heritage-list-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background-color: #f8f5f0;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-overflow-scrolling: touch;
}

.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  z-index: 100;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  /* 这里添加一个顶部安全区域的padding，确保不会被手机状态栏遮挡 */
  padding-top: var(--status-bar-height);
  will-change: transform;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10rpx;
    left: 0;
    right: 0;
    height: 10rpx;
    background: linear-gradient(to bottom, rgba(0,0,0,0.05), transparent);
    opacity: 1;
  }
}

.back-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.92);
  }
}

.back-icon {
  font-size: 40rpx;
  font-weight: bold;
  transition: color 0.3s ease;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.back-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: all 0.3s ease;
}

.back-ripple.animate {
  width: 150rpx;
  height: 150rpx;
  opacity: 1;
}

.page-title-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  transition: color 0.3s ease, transform 0.3s ease;
  letter-spacing: 2rpx;
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &[style*="color: #333"] {
    text-shadow: none;
  }
}

.title-decoration {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  transform: translateX(10rpx);
}

.decoration-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  margin-right: 6rpx;
  transition: background-color 0.3s ease;
}

.decoration-line {
  width: 40rpx;
  height: 2rpx;
  transition: background 0.3s ease;
}

.menu-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.92);
  }
}

.menu-line {
  width: 30rpx;
  height: 2rpx;
  transition: background-color 0.3s ease;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 420rpx;
  background: linear-gradient(135deg, #8B4513, #654321);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  z-index: -1;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 15rpx;
    background-image: repeating-linear-gradient(90deg, 
      rgba(255,255,255,0.15) 0px, 
      rgba(255,255,255,0.15) 10px, 
      transparent 10px, 
      transparent 20px);
    z-index: 2;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: radial-gradient(ellipse at top, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
    opacity: 0.7;
  }
}

.content-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 30rpx;
  /* 给顶部状态栏和标题腾出空间 */
  padding-top: calc(var(--status-bar-height) + 110rpx);
}

.search-container {
  margin-top: 20rpx;
  margin-bottom: 30rpx;
  position: relative;
  z-index: 3;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50rpx;
  padding: 15rpx 25rpx;
  box-shadow: 0 10rpx 30rpx -5rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.search-box.focused {
  background-color: #fff;
  box-shadow: 0 15rpx 40rpx -5rpx rgba(0, 0, 0, 0.15);
  transform: translateY(-5rpx);
}

.search-icon {
  margin-right: 15rpx;
  color: #8B4513;
  font-size: 32rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  color: #333;
}

.clear-icon {
  color: #999;
  font-size: 30rpx;
  padding: 10rpx;
  border-radius: 50%;
  height: 24rpx;
  width: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.85);
    background-color: rgba(0,0,0,0.1);
  }
}

.filter-container {
  margin-bottom: 20rpx;
  position: relative;
  z-index: 2;
}

.filter-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 5rpx 0;
}

.filter-tabs {
  display: inline-flex;
  padding: 10rpx 0;
}

.filter-tab {
  padding: 12rpx 30rpx;
  margin-right: 15rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 40rpx;
  transition: transform 0.2s ease, background-color 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  
  &:first-child {
    margin-left: 4rpx;
  }
  
  &.active {
    background-color: #8B4513;
    background-image: linear-gradient(to bottom, #9B5523, #7B3503);
    border-color: transparent;
    box-shadow: 0 6rpx 15rpx rgba(139, 69, 19, 0.3);
    transform: translateY(-2rpx);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.tab-text {
  font-size: 26rpx;
  color: #666;
  transition: color 0.3s ease;
}

.filter-tab.active .tab-text {
  color: #fff;
  font-weight: bold;
}

.heritage-list-scroll {
  flex: 1;
  height: calc(100vh - var(--status-bar-height) - 360rpx);
  position: relative;
  z-index: 1;
  -webkit-overflow-scrolling: touch;
}

.loading-container {
  padding: 20rpx 0;
}

.skeleton-item {
  display: flex;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.skeleton-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 15rpx;
  background-color: #eee;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  padding-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.skeleton-title {
  height: 40rpx;
  width: 60%;
  background-color: #eee;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
}

.skeleton-text {
  height: 30rpx;
  width: 80%;
  background-color: #eee;
  margin-bottom: 15rpx;
  border-radius: 6rpx;
}

.skeleton-text.short {
  width: 40%;
}

.skeleton-shine {
  position: relative;
  overflow: hidden;
}

.skeleton-shine::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
  color: rgba(139, 69, 19, 0.2);
}

.empty-text {
  font-size: 34rpx;
  color: #999;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.empty-tip {
  font-size: 26rpx;
  color: #bbb;
  background: rgba(0,0,0,0.03);
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  margin-top: 10rpx;
}

.heritage-list {
  padding-bottom: 60rpx;
  will-change: transform;
}

.heritage-item {
  display: flex;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.3s ease forwards;
  opacity: 0;
  transform: translateY(20rpx);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0,0,0,0.02);
  position: relative;
  will-change: transform, opacity;
  
  &:before {
    content: '';
    position: absolute;
    top: 8rpx;
    left: 8rpx;
    right: 8rpx;
    bottom: 8rpx;
    border: 1px dashed rgba(139, 69, 19, 0.08);
    border-radius: 15rpx;
    pointer-events: none;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-image-container {
  width: 180rpx;
  height: 180rpx;
  border-radius: 15rpx;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100%;
  height: 100%;
  transform: scale(1);
  transition: transform 0.3s ease;
  will-change: transform;
  
  .heritage-item:active & {
    transform: scale(1.05);
  }
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.4));
}

.item-badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 8rpx rgba(255, 107, 107, 0.3);
}

.item-content {
  flex: 1;
  padding-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.item-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-shadow: 0 1px 0 rgba(255,255,255,0.8);
}

.item-favorite {
  font-size: 38rpx;
  color: #ddd;
  transition: transform 0.2s ease, color 0.2s ease;
  will-change: transform, color;
}

.item-favorite.active {
  color: #ff6b6b;
  transform: scale(1.1);
}

.item-period {
  font-size: 24rpx;
  color: #8B4513;
  padding: 6rpx 16rpx;
  background-color: rgba(139, 69, 19, 0.08);
  border-radius: 30rpx;
  display: inline-block;
  margin-bottom: 20rpx;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.item-location {
  display: flex;
  align-items: center;
  margin-top: auto;
  background-color: rgba(0,0,0,0.02);
  padding: 6rpx 12rpx;
  border-radius: 30rpx;
  align-self: flex-start;
}

.location-icon {
  font-size: 24rpx;
  color: #8B4513;
  margin-right: 8rpx;
}

.location-text {
  font-size: 24rpx;
  color: #999;
}

.list-end-text {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 30rpx 0;
  position: relative;
  
  &:before, &:after {
    content: '';
    position: absolute;
    top: 50%;
    width: 15%;
    height: 1px;
    background: rgba(0,0,0,0.1);
  }
  
  &:before {
    left: 20%;
  }
  
  &:after {
    right: 20%;
  }
}

.loading-more {
  text-align: center;
  color: #8B4513;
  font-size: 24rpx;
  padding: 30rpx 0;
  position: relative;
  
  &:after {
    content: '';
    display: inline-block;
    width: 30rpx;
    height: 30rpx;
    margin-left: 10rpx;
    border: 2rpx solid rgba(139, 69, 19, 0.2);
    border-top: 2rpx solid #8B4513;
    border-radius: 50%;
    animation: rotate 1s linear infinite;
    vertical-align: middle;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.back-to-top {
  position: fixed;
  right: 30rpx;
  bottom: 120rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 10;
  border: 1px solid rgba(139, 69, 19, 0.1);
  opacity: 0;
  transform: translateY(20rpx) scale(0.9);
  animation: fadeInUp 0.25s forwards;
  will-change: transform, opacity;
  
  &:active {
    transform: scale(0.9);
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.top-icon {
  color: #8B4513;
  font-size: 36rpx;
  font-weight: bold;
}

// 增加滚动条样式
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
}

// 添加底部安全区域样式
.safe-area-bottom {
  height: 60rpx;
}
</style>
