import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    console.log('🔍 ===== CREATE ORDER REQUEST =====');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from auth:', req.user?._id);

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      totalAmount,
      amountPaid,
      remainingAmount,
      notes,
      items,
      userId
    } = req.body;

    // Use userId from body or from auth
    const finalUserId = userId || req.user?._id;

    // Validate required fields
    if (!customerName) throw new Error('customerName is required');
    if (!customerEmail) throw new Error('customerEmail is required');
    if (!customerPhone) throw new Error('customerPhone is required');
    if (!shippingAddress) throw new Error('shippingAddress is required');
    if (!shippingAddress?.address) throw new Error('shippingAddress.address is required');
    if (!shippingAddress?.city) throw new Error('shippingAddress.city is required');
    if (!shippingAddress?.region) throw new Error('shippingAddress.region is required');
    if (!paymentMethod) throw new Error('paymentMethod is required');
    if (!totalAmount) throw new Error('totalAmount is required');
    if (!items || !items.length) throw new Error('items are required');
    if (!finalUserId) throw new Error('userId is required');

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log('📝 Generated order number:', orderNumber);

    // Create order
    console.log('📝 Creating order in database...');
    const order = await Order.create({
      orderNumber,
      userId: finalUserId,
      status: 'pending',
      totalAmount,
      amountPaid: amountPaid || 0,
      remainingAmount: remainingAmount || 0,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        region: shippingAddress.region,
      },
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      notes: notes || '',
    });

    console.log('✅ Order created with ID:', order._id);

    // Create order items
    console.log('📝 Creating order items...');
    const orderItems = items.map((item) => ({
      orderId: order._id,
      productId: item.product_id,
      productName: item.product.name,
      productPrice: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const savedItems = await OrderItem.insertMany(orderItems);
    console.log(`✅ Created ${savedItems.length} order items`);

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stockQuantity: -item.quantity },
      });
      console.log(`📦 Updated stock for product ${item.product_id}`);
    }

    console.log('🎉 Order created successfully!');
    console.log('🔍 ===== END CREATE ORDER =====');

    res.status(201).json(order);
  } catch (error) {
    console.error('❌ ERROR CREATING ORDER:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    console.log('🔍 Fetching orders for user:', req.user._id);
    
    const orders = await Order.find({ userId: req.user._id })
      .sort('-createdAt');
    
    console.log(`✅ Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    console.log('🔍 Fetching all orders (admin)');
    
    const orders = await Order.find()
      .sort('-createdAt')
      .limit(100);
    
    console.log(`✅ Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    console.log('🔍 Fetching order by ID:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      console.log('❌ Unauthorized access to order');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    console.log('✅ Order found');
    res.json(order);
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    console.log('🔍 Updating order status:', req.params.id);
    console.log('📦 New status:', req.body.status);

    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status || order.status;
    
    if (req.body.status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    
    if (req.body.status === 'cancelled') {
      // Restore stock for cancelled orders
      const orderItems = await OrderItem.find({ orderId: order._id });
      
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: item.quantity },
        });
      }
    }

    const updatedOrder = await order.save();
    console.log('✅ Order status updated');

    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete order (admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    console.log('🔍 Deleting order:', req.params.id);

    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete associated order items
    await OrderItem.deleteMany({ orderId: order._id });
    
    // Delete the order
    await order.deleteOne();

    console.log('✅ Order deleted');
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};