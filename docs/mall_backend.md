# 晋韵古建商城模块 - 后端开发文档

## 一、数据库设计

### 1. 商品表 (product)
```sql
CREATE TABLE product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '商品名称',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    price DECIMAL(10,2) NOT NULL COMMENT '商品价格',
    original_price DECIMAL(10,2) COMMENT '原价',
    stock INT NOT NULL DEFAULT 0 COMMENT '库存',
    sales INT NOT NULL DEFAULT 0 COMMENT '销量',
    image VARCHAR(255) NOT NULL COMMENT '主图',
    images TEXT COMMENT '商品图片，JSON数组',
    description TEXT COMMENT '商品描述',
    details TEXT COMMENT '商品详情',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

### 2. 商品分类表 (category)
```sql
CREATE TABLE category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    image VARCHAR(255) COMMENT '分类图标',
    sort INT NOT NULL DEFAULT 0 COMMENT '排序',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';
```

### 3. 购物车表 (cart)
```sql
CREATE TABLE cart (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    selected TINYINT NOT NULL DEFAULT 1 COMMENT '是否选中：0-否，1-是',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';
```

### 4. 订单表 (order)
```sql
CREATE TABLE `order` (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    freight_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '运费',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态：0-待付款，1-待发货，2-待收货，3-已完成，4-已取消',
    payment_time DATETIME COMMENT '支付时间',
    delivery_time DATETIME COMMENT '发货时间',
    receive_time DATETIME COMMENT '收货时间',
    address_id BIGINT NOT NULL COMMENT '收货地址ID',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    receiver_province VARCHAR(20) NOT NULL COMMENT '省份',
    receiver_city VARCHAR(20) NOT NULL COMMENT '城市',
    receiver_district VARCHAR(20) NOT NULL COMMENT '区县',
    receiver_address VARCHAR(200) NOT NULL COMMENT '详细地址',
    remark VARCHAR(500) COMMENT '订单备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

### 5. 订单商品表 (order_item)
```sql
CREATE TABLE order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称',
    product_image VARCHAR(255) NOT NULL COMMENT '商品图片',
    price DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    quantity INT NOT NULL COMMENT '购买数量',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '商品总价',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表';
```

### 6. 收货地址表 (address)
```sql
CREATE TABLE address (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    province VARCHAR(20) NOT NULL COMMENT '省份',
    city VARCHAR(20) NOT NULL COMMENT '城市',
    district VARCHAR(20) NOT NULL COMMENT '区县',
    detail VARCHAR(200) NOT NULL COMMENT '详细地址',
    is_default TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认地址：0-否，1-是',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';
```

## 二、API接口设计

### 1. 商品相关接口

#### 1.1 获取商品列表
- 请求路径：`/api/mall/products`
- 请求方法：GET
- 请求参数：
  ```json
  {
    "categoryId": "分类ID（可选）",
    "keyword": "搜索关键词（可选）",
    "page": "页码，默认1",
    "size": "每页数量，默认10",
    "sort": "排序方式：price_asc-价格升序，price_desc-价格降序，sales_desc-销量降序"
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": "总数",
      "list": [
        {
          "id": "商品ID",
          "name": "商品名称",
          "price": "价格",
          "image": "商品图片",
          "sales": "销量"
        }
      ]
    }
  }
  ```

#### 1.2 获取商品详情
- 请求路径：`/api/mall/products/{id}`
- 请求方法：GET
- 响应数据：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "商品ID",
      "name": "商品名称",
      "categoryId": "分类ID",
      "price": "价格",
      "originalPrice": "原价",
      "stock": "库存",
      "sales": "销量",
      "image": "主图",
      "images": ["图片数组"],
      "description": "商品描述",
      "details": "商品详情"
    }
  }
  ```

### 2. 购物车相关接口

#### 2.1 获取购物车列表
- 请求路径：`/api/mall/cart`
- 请求方法：GET
- 响应数据：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "items": [
        {
          "id": "购物车ID",
          "productId": "商品ID",
          "name": "商品名称",
          "image": "商品图片",
          "price": "价格",
          "quantity": "数量",
          "selected": "是否选中"
        }
      ],
      "totalPrice": "选中商品总价"
    }
  }
  ```

#### 2.2 添加商品到购物车
- 请求路径：`/api/mall/cart`
- 请求方法：POST
- 请求参数：
  ```json
  {
    "productId": "商品ID",
    "quantity": "数量"
  }
  ```

#### 2.3 更新购物车商品数量
- 请求路径：`/api/mall/cart/{id}/quantity`
- 请求方法：PUT
- 请求参数：
  ```json
  {
    "quantity": "数量"
  }
  ```

