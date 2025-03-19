<template>
    <view class="detail-container">
        <!-- 顶部图片轮播 -->
        <swiper 
            class="swiper" 
            :indicator-dots="true" 
            :autoplay="true" 
            :interval="3000" 
            :duration="500"
            indicator-active-color="#FFFFFF"
            indicator-color="rgba(255, 255, 255, 0.5)"
        >
            <swiper-item v-for="(item, index) in spotDetail.images" :key="index">
                <image :src="item" mode="aspectFill" class="swiper-image"></image>
            </swiper-item>
        </swiper>

        <!-- 返回按钮 -->
        <view class="back-btn" :style="{ top: statusBarHeight + 10 + 'px' }" @tap="goBack">
            <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
        </view>

        <!-- 内容区域 -->
        <view class="content">
            <!-- 基本信息 -->
            <view class="basic-info">
                <view class="title-row">
                    <text class="title">{{ spotDetail.name }}</text>
                    <view class="rating">
                        <uni-icons type="star-filled" size="16" color="#FFB800"></uni-icons>
                        <text>{{ spotDetail.rating }}</text>
                    </view>
                </view>
                <view class="address-row">
                    <uni-icons type="location" size="16" color="#666"></uni-icons>
                    <text>{{ spotDetail.address }}</text>
                </view>
                
                <view class="tag-row">
                    <view class="tag" v-for="(tag, index) in spotDetail.tags" :key="index">
                        {{ tag }}
                    </view>
                </view>

                <!-- 操作按钮 -->
                <view class="action-row">
                    <view class="action-btn" @tap="handleCollect">
                        <uni-icons :type="isCollected ? 'star-filled' : 'star'" :size="20" :color="isCollected ? '#FFB800' : '#666'"></uni-icons>
                        <text>{{ isCollected ? '已收藏' : '收藏' }}</text>
                    </view>
                    <view class="action-btn" @tap="handleShare">
                        <uni-icons type="redo" :size="20" color="#666"></uni-icons>
                        <text>分享</text>
                    </view>
                    <view class="action-btn" @tap="openMap">
                        <uni-icons type="map" :size="20" color="#666"></uni-icons>
                        <text>导航</text>
                    </view>
                </view>
            </view>

            <!-- 简介 -->
            <view class="section">
                <view class="section-title">
                    <text>景点简介</text>
                </view>
                <view class="section-content">
                    <text class="description">{{ spotDetail.description }}</text>
                </view>
            </view>

            <!-- 建筑特色 -->
            <view class="section">
                <view class="section-title">
                    <text>建筑特色</text>
                </view>
                <view class="section-content">
                    <view class="feature-item" v-for="(feature, index) in spotDetail.features" :key="index">
                        <view class="feature-number">{{ index + 1 }}</view>
                        <view class="feature-content">
                            <text class="feature-title">{{ feature.title }}</text>
                            <text class="feature-desc">{{ feature.description }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 参观信息 -->
            <view class="section">
                <view class="section-title">
                    <text>参观信息</text>
                </view>
                <view class="section-content info-grid">
                    <view class="info-item">
                        <text class="info-label">开放时间</text>
                        <text class="info-value">{{ spotDetail.openingHours }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">门票价格</text>
                        <text class="info-value">{{ spotDetail.ticketPrice }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">建议游玩</text>
                        <text class="info-value">{{ spotDetail.suggestedVisitTime }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">最佳季节</text>
                        <text class="info-value">{{ spotDetail.bestSeason }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="detail-footer">
            <view class="ar-btn" @tap="startAR">
                <uni-icons type="camera" size="20" color="#FFFFFF"></uni-icons>
                <text>开启AR导览体验</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            id: null,
            statusBarHeight: 0,
            isCollected: false,
            spotDetail: {
                id: 0,
                name: '',
                rating: 0,
                address: '',
                tags: [],
                description: '',
                features: [],
                openingHours: '',
                ticketPrice: '',
                suggestedVisitTime: '',
                bestSeason: '',
                images: []
            },
            // 虚拟数据映射表
            spotsData: {
                1: {
                    id: 1,
                    name: '双塔寺',
                    rating: 4.8,
                    address: '山西省太原市晋源区晋祠镇双塔寺村',
                    tags: ['历史古迹', '寺庙', '文物保护单位'],
                    description: '双塔寺始建于北魏，是中国现存最古老的砖塔之一，也是山西地区重要的佛教胜地。寺内两座砖塔并列而立，造型独特，雕刻精美，是我国古代建筑艺术的杰出代表。寺庙经历了多个朝代的修缮与扩建，保存了丰富的历史信息和文化内涵，是研究中国古代建筑、雕刻和佛教艺术的重要实物资料。',
                    features: [
                        {
                            title: '双塔结构',
                            description: '两座砖塔呈八角形，高约50米，塔身13层，每层有佛龛和精美的浮雕，代表了当时高超的建筑技艺。'
                        },
                        {
                            title: '石雕艺术',
                            description: '寺内保存有大量石雕，题材丰富，包括佛像、飞天、伎乐、花鸟等，刻工精细，风格独特。'
                        },
                        {
                            title: '建筑布局',
                            description: '寺院采用中轴对称布局，主要建筑有山门、天王殿、大雄宝殿、藏经楼等，体现了传统佛教寺院的建筑特点。'
                        }
                    ],
                    openingHours: '08:00-17:30（周一至周日）',
                    ticketPrice: '¥60/人（学生半价）',
                    suggestedVisitTime: '2-3小时',
                    bestSeason: '春季、秋季',
                    images: [
                        'https://tse3-mm.cn.bing.net/th/id/OIP-C.RosxJuZmIW9TH8hyGxrSdAHaEK?w=295&h=180&c=7&r=0&o=5&pid=1.7',
                        'https://tse4-mm.cn.bing.net/th/id/OIP-C.7MJZWJZz3q7DL08STLRxGAHaFo?w=261&h=198&c=7&r=0&o=5&pid=1.7',
                        'https://tse1-mm.cn.bing.net/th/id/OIP-C.OWEcDvNsvq9DoMexFdCODwHaE7?w=283&h=189&c=7&r=0&o=5&pid=1.7'
                    ]
                },
                2: {
                    id: 2,
                    name: '平遥古城',
                    rating: 4.9,
                    address: '山西省晋中市平遥县古城内',
                    tags: ['世界文化遗产', '古城', '明清建筑'],
                    description: '平遥古城始建于西周时期，是中国保存最为完整的古代县城，于1997年被联合国教科文组织列入《世界文化遗产名录》。古城呈方形，城墙全长约6公里，城内街道呈"棋盘式"布局，保存有大量明清时期的传统民居、店铺、庙宇等建筑，是研究中国古代城市规划和建筑艺术的重要实例。',
                    features: [
                        {
                            title: '城墙建筑',
                            description: '平遥古城墙高10米，厚3-5米，设有6座城门，72座敌楼，3000余个垛口，防御系统完备。'
                        },
                        {
                            title: '街巷格局',
                            description: '城内街道呈"十"字形主街加各种小巷的结构，形成独特的"六街十八巷七十二条胡同"的布局。'
                        },
                        {
                            title: '传统民居',
                            description: '城内保存了大量明清时期的传统民居，多为四合院结构，砖木结构，雕梁画栋，体现了北方民居的典型特征。'
                        },
                        {
                            title: '商业建筑',
                            description: '平遥是晋商的发源地，城内保存有大量传统商业建筑，如票号、商铺、镖局等，见证了晋商文化的繁荣。'
                        }
                    ],
                    openingHours: '全天开放（景点08:00-18:00）',
                    ticketPrice: '¥125/人（通票）',
                    suggestedVisitTime: '1-2天',
                    bestSeason: '春季、秋季',
                    images: [
                        'https://tse2-mm.cn.bing.net/th/id/OIP-C.G6FRh2lXGyAQA7KR653x7AHaEo?w=244&h=180&c=7&r=0&o=5&pid=1.7',
                        'https://tse1-mm.cn.bing.net/th/id/OIP-C.HpB8-sjtw7dEQAPjmrcskAHaE6?w=276&h=183&c=7&r=0&o=5&pid=1.7',
                        'https://tse2-mm.cn.bing.net/th/id/OIP-C.dGeFl9ZfJ8Bt_e6w4pGSKwHaDt?w=346&h=180&c=7&r=0&o=5&pid=1.7'
                    ]
                },
                3: {
                    id: 3,
                    name: '乔家大院',
                    rating: 4.7,
                    address: '山西省晋中市祁县乔家堡村',
                    tags: ['晋商民居', '四合院', '历史建筑'],
                    description: '乔家大院是清代著名商人乔致庸的宅院，占地约1万平方米，由6个大院、20个小院组成，是晋商文化的典型代表。大院建筑风格独特，融合了北方四合院的封闭性和南方园林的精巧布局，装饰精美，工艺精湛，反映了清代晋商的富庶生活和审美情趣，是研究晋商文化和传统民居建筑的重要实物资料。',
                    features: [
                        {
                            title: '院落布局',
                            description: '整个建筑群由六个大院、二十个小院组成，呈"喜"字形，布局严谨对称，体现了中国传统建筑的设计理念。'
                        },
                        {
                            title: '木雕艺术',
                            description: '院内木雕精美，题材丰富，包括花鸟、人物、山水等，工艺精湛，是中国传统木雕艺术的典范。'
                        },
                        {
                            title: '砖雕石刻',
                            description: '大院的砖雕和石刻工艺精细，装饰性强，主要分布在门楼、门框、窗棂等处，内容多为吉祥图案。'
                        },
                        {
                            title: '彩绘艺术',
                            description: '院内的彩绘主要分布在梁架、檐下、隔扇等处，色彩鲜艳，图案精美，多为传统吉祥图案和戏曲故事。'
                        }
                    ],
                    openingHours: '08:30-17:30（周一至周日）',
                    ticketPrice: '¥80/人',
                    suggestedVisitTime: '2-3小时',
                    bestSeason: '四季皆宜',
                    images: [
                        'https://tse4-mm.cn.bing.net/th/id/OIP-C.z37ty2ur9vfHI82AGPGMnAHaE8?w=294&h=196&c=7&r=0&o=5&pid=1.7',
                        'https://tse4-mm.cn.bing.net/th/id/OIP-C.I3Nnr4Ve8IaHm5z0fBjJYAHaE8?w=239&h=180&c=7&r=0&o=5&pid=1.7',
                        'https://tse4-mm.cn.bing.net/th/id/OIP-C.hfHsgmC1Z8IKgEnLaqEEhgHaE7?w=286&h=191&c=7&r=0&o=5&pid=1.7'
                    ]
                },
                4: {
                    id: 4,
                    name: '王家大院',
                    rating: 4.6,
                    address: '山西省临汾市灵石县静升镇',
                    tags: ['晋商民居', '传统建筑', '历史文化'],
                    description: '王家大院是清代巨商王家的私人宅院，始建于清康熙年间，历时300余年建成，占地约25万平方米，是一座融官宅、民居、寺庙于一体的建筑群。大院建筑风格独特，融合了北方四合院的规整与南方园林的灵秀，装饰精美，工艺精湛，是研究晋商文化和传统民居建筑的珍贵实例。',
                    features: [
                        {
                            title: '规模宏大',
                            description: '整个建筑群由五条护院、五座祠堂、五座花园组成，共有231间房屋，规模宏大，被誉为"民间故宫"。'
                        },
                        {
                            title: '砖雕工艺',
                            description: '大院的砖雕题材丰富，技艺精湛，主要分布在门楼、影壁、窗户等处，内容包括人物、花鸟、山水等。'
                        },
                        {
                            title: '木雕装饰',
                            description: '大院内的木雕装饰精美，主要分布在门窗、隔扇、梁柱等处，雕刻技法多样，立体感强。'
                        },
                        {
                            title: '院落布局',
                            description: '大院布局严谨，遵循中轴对称的原则，同时结合地形特点，形成高低错落的空间格局，体现了传统建筑的设计智慧。'
                        }
                    ],
                    openingHours: '08:00-18:00（周一至周日）',
                    ticketPrice: '¥90/人',
                    suggestedVisitTime: '3-4小时',
                    bestSeason: '春季、秋季',
                    images: [
                        'https://tse2-mm.cn.bing.net/th/id/OIP-C.1ZeF6GITjZ4r7_-RXaTY1AHaE8?w=272&h=182&c=7&r=0&o=5&pid=1.7',
                        'https://tse3-mm.cn.bing.net/th/id/OIP-C.P-be5tbKOiCsZ5NL_jy2CwHaE3?w=277&h=182&c=7&r=0&o=5&pid=1.7',
                        'https://tse1-mm.cn.bing.net/th/id/OIP-C.JfsDYaRWJe_aG-kpMfCcBwHaE8?w=277&h=185&c=7&r=0&o=5&pid=1.7'
                    ]
                }
            }
        }
    },
    onLoad(options) {
        // 获取状态栏高度
        this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        
        // 获取景点ID并加载数据
        if (options.id) {
            this.id = parseInt(options.id);
            this.loadSpotDetail();
        }
    },
    methods: {
        loadSpotDetail() {
            // 从虚拟数据中获取景点详情
            if (this.spotsData[this.id]) {
                this.spotDetail = this.spotsData[this.id];
            } else {
                // 如果ID不存在，显示提示并返回
                uni.showToast({
                    title: '景点信息不存在',
                    icon: 'none'
                });
                setTimeout(() => {
                    this.goBack();
                }, 1500);
            }
        },
        goBack() {
            uni.navigateBack();
        },
        handleCollect() {
            this.isCollected = !this.isCollected;
            uni.showToast({
                title: this.isCollected ? '收藏成功' : '已取消收藏',
                icon: 'none'
            });
        },
        handleShare() {
            uni.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            });
        },
        openMap() {
            // 实际应用中应使用真实的经纬度
            uni.showToast({
                title: '正在打开地图导航...',
                icon: 'none'
            });
        },
        startAR() {
            uni.showModal({
                title: 'AR导览体验',
                content: '即将开启AR导览体验，请确保您已授权相机权限',
                success: (res) => {
                    if (res.confirm) {
                        uni.navigateTo({
                            url: `/pages/AR/AR?spotId=${this.id}&spotName=${encodeURIComponent(this.spotDetail.name)}`
                        });
                    }
                }
            });
        }
    }
}
</script>

