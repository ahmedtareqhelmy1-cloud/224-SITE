import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { order, buyerEmail } = req.body || {};
  if (!order) {
    res.status(400).json({ error: 'Missing order' });
    return;
  }

  const MJ_APIKEY_PUBLIC = process.env.MAILJET_API_KEY;
  const MJ_APIKEY_PRIVATE = process.env.MAILJET_API_SECRET;
  const TEMPLATE_ID = Number(process.env.MAILJET_TEMPLATE_ID || 7429596);
  const SENDER = process.env.MAILJET_SENDER || 'no-reply@your-domain.com';
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com';

  if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
    res.status(501).json({ error: 'Mailjet keys not configured' });
    return;
  }

  // We no longer attach or show a logo in the email; product image only
  let inlineAttachments = undefined;

  // Derive a product image from the first order item
  const firstItem = Array.isArray(order?.items) && order.items.length ? order.items[0] : null;
  const isImage = (v)=> typeof v === 'string' && (/^(https?:\/\/|\/)/.test(v) || /\.(png|jpe?g|webp|svg)$/i.test(v));
  const arrCandidates = firstItem && Array.isArray(firstItem.images) ? firstItem.images.filter(isImage) : [];
  const objCandidates = firstItem && firstItem.images && typeof firstItem.images === 'object' && !Array.isArray(firstItem.images)
    ? Object.values(firstItem.images).filter(isImage)
    : [];
  const productImage = [firstItem?.thumbnail, firstItem?.imageUrl, firstItem?.image, ...arrCandidates, ...objCandidates].filter(isImage)[0] || '';

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
        },
        ...(inlineAttachments ? { InlineAttachments: inlineAttachments } : {})
      }
    ]
  };

  try {
    const auth = Buffer.from(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`).toString('base64');
    const r = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Mailjet error', data);
      res.status(r.status).json({ error: 'Mailjet send failed', details: data });
      return;
    }

    res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error('Mailjet request failed', e);
    res.status(500).json({ error: 'Server error', details: String(e) });
  }
}
