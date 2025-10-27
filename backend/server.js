const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')
const emailjs = require('@emailjs/nodejs')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()
// Security headers
app.use(helmet())

// CORS allowlist from env (comma-separated). If not set, default to permissive for development.
const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || ''
const originAllowlist = String(rawOrigins).split(',').map(s => s.trim()).filter(Boolean)
const corsOptions = originAllowlist.length
  ? { origin: (origin, cb) => {
      if (!origin || originAllowlist.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    }, credentials: true }
  : { origin: true, credentials: true }
app.use(cors(corsOptions))

// Basic rate limiting to protect from bursts (customize via env)
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const dataPath = path.join(__dirname, 'data')
if(!fs.existsSync(dataPath)) fs.mkdirSync(dataPath)
const productsFile = path.join(dataPath, 'products.json')
const ordersFile = path.join(dataPath, 'orders.json')
const usersFile = path.join(dataPath, 'users.json')

if(!fs.existsSync(productsFile)){
  const sample = [{id:'p001',name:'Dark Denim Low Waist Baggy',price:1200,salePrice:950,isOnSale:true,isSoldOut:false,image:'/images/denim.png',sizeOptions:['S','M','L','XL'],colorOptions:['Black','Dark Blue','Gray'],description:'Premium low waist denim with a relaxed fit.'}]
  fs.writeFileSync(productsFile,JSON.stringify(sample,null,2))
}
if(!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile,JSON.stringify([],null,2))
if(!fs.existsSync(usersFile)) fs.writeFileSync(usersFile,JSON.stringify([],null,2))

// Serve uploaded files
const uploadsDir = path.join(dataPath, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

// Simple health check
app.get('/health', (req,res)=> res.send('ok'))

// Multer for file uploads
const multer = require('multer')
const storageM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const unique = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.\-]/g,'_')}` 
    cb(null, unique)
  }
})
const upload = multer({ storage: storageM, limits: { fileSize: 25 * 1024 * 1024 } })

// Backend proxy uploader
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try{
    const files = req.files || []
    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}` 
    const urls = files.map(f => `${base}/uploads/${f.filename}`)
    return res.json({ ok: true, urls })
  }catch(err){
    console.error('Upload failed:', err)
    res.status(500).json({ ok:false, error: err.message || 'Upload failed' })
  }
})

// Multer error handler
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ ok:false, error: 'File too large (max 25MB each)' })
  }
  if (err) {
    console.error('Server error:', err)
    return res.status(500).json({ ok:false, error: err.message || 'Server error' })
  }
  next()
})

// Routes
app.get('/api/products',(req,res)=>{
  const p = JSON.parse(fs.readFileSync(productsFile))
  res.json(p)
})

app.post('/api/products', upload.array('images', 6), (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsFile));
  const p = req.body || {}
  const id = `p${Math.floor(1000 + Math.random() * 9000)}` 
  const images = (req.files || []).map(f => `/uploads/${f.filename}`)
  const newProduct = {
    id,
    name: p.name || 'Untitled',
    description: p.description || '',
    price: Number(p.price) || 0,
    category: p.category || '',
    inStock: p.inStock === 'true' || p.inStock === true,
    images,
    createdAt: new Date().toISOString()
  }
  products.push(newProduct)
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2))
  res.json({ ok: true, id })
})

app.post('/api/orders',(req,res)=>{
  const orders = JSON.parse(fs.readFileSync(ordersFile))
  const order = req.body
  order.id = `#${Math.floor(10000+Math.random()*90000)}` 
  order.createdAt = new Date().toISOString()
  orders.push(order)
  fs.writeFileSync(ordersFile,JSON.stringify(orders,null,2))
  res.json({ok:true,orderId:order.id})
})

app.post('/api/users',(req,res)=>{
  const users = JSON.parse(fs.readFileSync(usersFile))
  const u = req.body
  const found = users.find(x=>x.id===u.id)
  if(found){ Object.assign(found,u) }
  else users.push(u)
  fs.writeFileSync(usersFile,JSON.stringify(users,null,2))
  res.json({ok:true})
})

app.post('/api/contact', upload.single('file'), (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersFile))
  const msg = req.body || {}
  if (req.file) {
    msg.file = `/uploads/${req.file.filename}` 
  }
  msg.id = `c_${Date.now()}` 
  msg.createdAt = new Date().toISOString()
  orders.push({ type: 'contact', ...msg })
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2))
  res.json({ ok: true })
})

// Send order confirmation via EmailJS
app.post('/api/send-order', async (req, res) => {
  try {
    const { order, buyerEmail } = req.body || {}
    if (!order) return res.status(400).json({ error: 'Missing order' })

    // Get first available image from order items
    const firstItem = Array.isArray(order?.items) && order.items.length ? order.items[0] : null
    const isImage = (v) => typeof v === 'string' && (/^(https?:\/\/|\/)/.test(v) || /\.(png|jpe?g|webp|svg)$/i.test(v))
    const arrCandidates = firstItem && Array.isArray(firstItem.images) ? firstItem.images.filter(isImage) : []
    const objCandidates = firstItem && firstItem.images && typeof firstItem.images === 'object' && !Array.isArray(firstItem.images)
      ? Object.values(firstItem.images).filter(isImage)
      : []
    const productImage = [firstItem?.thumbnail, firstItem?.imageUrl, firstItem?.image, ...arrCandidates, ...objCandidates].filter(isImage)[0] || ''

    // Calculate costs
    const subtotal = order.subtotal || (order.items || []).reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1))
    }, 0)
    
    const tax = order.tax || 0
    const shipping = order.shippingCost || 0
    const total = order.total || (subtotal + tax + shipping)

    // Prepare email template parameters
    const templateParams = {
      email: buyerEmail || 'customer@example.com',
      order_id: order.id || `#${Math.floor(10000 + Math.random() * 90000)}`,
      orders: (order.items || []).map(item => ({
        name: item.name || 'Product',
        units: item.quantity || 1,
        price: (item.price || 0).toFixed(2),
        image_url: item.image || productImage || 'https://via.placeholder.com/64'
      })),
      cost: {
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      }
    }

    // Send email using EmailJS
    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID,
      process.env.VITE_EMAILJS_TEMPLATE_ORDER || process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    )

    return res.json({ ok: true, data: result })
  } catch (error) {
    console.error('Email sending failed:', error)
    return res.status(500).json({ 
      ok: false,
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

app.post('/api/paymob',(req,res)=>{
  // Placeholder: in production this would create a payment request with Paymob
  const body = req.body
  // return a fake token
  res.json({ok:true,paymob_token:'tok_fake_12345',integration_id:process.env.PAYMOB_INTEGRATION_ID || null})
})

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not Found' })
})

const argPort = parseInt(process.argv[2], 10)
const PORT = argPort || process.env.PORT || 4000

// Export app for testing
module.exports = app

// Only start server when run directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => console.log('Backend running on', PORT))
}