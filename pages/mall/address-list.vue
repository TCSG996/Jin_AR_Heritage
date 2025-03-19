<template>
	<view class="address-list-container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<uni-icons type="left" size="20" color="#333"></uni-icons>
			</view>
			<text class="title">选择地址</text>
		</view>

		<!-- 地址列表 -->
		<view class="address-list">
			<view class="address-item" v-for="(item, index) in addressList" :key="index" @tap="selectAddress(item)">
				<view class="info">
					<view class="user-info">
						<text class="name">{{ item.name }}</text>
						<text class="phone">{{ item.phone }}</text>
					</view>
					<view class="address-text">
						{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
					</view>
				</view>
				<view class="selected" v-if="item.id === selectedId">
					<uni-icons type="checkmarkempty" size="20" color="#ff6b6b"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="bottom-bar">
			<button class="add-btn" @tap="addAddress">添加新地址</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 0,
				selectedId: '',
				addressList: [
					{
						id: '1',
						name: '张三',
						phone: '13800138000',
						province: '山西省',
						city: '太原市',
						district: '晋源区',
						detail: '晋祠路888号'
					},
					{
						id: '2',
						name: '李四',
						phone: '13900139000',
						province: '山西省',
						city: '太原市',
						district: '小店区',
						detail: '长治路999号'
					}
				]
			}
		},
		onLoad(options) {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight
			
			// 获取当前选中的地址ID
			if (options.selectedId) {
				this.selectedId = options.selectedId
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 选择地址
			selectAddress(address) {
				// 通过事件通道将选中的地址传回上一页
				const eventChannel = this.getOpenerEventChannel()
				eventChannel.emit('selectedAddress', address)
				uni.navigateBack()
			},
			
			// 添加新地址
			addAddress() {
				uni.showToast({
					title: '添加地址功能开发中',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss">
	.address-list-container {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-top: calc(var(--status-bar-height) + 88rpx);
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 88rpx;
		background: #fff;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		z-index: 100;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.back-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title {
		flex: 1;
		text-align: center;
		font-size: 32rpx;
		font-weight: 500;
		margin-right: 60rpx;
	}

	.address-list {
		padding: 20rpx;
	}

	.address-item {
		background: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		
		.info {
			flex: 1;
			margin-right: 20rpx;
		}
		
		.user-info {
			margin-bottom: 10rpx;
			
			.name {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
				margin-right: 20rpx;
			}
			
			.phone {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.address-text {
			font-size: 28rpx;
			color: #666;
			line-height: 1.4;
		}
		
		.selected {
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 20rpx 30rpx;
		background: #fff;
		box-shadow: 0 -2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.add-btn {
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background: #ff6b6b;
		color: #fff;
		font-size: 28rpx;
		border-radius: 40rpx;
	}
</style> 