#### 2.4 更新购物车商品选中状态
- 请求路径：`/api/mall/cart/{id}/selected`
- 请求方法：PUT
- 请求参数：
  ```json
  {
    "selected": "是否选中：0-否，1-是"
  }
  ```

#### 2.5 删除购物车商品
- 请求路径：`/api/mall/cart/{id}`
- 请求方法：DELETE

### 3. 订单相关接口

#### 3.1 创建订单
- 请求路径：`/api/mall/orders`
- 请求方法：POST
- 请求参数：
  ```json
  {
    "addressId": "收货地址ID",
    "cartIds": ["购物车ID数组"],
    "remark": "订单备注（可选）"
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "orderId": "订单ID",
      "orderNo": "订单号"
    }
  }
  ```

#### 3.2 获取订单详情
- 请求路径：`/api/mall/orders/{id}`
- 请求方法：GET
- 响应数据：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "订单ID",
      "orderNo": "订单号",
      "status": "订单状态",
      "totalAmount": "订单总金额",
      "payAmount": "实付金额",
      "freightAmount": "运费",
      "createTime": "创建时间",
      "paymentTime": "支付时间",
      "deliveryTime": "发货时间",
      "receiveTime": "收货时间",
      "address": {
        "name": "收货人",
        "phone": "电话",
        "province": "省份",
        "city": "城市",
        "district": "区县",
        "detail": "详细地址"
      },
      "items": [
        {
          "productId": "商品ID",
          "name": "商品名称",
          "image": "商品图片",
          "price": "单价",
          "quantity": "数量",
          "totalAmount": "商品总价"
        }
      ]
    }
  }
  ```

#### 3.3 取消订单
- 请求路径：`/api/mall/orders/{id}/cancel`
- 请求方法：POST

#### 3.4 支付订单
- 请求路径：`/api/mall/orders/{id}/pay`
- 请求方法：POST
- 响应数据：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      // 支付相关参数，根据具体支付方式返回不同的数据
    }
  }
  ```

### 4. 地址相关接口

#### 4.1 获取地址列表
- 请求路径：`/api/mall/addresses`
- 请求方法：GET
- 响应数据：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "地址ID",
        "name": "收货人",
        "phone": "电话",
        "province": "省份",
        "city": "城市",
        "district": "区县",
        "detail": "详细地址",
        "isDefault": "是否默认"
      }
    ]
  }
  ```

#### 4.2 添加地址
- 请求路径：`/api/mall/addresses`
- 请求方法：POST
- 请求参数：
  ```json
  {
    "name": "收货人",
    "phone": "电话",
    "province": "省份",
    "city": "城市",
    "district": "区县",
    "detail": "详细地址",
    "isDefault": "是否默认：0-否，1-是"
  }
  ```

#### 4.3 更新地址
- 请求路径：`/api/mall/addresses/{id}`
- 请求方法：PUT
- 请求参数：同添加地址

#### 4.4 删除地址
- 请求路径：`/api/mall/addresses/{id}`
- 请求方法：DELETE

#### 4.5 设置默认地址
- 请求路径：`/api/mall/addresses/{id}/default`
- 请求方法：POST

## 三、注意事项

1. 数据安全
   - 所有接口需要进行用户认证
   - 敏感数据需要加密处理
   - 防止SQL注入等安全问题

2. 性能优化
   - 合理使用缓存
   - 针对商品列表等高频接口进行优化
   - 大数据量场景需要考虑分页处理

3. 订单处理
   - 订单创建需要保证原子性
   - 库存扣减需要加锁处理
   - 支付超时需要自动取消订单
   - 考虑订单并发处理的情况

4. 数据一致性
   - 订单状态变更需要记录日志
   - 重要操作需要添加事务处理
   - 考虑分布式事务的情况

## 四、开发建议

1. 技术选型
   - 后端框架：Spring Boot
   - 数据库：MySQL
   - 缓存：Redis
   - 消息队列：RabbitMQ（处理订单相关异步任务）

2. 项目结构
```
src/main/java/com/jinyu/mall
├── config        // 配置类
├── controller    // 控制器
├── service       // 业务逻辑
├── repository    // 数据访问
├── entity        // 实体类
├── dto           // 数据传输对象
├── vo           // 视图对象
├── constant     // 常量定义
├── util         // 工具类
└── exception    // 异常处理
```

3. 代码规范
   - 遵循阿里巴巴Java开发手册
   - 统一的命名规范
   - 完善的注释和文档
   - 合理的异常处理机制

4. 测试建议
   - 单元测试覆盖核心业务逻辑
   - 接口测试确保API正确性
   - 压力测试验证系统性能
   - 模拟各种异常情况的测试 