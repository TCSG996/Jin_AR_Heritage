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
				<scroll-view class="filter-scroll" scroll-x :show-scrollbar="false">
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
				refresher-enabled
				:refresher-triggered="isRefreshing"
				@refresherrefresh="onRefresh"
				@scroll="onScroll"
			>
				<view class="loading-container" v-if="isLoading">
					<view class="skeleton-item" v-for="i in 5" :key="i">
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
						:style="{'animation-delay': index * 0.05 + 's'}"
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
				isRefreshing: false,
				isLoadingMore: false,
				noMoreData: false,
				showBackToTop: false,
				scrollTop: 0,
				itemsPerPage: 10,
				currentPage: 1,
				backRipple: false,
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
			onRefresh() {
				this.isRefreshing = true;
				
				// 模拟刷新
				setTimeout(() => {
					this.heritageData = [];
					this.allLoadedData = [];
					this.currentPage = 1;
					this.noMoreData = false;
					this.currentCategory = '全部';
					this.initData();
					this.isRefreshing = false;
				}, 1500);
			},
			onLoadMore() {
				if (this.isLoadingMore || this.noMoreData) return;
				
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
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes shimmer {
	0% {
		background-position: -200% 0;
	}
	100% {
		background-position: 200% 0;
	}
}

.heritage-list-page {
	min-height: 100vh;
	background-color: #f9f9f9;
	position: relative;
}

.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 300rpx;
	background: linear-gradient(135deg, #8B4513, #D2691E);
	border-radius: 0 0 50rpx 50rpx;
	z-index: 1;
}

.status-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 30rpx;
	z-index: 110;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border-radius: 0 0 30rpx 30rpx;
	
	.back-btn {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		border-radius: 50%;
		transform: scale(1);
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		
		&:active {
			transform: scale(0.9);
		}
		
		.back-icon {
			font-size: 42rpx;
			font-weight: bold;
			z-index: 2;
			transform: translateX(-2rpx);
		}
		
		.back-ripple {
			position: absolute;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.3);
			transform: scale(0);
			opacity: 0;
			
			&.animate {
				animation: ripple 0.8s cubic-bezier(0, 0.5, 0.5, 1);
			}
			
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
		}
	}
	
	.menu-btn {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		transform: scale(1);
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		
		&:active {
			transform: scale(0.9);
		}
		
		.menu-line {
			width: 30rpx;
			height: 3rpx;
			margin: 4rpx 0;
			transition: all 0.3s ease;
			
			&:nth-child(1) {
				width: 20rpx;
				align-self: flex-end;
			}
			
			&:nth-child(3) {
				width: 20rpx;
				align-self: flex-start;
			}
		}
	}
	
	.page-title-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: float 3s ease-in-out infinite;
		
		.page-title {
			font-size: 38rpx;
			font-weight: bold;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
			letter-spacing: 2rpx;
		}
		
		.title-decoration {
			display: flex;
			align-items: center;
			margin-top: 8rpx;
			
			.decoration-dot {
				width: 8rpx;
				height: 8rpx;
				border-radius: 50%;
				margin-right: 6rpx;
				transition: background-color 0.3s ease;
			}
			
			.decoration-line {
				height: 4rpx;
				width: 60rpx;
				transition: background 0.3s ease;
			}
		}
	}
}

@keyframes float {
	0% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-5rpx);
	}
	100% {
		transform: translateY(0);
	}
}

.content-container {
	padding-top: 100rpx;
	position: relative;
	z-index: 10;
}

.search-container {
	padding: 20rpx 30rpx;
	background-color: transparent;
	position: relative;
	z-index: 5;
	margin-bottom: 10rpx;
	
	.search-box {
		display: flex;
		align-items: center;
		height: 80rpx;
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 40rpx;
		padding: 0 30rpx;
		box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		backdrop-filter: blur(5px);
		border: 1rpx solid rgba(255, 255, 255, 0.5);
		
		&.focused {
			transform: translateY(-4rpx);
			box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
			background-color: #fff;
		}
		
		.search-icon {
			font-size: 32rpx;
			color: #8B4513;
			margin-right: 15rpx;
		}
		
		.search-input {
			flex: 1;
			height: 80rpx;
			font-size: 28rpx;
			color: #333;
		}
		
		.clear-icon {
			font-size: 30rpx;
			color: #999;
			padding: 15rpx;
		}
	}
}

