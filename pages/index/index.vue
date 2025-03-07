<template>
	<view class="index">
		<!-- 背景图 -->
		<view class="backdrop">
			<view class="overlay"></view>
		</view>

		<!-- 搜索框组件开始 -->
		<uni-search-bar class="custom-search" placeholder="搜索景点、文物、活动" @confirm="search" @input="input"
			:radius="90"></uni-search-bar>
		<!-- 搜索框组件结束 -->

		<!-- 功能区域模块开始 -->
		<view class="feature">
			<!-- 首页 -->
			<view class="home">
				<image src="/static/taber/文物资源-copy.png" mode="aspectFit"></image>
				<view class="text">首页</view>
			</view>
			<!-- 景点导览 -->
			<view class="home">
				<image src="/static/taber/论坛.png" mode="aspectFit"></image>
				<view class="text">导览</view>
			</view>
			<!-- AR体验 -->
			<view class="home">
				<image src="/static/taber/AR扫一扫.png" mode="aspectFit"></image>
				<view class="text">AR体验</view>
			</view>
			<!-- 文物展示 -->
			<view class="home">
				<image src="/static/taber/文物资源-copy.png" mode="aspectFit"></image>
				<view class="text">文物</view>
			</view>
			<!-- 预约讲解 -->
			<view class="home">
				<image src="/static/taber/预约.png" mode="aspectFit"></image>
				<view class="text">预约</view>
			</view>
		</view>
		<!-- 功能区域模块结束 -->

		<!-- 热门经典模块开始 -->
		<view class="hot">
			<!-- 标题 -->
			<view class="title">
				<view class="left">
					<text class="icon">📍</text>
					热门景点
				</view>
				<view class="right">更多景点 ></view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-container" v-if="isLoading">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 列表 -->
			<view class="list" v-else>
				<view class="one" v-for="(item, index) in hotSpots" :key="index">
					<view class="left">
						<image :src="item.image" mode="aspectFill"></image>
					</view>
					<view class="content">
						<text class="name">{{ item.name }}</text>
						<text class="desc">{{ item.desc }}</text>
					</view>
					<view class="right" @click="viewSpot(item)">查看</view>
				</view>

				<!-- 无数据提示 -->
				<view class="empty-tip" v-if="hotSpots.length === 0">
					<text>暂无热门景点数据</text>
				</view>
			</view>
		</view>
		<!-- 热门经典模块结束 -->
	</view>

</template>

