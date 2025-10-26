import fs from 'fs';
import path from 'path';
import emailjs from '@emailjs/nodejs';

const dataPath = path.join(process.cwd(), 'data');
const ordersFile = path.join(dataPath, 'orders.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order, buyerEmail } = req.body;
    if (!order) {
      return res.status(400).json({ error: 'Missing order data' });
    }

    // Ensure data directory exists
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    // Function to get full URL for an image path
    const getFullImageUrl = (imgPath) => {
      if (!imgPath) return 'https://via.placeholder.com/64';
      if (imgPath.startsWith('http')) return imgPath;
      const base = process.env.NEXT_PUBLIC_BASE_URL || `http://${req.headers.host}`;
      return `${base}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    // Process order items with proper image URLs
    const processOrderItems = (items = []) => {
      return items.map(item => {
        // Get the first available image from the item
        const itemImage = [item.thumbnail, item.imageUrl, item.image, ...(item.images || [])]
          .filter(Boolean)
          .find(img => typeof img === 'string' && img.trim() !== '');
        
        return {
          name: item.name || 'Product',
          units: item.quantity || 1,
          price: (item.price || 0).toFixed(2),
          image_url: getFullImageUrl(itemImage)
        };
      });
    };

    // Calculate costs
    const subtotal = order.subtotal || (order.items || []).reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    const tax = order.tax || 0;
    const shipping = order.shippingCost || 0;
    const total = order.total || (subtotal + tax + shipping);

    // Prepare email template parameters
    const templateParams = {
      email: buyerEmail || 'customer@example.com',
      order_id: order.id || `#${Math.floor(10000 + Math.random() * 90000)}`,
      orders: processOrderItems(order.items),
      cost: {
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      }
    };

    // Save order to file (optional)
    const orders = fs.existsSync(ordersFile) 
      ? JSON.parse(fs.readFileSync(ordersFile, 'utf8')) 
      : [];
    
    orders.push({
      ...order,
      id: templateParams.order_id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    // Send email using EmailJS
    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.VITE_EMAILJS_TEMPLATE_ORDER,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    return res.status(200).json({ 
      ok: true, 
      data: result,
      message: 'Order confirmation email sent successfully',
      orderId: templateParams.order_id
    });

  } catch (error) {
    console.error('Order processing failed:', error);
    return res.status(500).json({ 
      ok: false,
      error: 'Failed to process order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}