<style lang="scss">
.detail-container {
    background-color: #f8f8f8;
    min-height: 100vh;
    position: relative;

    .swiper {
        height: 45vh;
        position: relative;
        
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
            z-index: 5;
        }
        
        .swiper-image {
            width: 100%;
            height: 100%;
        }
    }

    .back-btn {
        position: absolute;
        left: 20px;
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .content {
        margin-top: -30px;
        background-color: #fff;
        border-radius: 20px 20px 0 0;
        padding: 24px;
        padding-bottom: 80px;
        position: relative;
        z-index: 10;
        box-shadow: 0 -10px 20px rgba(0,0,0,0.1);

        .basic-info {
            margin-bottom: 24px;
            
            .title-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }
                
                .rating {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    
                    text {
                        color: #666;
                        font-size: 16px;
                    }
                }
            }
            
            .address-row {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 16px;
                
                text {
                    color: #666;
                    font-size: 14px;
                }
            }
            
            .tag-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 16px;
                
                .tag {
                    padding: 4px 14px;
                    background-color: #f0f2f5;
                    border-radius: 16px;
                    font-size: 12px;
                    color: #4A5568;
                    font-weight: 500;
                }
            }
            
            .action-row {
                display: flex;
                justify-content: space-around;
                border-top: 1px solid #eee;
                margin-top: 5px;
                padding-top: 16px;
                
                .action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    
                    text {
                        font-size: 13px;
                        color: #666;
                    }
                }
            }
        }
        
        .section {
            margin-bottom: 30px;
            
            .section-title {
                margin-bottom: 16px;
                border-left: 4px solid #4A5568;
                padding-left: 12px;
                
                text {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }
            }
            
            .section-content {
                .description {
                    font-size: 15px;
                    color: #666;
                    line-height: 1.7;
                    text-align: justify;
                }
                
                .feature-item {
                    display: flex;
                    margin-bottom: 18px;
                    
                    .feature-number {
                        width: 28px;
                        height: 28px;
                        background: linear-gradient(135deg, #4A5568, #2D3748);
                        color: #fff;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        margin-right: 12px;
                        flex-shrink: 0;
                        box-shadow: 0 2px 6px rgba(74, 85, 104, 0.2);
                    }
                    
                    .feature-content {
                        flex: 1;
                        
                        .feature-title {
                            font-size: 16px;
                            font-weight: bold;
                            color: #333;
                            margin-bottom: 6px;
                            display: block;
                        }
                        
                        .feature-desc {
                            font-size: 14px;
                            color: #666;
                            line-height: 1.6;
                        }
                    }
                }
                
                &.info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-gap: 16px;
                    
                    .info-item {
                        background-color: #f5f7fa;
                        padding: 16px;
                        border-radius: 12px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                        
                        .info-label {
                            font-size: 12px;
                            color: #999;
                            margin-bottom: 6px;
                            display: block;
                        }
                        
                        .info-value {
                            font-size: 15px;
                            color: #333;
                            font-weight: 500;
                        }
                    }
                }
            }
        }
    }
    
    .detail-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #fff;
        padding: 12px 20px 20px;
        box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.08);
        display: flex;
        justify-content: center;
        z-index: 999;
        
        .ar-btn {
            width: 90%;
            background: linear-gradient(135deg, #4A5568, #2D3748);
            height: 52px;
            border-radius: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 6px 15px rgba(45, 55, 72, 0.25);
            transition: all 0.3s ease;
            
            &:active {
                transform: scale(0.98);
                box-shadow: 0 3px 8px rgba(45, 55, 72, 0.2);
            }
            
            text {
                color: #fff;
                font-size: 16px;
                font-weight: 500;
                letter-spacing: 1px;
            }
        }
    }
}
</style> 