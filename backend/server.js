const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
app.use(cors())
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

// Backend proxy uploader: accept images and return public URLs served by this backend
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

// Multer error handler (file too large, etc.)
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
  // Store contact message and optional file
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

// Send order confirmation via Mailjet (no logo, product image only)
app.post('/api/send-order', async (req, res) => {
  try {
    const { order, buyerEmail } = req.body || {}
    if (!order) return res.status(400).json({ error: 'Missing order' })

    const MJ_APIKEY_PUBLIC = process.env.MAILJET_API_KEY
    const MJ_APIKEY_PRIVATE = process.env.MAILJET_API_SECRET
    const TEMPLATE_ID = Number(process.env.MAILJET_TEMPLATE_ID || 7429596)
    const SENDER = process.env.MAILJET_SENDER || 'no-reply@your-domain.com'
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com'

    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      return res.status(501).json({ error: 'Mailjet keys not configured' })
    }

    const firstItem = Array.isArray(order?.items) && order.items.length ? order.items[0] : null
    const isImage = (v) => typeof v === 'string' && (/^(https?:\/\/|\/)/.test(v) || /\.(png|jpe?g|webp|svg)$/i.test(v))
    const arrCandidates = firstItem && Array.isArray(firstItem.images) ? firstItem.images.filter(isImage) : []
    const objCandidates = firstItem && firstItem.images && typeof firstItem.images === 'object' && !Array.isArray(firstItem.images)
      ? Object.values(firstItem.images).filter(isImage)
      : []
    const productImage = [firstItem?.thumbnail, firstItem?.imageUrl, firstItem?.image, ...arrCandidates, ...objCandidates].filter(isImage)[0] || ''

    const payload = {
      Messages: [
        {
          From: { Email: SENDER, Name: 'Order Confirmation' },
          To: [{ Email: buyerEmail || ADMIN_EMAIL }],
          Cc: [{ Email: ADMIN_EMAIL }],
          TemplateID: TEMPLATE_ID,
          TemplateLanguage: true,
          Variables: {
            ...(order || {}),
            logo_url: '',
            product_image: productImage
          }
        }
      ]
    }

    const auth = Buffer.from(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`).toString('base64')
    const r = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      console.error('Mailjet error', data)
      return res.status(r.status).json({ error: 'Mailjet send failed', details: data })
    }
    return res.status(200).json({ ok: true, data })
  } catch (e) {
    console.error('Mailjet request failed', e)
    return res.status(500).json({ error: 'Server error', details: String(e) })
  }
})

app.post('/api/paymob',(req,res)=>{
  // Placeholder: in production this would create a payment request with Paymob
  const body = req.body
  // return a fake token
  res.json({ok:true,paymob_token:'tok_fake_12345',integration_id:process.env.PAYMOB_INTEGRATION_ID || null})
})

const argPort = parseInt(process.argv[2], 10)
const PORT = argPort || process.env.PORT || 4000
app.listen(PORT, ()=>console.log('Backend running on', PORT))