.filter-container {
	padding: 20rpx 0;
	background-color: transparent;
	margin-bottom: 20rpx;
	box-shadow: none;
	position: relative;
	z-index: 5;
	
	.filter-scroll {
		white-space: nowrap;
		
		.filter-tabs {
			display: inline-flex;
			padding: 0 20rpx;
			
			.filter-tab {
				padding: 15rpx 30rpx;
				margin: 0 10rpx;
				border-radius: 30rpx;
				background-color: rgba(255, 255, 255, 0.8);
				box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				transform: translateY(0);
				border: 1rpx solid rgba(255, 255, 255, 0.5);
				backdrop-filter: blur(5px);
				
				&.active {
					background-color: rgba(139, 69, 19, 0.2);
					color: #8B4513;
					transform: translateY(-4rpx);
					box-shadow: 0 6rpx 15rpx rgba(139, 69, 19, 0.2);
					font-weight: bold;
				}
				
				&:active {
					transform: translateY(-2rpx) scale(0.98);
					box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
				}
				
				.tab-text {
					font-size: 28rpx;
				}
			}
		}
	}
}

.heritage-list-scroll {
	height: calc(100vh - 420rpx);
	background-color: rgba(249, 249, 249, 0.95);
	border-radius: 30rpx 30rpx 0 0;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
	margin-top: 10rpx;
	
	.loading-container {
		padding: 20rpx 30rpx;
		
		.skeleton-item {
			display: flex;
			background-color: #fff;
			border-radius: 16rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			
			.skeleton-image {
				width: 200rpx;
				height: 150rpx;
				border-radius: 8rpx;
				margin-right: 20rpx;
				background-color: #eee;
			}
			
			.skeleton-content {
				flex: 1;
				
				.skeleton-title {
					height: 32rpx;
					width: 70%;
					margin-bottom: 20rpx;
					background-color: #eee;
					border-radius: 4rpx;
				}
				
				.skeleton-text {
					height: 24rpx;
					width: 90%;
					margin-bottom: 15rpx;
					background-color: #eee;
					border-radius: 4rpx;
					
					&.short {
						width: 50%;
					}
				}
			}
			
			.skeleton-shine {
				background: linear-gradient(90deg, #eee 8%, #f5f5f5 18%, #eee 33%);
				background-size: 200% 100%;
				animation: shimmer 1.5s infinite linear;
			}
		}
	}
	
	.empty-state {
		padding: 100rpx 30rpx;
		text-align: center;
		
		.empty-icon {
			font-size: 120rpx;
			color: #ddd;
			margin-bottom: 20rpx;
		}
		
		.empty-text {
			font-size: 36rpx;
			color: #999;
			margin-bottom: 20rpx;
		}
		
		.empty-tip {
			font-size: 28rpx;
			color: #bbb;
		}
	}
	
	.heritage-list {
		padding: 20rpx 30rpx;
		
		.heritage-item {
			display: flex;
			background-color: #fff;
			border-radius: 16rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			transform: translateY(0);
			transition: all 0.3s ease;
			animation: fadeInUp 0.5s ease forwards;
			opacity: 0;
			
			&:active {
				transform: translateY(-6rpx) scale(0.98);
				box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.08);
			}
			
			.item-image-container {
				position: relative;
				width: 200rpx;
				height: 150rpx;
				border-radius: 8rpx;
				overflow: hidden;
				margin-right: 20rpx;
				
				.item-image {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 0.5s ease;
				}
				
				.item-overlay {
					position: absolute;
					left: 0;
					top: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.2));
				}
				
				.item-badge {
					position: absolute;
					top: 10rpx;
					right: 10rpx;
					padding: 4rpx 12rpx;
					background-color: #ff4a4a;
					color: white;
					font-size: 20rpx;
					border-radius: 20rpx;
				}
			}
			
			&:active .item-image {
				transform: scale(1.1);
			}
			
			.item-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				
				.item-title-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 15rpx;
					
					.item-title {
						font-size: 32rpx;
						font-weight: bold;
						color: #333;
					}
					
					.item-favorite {
						font-size: 36rpx;
						color: #ddd;
						
						&.active {
							color: #ff4a4a;
						}
					}
				}
				
				.item-period {
					font-size: 26rpx;
					color: #8B4513;
					margin-bottom: 15rpx;
					padding: 4rpx 12rpx;
					background-color: rgba(139, 69, 19, 0.1);
					border-radius: 4rpx;
					display: inline-block;
				}
				
				.item-location {
					font-size: 26rpx;
					color: #999;
					display: flex;
					align-items: center;
					
					.location-icon {
						font-size: 24rpx;
						margin-right: 8rpx;
					}
				}
			}
		}
		
		.list-end-text, .loading-more {
			text-align: center;
			padding: 30rpx 0;
			color: #999;
			font-size: 28rpx;
		}
	}
}

.back-to-top {
	position: fixed;
	bottom: 60rpx;
	right: 30rpx;
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.9);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: center;
	align-items: center;
	transform: scale(1);
	transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	animation: fadeInUp 0.3s ease;
	z-index: 10;
	
	.top-icon {
		font-size: 32rpx;
		color: #666;
	}
	
	&:active {
		transform: scale(0.9);
	}
}
</style>