<script>
	import api from '@/api/index.js';
	export default {
		components: {

		},
		data() {
			return {
				hotSpots: [], // 热门景点数据
				isLoading: false, // 加载状态
				searchValue: '' // 搜索值
			}
		},
		onLoad() {
			this.getHomeData();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.getHomeData();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			// 获取首页数据
			getHomeData() {
				this.isLoading = true;

				// 使用API接口获取首页数据
				api.user.home()
					.then(res => {
						console.log('首页数据:', res);
						if (res && res.code === 200 && res.data && res.data.hotSpots) {
							// 获取成功，更新热门景点数据
							this.hotSpots = res.data.hotSpots.map(spot => ({
								id: spot.id,
								name: spot.name,
								desc: spot.description || spot.desc,
								image: spot.image || spot.imageUrl || '/static/spot-default.png'
							}));
						} else {
							// 获取失败，使用模拟数据
							this.useMockData();
							uni.showToast({
								title: res?.msg || '获取数据失败',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						// 请求出错，使用模拟数据
						console.error('请求首页数据出错:', err);
						this.useMockData();
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					})
					.finally(() => {
						this.isLoading = false;
						// 停止下拉刷新动画
						uni.stopPullDownRefresh();
					});
			},

			// 使用模拟数据（仅在API请求失败时使用）
			useMockData() {
				this.hotSpots = [{
						id: 1,
						name: '晋祠景区',
						desc: '千年晋祠，国宝圣地。始建于北魏，是国家AAAAA级旅游景区，以圣母殿、难老泉、鱼沼飞梁等景观闻名。',
						image: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.mnvAYqyx7gGumBavcxDztwHaE8?w=263&h=180&c=7&r=0&o=5&pid=1.7'
					},
					{
						id: 2,
						name: '平遥古城',
						desc: '世界文化遗产，中国保存最为完整的古城之一。城墙、街道、店铺保持着明清时期的原貌。',
						image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.8dp4PNg2KBG_kv1Pt5rnpQHaEh?w=284&h=180&c=7&r=0&o=5&pid=1.7'
					},
					{
						id: 3,
						name: '五台山',
						desc: '中国佛教四大名山之一，以其悠久的历史、宏伟的建筑和深厚的佛教文化底蕴而闻名。',
						image: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.owG3i3vg-omVw_Zh22HeQwHaE8?w=253&h=180&c=7&r=0&o=5&pid=1.7'
					}
				];
			},

			// 搜索功能
			search(e) {
				console.log('搜索:', e.value);
				// 实现搜索功能
				uni.showToast({
					title: '搜索功能开发中',
					icon: 'none'
				});
			},

			// 输入事件
			input(e) {
				this.searchValue = e.value;
			},

			// 查看景点详情
			viewSpot(spot) {
				console.log('查看景点:', spot);
				uni.navigateTo({
					url: `/pages/spot/detail?id=${spot.id}`
				});
			}
		}
	}
</script>

<style lang="scss">
	.index {
		background-color: #f5f6fa;
		min-height: 100vh;
		position: relative;

		.backdrop {
			background-image: linear-gradient(135deg, #4a90e2, #7ed6df);
			width: 100%;
			height: 420rpx;
			border-bottom-left-radius: 40rpx;
			border-bottom-right-radius: 40rpx;
			position: relative;
			overflow: hidden;

			.overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(255, 255, 255, 0.15);
				backdrop-filter: blur(10px);
			}
		}

		.custom-search {
			position: relative;
			width: 670rpx;
			margin: -350rpx auto 0;
			z-index: 10;

			:deep(.uni-searchbar) {
				background-color: rgba(255, 255, 255, 0.98);
				box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.08);
				border-radius: 90rpx;
				padding: 0 20rpx;
			}
		}

		.feature {
			margin-top: 100rpx;
			margin-left: 30rpx;
			margin-right: 30rpx;
			padding: 36rpx 20rpx;
			background-color: rgba(255, 255, 255, 0.98);
			border-radius: 24rpx;
			box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
			display: flex;
			justify-content: space-around;
			position: relative;
			z-index: 5;

			.home {
				width: 130rpx;
				height: 130rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				transition: all 0.3s ease;
				position: relative;
				padding: 12rpx;

				&:active {
					transform: scale(0.92);
				}

				image {
					width: 76rpx;
					height: 76rpx;
					margin-bottom: 14rpx;
				}

				.text {
					font-size: 26rpx;
					color: #333;
					text-align: center;
					font-weight: 500;
				}

				&::after {
					content: '';
					position: absolute;
					bottom: -4rpx;
					left: 50%;
					transform: translateX(-50%);
					width: 0;
					height: 3rpx;
					background: linear-gradient(135deg, #4a90e2, #57b6e9);
					transition: width 0.3s ease;
					border-radius: 4rpx;
				}

				&:active::after {
					width: 32rpx;
				}
			}
		}

		.hot {
			margin: 40rpx 30rpx 20rpx;
			padding: 20rpx 0;

			.title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;
				padding: 0 10rpx;

				.left {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					display: flex;
					align-items: center;

					.icon {
						margin-right: 8rpx;
						font-size: 36rpx;
					}
				}

				.right {
					font-size: 26rpx;
					color: #666;
					padding: 8rpx 16rpx;
					border-radius: 20rpx;
					background: rgba(74, 144, 226, 0.1);
					transition: all 0.3s ease;

					&:active {
						background: rgba(74, 144, 226, 0.2);
					}
				}
			}

			.loading-container {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-bottom: 24rpx;

				.loading-spinner {
					width: 40rpx;
					height: 40rpx;
					border: 4rpx solid rgba(74, 144, 226, 0.2);
					border-top-color: rgba(74, 144, 226, 0.8);
					border-radius: 50%;
					animation: spin 1s linear infinite;
				}

				.loading-text {
					margin-left: 16rpx;
					font-size: 26rpx;
					color: #666;
				}
			}

			.list {
				.one {
					margin-bottom: 24rpx;
					display: flex;
					align-items: center;
					background-color: #ffffff;
					padding: 20rpx;
					border-radius: 20rpx;
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
					transition: all 0.3s ease;

					&:active {
						transform: translateY(2rpx);
						box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
					}

					.left {
						margin-right: 24rpx;

						image {
							width: 180rpx;
							height: 140rpx;
							border-radius: 16rpx;
							object-fit: cover;
						}
					}

					.content {
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: center;
						padding-right: 16rpx;

						.name {
							font-size: 30rpx;
							font-weight: 600;
							color: #333;
							margin-bottom: 12rpx;
						}

						.desc {
							font-size: 24rpx;
							color: #666;
							line-height: 1.4;
						}
					}

					.right {
						width: 110rpx;
						height: 52rpx;
						line-height: 52rpx;
						background: linear-gradient(135deg, #4a90e2, #57b6e9);
						color: #ffffff;
						text-align: center;
						border-radius: 26rpx;
						font-size: 24rpx;
						font-weight: 500;
						box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.2);
						transition: all 0.3s ease;

						&:active {
							transform: scale(0.95);
							box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.15);
						}
					}
				}

				.empty-tip {
					margin-top: 24rpx;
					font-size: 26rpx;
					color: #666;
					text-align: center;
				}
			}
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>