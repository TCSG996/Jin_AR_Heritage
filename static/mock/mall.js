// 商品分类
export const categories = [{
	id: 1,
	name: '趣味文创',
	icon: '/static/mall/category-1.png'
}, {
	id: 2,
	name: '特产美食',
	icon: '/static/mall/category-2.jpg'
}, {
	id: 3,
	name: '特色非遗',
	icon: '/static/mall/category-3.jpg'
}]

// 热门推荐商品
export const hotProducts = [{
	id: 101,
	name: '晋祠文创杯',
	price: 39.9,
	sales: 256,
	rating: 4.8,
	image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.6UjZKkjEc7WtnGKMd82_PgHaHa?w=202&h=202&c=7&r=0&o=5&pid=1.7',
	description: '以晋祠建筑为灵感的文创水杯，精美实用',
	category: 1
}, {
	id: 102,
	name: '山西老陈醋',
	price: 29.9,
	sales: 1890,
	rating: 4.9,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.Iz-_i_ejeRGBSv0Woe-jvQHaHa?w=200&h=200&c=7&r=0&o=5&pid=1.7',
	description: '正宗山西老陈醋，传统工艺酿造',
	category: 2
}, {
	id: 103,
	name: '手工剪纸',
	price: 19.9,
	sales: 158,
	rating: 4.7,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.pfaRHCYBwyjYCiwtqXr01QHaKd?w=150&h=211&c=7&r=0&o=5&pid=1.7',
	description: '传统手工剪纸艺术，精美绝伦',
	category: 3
}, {
	id: 104,
	name: '太谷饼',
	price: 25.8,
	sales: 2560,
	rating: 4.8,
	image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.78A-kzuqg6lWKP6kiZaepwAAAA?w=211&h=181&c=7&r=0&o=5&pid=1.7',
	description: '正宗太谷饼，香甜可口',
	category: 2
}, {
	id: 105,
	name: '晋祠建筑模型',
	price: 128.0,
	sales: 89,
	rating: 4.9,
	image: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.PPVQh88hvG0FHwLHRUU9VwHaHa?w=196&h=195&c=7&r=0&o=5&pid=1.7',
	description: '精致的晋祠圣母殿微缩模型',
	category: 1
}, {
	id: 106,
	name: '山西特色小吃礼盒',
	price: 99.0,
	sales: 567,
	rating: 4.7,
	image: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.nO4iQdcwOzBGjScNOfEhEQHaFi?w=257&h=192&c=7&r=0&o=5&pid=1.7',
	description: '精选多种山西特色小吃',
	category: 2
}]

// 特色商品
export const featureProducts = [{
	id: 201,
	name: '晋祠纪念套装',
	price: 99.0,
	sales: 128,
	rating: 4.9,
	image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.cESysGw3wi25Ysfb92W0TAHaHa?w=175&h=180&c=7&r=0&o=5&pid=1.7',
	description: '晋祠特制纪念套装，含微缩模型、明信片等',
	details: '套装包含晋祠圣母殿微缩模型、精美明信片set、文创徽章等',
	category: 1
}, {
	id: 202,
	name: '山西特色小吃礼盒',
	price: 128.0,
	sales: 356,
	rating: 4.8,
	image: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.PPVQh88hvG0FHwLHRUU9VwHaHa?w=196&h=195&c=7&r=0&o=5&pid=1.7',
	description: '精选山西特色小吃，礼盒装',
	details: '包含太谷饼、麻花、核桃酥等多种特色小吃',
	category: 2
}, {
	id: 203,
	name: '晋祠建筑艺术画册',
	price: 158.0,
	sales: 89,
	rating: 4.9,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.IjqS5UiFMx2Kav_FoPfA2wHaFj?w=244&h=183&c=7&r=0&o=5&pid=1.7',
	description: '高清实拍晋祠建筑艺术画册',
	details: '专业摄影师实地拍摄，展现晋祠建筑之美',
	category: 1
}, {
	id: 204,
	name: '手工艺品展示盒',
	price: 299.0,
	sales: 45,
	rating: 4.9,
	image: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.EFojHXM-_SQlLtvfFB1CyQAAAA?w=289&h=192&c=7&r=0&o=5&pid=1.7',
	description: '精美手工艺品展示收纳盒',
	details: '采用优质实木制作，内置LED照明，完美展示收藏品',
	category: 3
}, {
	id: 205,
	name: '传统工艺茶具套装',
	price: 468.0,
	sales: 78,
	rating: 4.8,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.GvHibVGyDO8OktU_ON2shQHaHa?w=192&h=192&c=7&r=0&o=5&pid=1.7',
	description: '传统手工制作茶具套装',
	details: '传统工艺制作，一壶四杯，送精美收纳盒',
	category: 3
}]

