// 购物车数据
let cartItems = []

// 添加商品到购物车
export const addToCart = (product, quantity = 1) => {
	const existingItem = cartItems.find(item => item.id === product.id)
	
	if (existingItem) {
		existingItem.quantity += quantity
	} else {
		cartItems.push({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			quantity: quantity,
			selected: true
		})
	}

	return {
		code: 200,
		msg: '添加成功',
		data: getCartItems()
	}
}

// 获取购物车商品
export const getCartItems = () => {
	return {
		code: 200,
		msg: '获取成功',
		data: {
			items: cartItems,
			total: calculateTotal(cartItems.filter(item => item.selected))
		}
	}
}

// 更新购物车商品数量
export const updateCartItemQuantity = (productId, quantity) => {
	const item = cartItems.find(item => item.id === productId)
	if (item) {
		item.quantity = quantity
	}

	return {
		code: 200,
		msg: '更新成功',
		data: getCartItems()
	}
}

// 删除购物车商品
export const removeFromCart = (productId) => {
	cartItems = cartItems.filter(item => item.id !== productId)

	return {
		code: 200,
		msg: '删除成功',
		data: getCartItems()
	}
}

// 更新商品选中状态
export const updateCartItemSelection = (productId, selected) => {
	const item = cartItems.find(item => item.id === productId)
	if (item) {
		item.selected = selected
	}

	return {
		code: 200,
		msg: '更新成功',
		data: getCartItems()
	}
}

// 全选/取消全选
export const updateAllCartItemsSelection = (selected) => {
	cartItems.forEach(item => item.selected = selected)

	return {
		code: 200,
		msg: '更新成功',
		data: getCartItems()
	}
}

// 计算总价
const calculateTotal = (items) => {
	return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

// 订单数据
let orders = []

// 创建订单
export const createOrder = (address, items) => {
	const orderId = Date.now().toString()
	const order = {
		id: orderId,
		items: items,
		total: calculateTotal(items),
		status: 'pending', // pending, paid, shipped, completed, cancelled
		createTime: new Date().toISOString(),
		address: address
	}
	
	orders.push(order)
	
	// 从购物车中移除已下单的商品
	items.forEach(item => {
		cartItems = cartItems.filter(cartItem => cartItem.id !== item.id)
	})

	return {
		code: 200,
		msg: '创建成功',
		data: order
	}
}

// 获取订单列表
export const getOrders = () => {
	return {
		code: 200,
		msg: '获取成功',
		data: orders
	}
}

// 获取订单详情
export const getOrderDetail = (orderId) => {
	const order = orders.find(item => item.id === orderId)
	
	if (order) {
		return {
			code: 200,
			msg: '获取成功',
			data: order
		}
	}
	
	return {
		code: 404,
		msg: '订单不存在',
		data: null
	}
}

// 更新订单状态
export const updateOrderStatus = (orderId, status) => {
	const order = orders.find(item => item.id === orderId)
	
	if (order) {
		order.status = status
		return {
			code: 200,
			msg: '更新成功',
			data: order
		}
	}
	
	return {
		code: 404,
		msg: '订单不存在',
		data: null
	}
} 