import emailjs from 'emailjs-com'

export function sendOrderEmails(order, buyerEmail){
  const service = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const tpl = import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER_FALLBACK;
  const pub = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Normalize to absolute URL if needed
  const toAbsolute = (u)=>{
    if(!u) return ''
    if(/^https?:\/\//i.test(u)) return u
    if(u.startsWith('/')) return `${location.origin}${u}`
    return `${location.origin}/${u}`
  }

  // Map cart items to the template's expected structure
  const orders = (order.items || []).map(i => ({
    name: i.name || i.title || 'Item',
    units: i.quantity || 1,
    price: ((i.salePrice || i.price || 0) * (i.quantity || 1)).toFixed(2),
    image: toAbsolute(i.image || (Array.isArray(i.images) ? i.images[0] : '') || '')
  }));

  const shipping = typeof order.shippingCost === 'number'
    ? order.shippingCost
    : ((orders.reduce((t, x)=> t + parseFloat(x.price||0), 0) >= 3000) ? 0 : 50);
  const tax = 0;
  const logo = (import.meta.env.VITE_BRAND_LOGO_URL && /^https?:\/\//i.test(import.meta.env.VITE_BRAND_LOGO_URL))
    ? import.meta.env.VITE_BRAND_LOGO_URL
    : toAbsolute('logo.png');
  const base = {
    order_id: order.id,
    // List data for repeating section
    orders,
    // Cost breakdown object
    cost: {
      shipping: Number(shipping).toFixed(2),
      tax: tax.toFixed(2),
      total: Number(order.total ?? 0).toFixed(2)
    },
    // Extra fields if your template uses them
    total: order.total,
    status: order.status || 'Pending',
    payment: order.payment || 'COD',
    logo,
  };

  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com');
  const adminParams = { ...base, to_email: adminEmail, email: adminEmail, buyer_email: buyerEmail || '' };
  const adminSend = emailjs.send(service, tpl, adminParams, pub);

  const buyerSend = buyerEmail
    ? emailjs.send(service, tpl, { ...base, to_email: buyerEmail, email: buyerEmail, buyer_email: buyerEmail }, pub)
    : Promise.resolve();

  return Promise.all([adminSend, buyerSend]);
}

export function sendDesignEmail(design){
  const templateParams = {
    to_email: import.meta.env.VITE_ADMIN_EMAIL,
    design_id: design.id,
    productType: design.productType,
    designIdea: design.designIdea,
    userEmail: design.userEmail || ''
  }
  // reuse same service/template — create a separate template if desired
  const contactTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  return emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, contactTemplate, templateParams, import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
}