// 新品上架
export const newProducts = [{
	id: 301,
	name: '晋祠文创T恤',
	price: 89.0,
	sales: 56,
	rating: 4.7,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.GvHibVGyDO8OktU_ON2shQHaHa?w=192&h=192&c=7&r=0&o=5&pid=1.7',
	description: '舒适面料，独特晋祠元素设计',
	category: 1
}, {
	id: 302,
	name: '山西民间工艺品',
	price: 159.0,
	sales: 28,
	rating: 4.8,
	image: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.EFojHXM-_SQlLtvfFB1CyQAAAA?w=289&h=192&c=7&r=0&o=5&pid=1.7',
	description: '传统手工艺品，珍贵收藏价值',
	category: 3
}, {
	id: 303,
	name: '晋祠AR互动书',
	price: 49.9,
	sales: 168,
	rating: 4.9,
	image: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.nO4iQdcwOzBGjScNOfEhEQHaFi?w=257&h=192&c=7&r=0&o=5&pid=1.7',
	description: 'AR技术呈现晋祠历史文化',
	category: 1
}, {
	id: 304,
	name: '手工刺绣装饰画',
	price: 299.0,
	sales: 15,
	rating: 5.0,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.pfaRHCYBwyjYCiwtqXr01QHaKd?w=150&h=211&c=7&r=0&o=5&pid=1.7',
	description: '传统刺绣工艺，精美装饰画',
	category: 3
}, {
	id: 305,
	name: '特制老陈醋礼盒',
	price: 168.0,
	sales: 42,
	rating: 4.9,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.Iz-_i_ejeRGBSv0Woe-jvQHaHa?w=200&h=200&c=7&r=0&o=5&pid=1.7',
	description: '珍藏版老陈醋，精美礼盒装',
	category: 2
}]

// 更多趣味文创商品
export const categoryOneProducts = [{
	id: 401,
	name: '晋祠主题笔记本',
	price: 29.9,
	sales: 120,
	rating: 4.6,
	image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.6UjZKkjEc7WtnGKMd82_PgHaHa?w=202&h=202&c=7&r=0&o=5&pid=1.7',
	description: '创意设计笔记本，古建筑元素',
	category: 1
}, {
	id: 402,
	name: '文创帆布包',
	price: 69.0,
	sales: 85,
	rating: 4.7,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.GvHibVGyDO8OktU_ON2shQHaHa?w=192&h=192&c=7&r=0&o=5&pid=1.7',
	description: '实用文创帆布包，古建风格图案',
	category: 1
}, {
	id: 403,
	name: '晋祠明信片套装',
	price: 19.9,
	sales: 230,
	rating: 4.8,
	image: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.nO4iQdcwOzBGjScNOfEhEQHaFi?w=257&h=192&c=7&r=0&o=5&pid=1.7',
	description: '精美晋祠风光明信片，12张/套',
	category: 1
}]

// 更多特产美食
export const categoryTwoProducts = [{
	id: 501,
	name: '手工面条礼盒',
	price: 58.0,
	sales: 320,
	rating: 4.8,
	image: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.PPVQh88hvG0FHwLHRUU9VwHaHa?w=196&h=195&c=7&r=0&o=5&pid=1.7',
	description: '传统工艺制作的手工面条',
	category: 2
}, {
	id: 502,
	name: '精选核桃礼盒',
	price: 138.0,
	sales: 156,
	rating: 4.9,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.Iz-_i_ejeRGBSv0Woe-jvQHaHa?w=200&h=200&c=7&r=0&o=5&pid=1.7',
	description: '山西特产薄皮核桃',
	category: 2
}, {
	id: 503,
	name: '传统糕点礼盒',
	price: 88.0,
	sales: 245,
	rating: 4.7,
	image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.78A-kzuqg6lWKP6kiZaepwAAAA?w=211&h=181&c=7&r=0&o=5&pid=1.7',
	description: '传统手工糕点组合装',
	category: 2
}]

// 更多特色非遗
export const categoryThreeProducts = [{
	id: 601,
	name: '传统剪纸艺术',
	price: 299.0,
	sales: 45,
	rating: 5.0,
	image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.pfaRHCYBwyjYCiwtqXr01QHaKd?w=150&h=211&c=7&r=0&o=5&pid=1.7',
	description: '大师手工剪纸作品',
	category: 3
}, {
	id: 602,
	name: '传统布艺挂件',
	price: 168.0,
	sales: 67,
	rating: 4.8,
	image: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.EFojHXM-_SQlLtvfFB1CyQAAAA?w=289&h=192&c=7&r=0&o=5&pid=1.7',
	description: '手工制作布艺装饰品',
	category: 3
}, {
	id: 603,
	name: '传统陶艺摆件',
	price: 258.0,
	sales: 34,
	rating: 4.9,
	image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.cESysGw3wi25Ysfb92W0TAHaHa?w=175&h=180&c=7&r=0&o=5&pid=1.7',
	description: '手工陶艺工艺品',
	category: 3
}]

// 获取商品列表（模拟分页）
export const getProducts = (type, page = 1, pageSize = 10) => {
	let sourceData = []
	switch (type) {
		case 'hot':
			sourceData = hotProducts
			break
		case 'feature':
			sourceData = featureProducts
			break
		case 'new':
			sourceData = newProducts
			break
		default:
			sourceData = hotProducts
	}

	const start = (page - 1) * pageSize
	const end = start + pageSize
	const data = sourceData.slice(start, end)

	return {
		code: 200,
		msg: '获取成功',
		data: {
			list: data,
			total: sourceData.length,
			hasMore: end < sourceData.length
		}
	}
}

// 获取商品详情
export const getProductDetail = (id) => {
	const allProducts = [...hotProducts, ...featureProducts, ...newProducts, ...categoryOneProducts, ...categoryTwoProducts, ...categoryThreeProducts]
	const product = allProducts.find(item => item.id === Number(id))

	if (product) {
		return {
			code: 200,
			msg: '获取成功',
			data: product
		}
	}

	return {
		code: 404,
		msg: '商品不存在',
		data: null
	}
}

// 获取分类商品
export const getCategoryProducts = (categoryId, page = 1, pageSize = 10) => {
	let categoryProducts = []
	switch (Number(categoryId)) {
		case 1:
			categoryProducts = [...categoryOneProducts, ...hotProducts.filter(item => item.category === 1), ...featureProducts.filter(item => item.category === 1), ...newProducts.filter(item => item.category === 1)]
			break
		case 2:
			categoryProducts = [...categoryTwoProducts, ...hotProducts.filter(item => item.category === 2), ...featureProducts.filter(item => item.category === 2), ...newProducts.filter(item => item.category === 2)]
			break
		case 3:
			categoryProducts = [...categoryThreeProducts, ...hotProducts.filter(item => item.category === 3), ...featureProducts.filter(item => item.category === 3), ...newProducts.filter(item => item.category === 3)]
			break
		default:
			categoryProducts = []
	}

	const start = (page - 1) * pageSize
	const end = start + pageSize
	const data = categoryProducts.slice(start, end)

	return {
		code: 200,
		msg: '获取成功',
		data: {
			list: data,
			total: categoryProducts.length,
			hasMore: end < categoryProducts.length
		}
	}
}

// 搜索商品
export const searchProducts = (keyword, page = 1, pageSize = 10) => {
	const allProducts = [...hotProducts, ...featureProducts, ...newProducts, ...categoryOneProducts, ...categoryTwoProducts, ...categoryThreeProducts]
	const searchResults = allProducts.filter(item => 
		item.name.toLowerCase().includes(keyword.toLowerCase()) || 
		item.description.toLowerCase().includes(keyword.toLowerCase())
	)

	const start = (page - 1) * pageSize
	const end = start + pageSize
	const data = searchResults.slice(start, end)

	return {
		code: 200,
		msg: '获取成功',
		data: {
			list: data,
			total: searchResults.length,
			hasMore: end < searchResults.length
		}
	}
}