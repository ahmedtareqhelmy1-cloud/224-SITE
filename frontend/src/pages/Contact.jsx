import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram } from 'react-icons/fa';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    comment: ''
  });
  const [attachedUrl, setAttachedUrl] = useState('');
  const [msg, setMsg] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAttach(file) {
    try{
      if(!file) return;
      const fd = new FormData();
      fd.append('images', file, file.name || 'attachment.jpg');
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const upRes = await fetch(`${apiBase}/api/upload`, { method: 'POST', body: fd });
      if(!upRes.ok){ throw new Error('Upload failed'); }
      const upJson = await upRes.json();
      const url = Array.isArray(upJson.urls) ? upJson.urls[0] : '';
      setAttachedUrl(url || '');
      if(url){
        setForm(f=> ({...f, comment: f.comment ? `${f.comment}\n\nAttachment: ${url}` : `Attachment: ${url}`}));
      }
    }catch(err){ setMsg('Failed to attach image'); }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const templateParams = {
      to_email: (import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com'),
      from_name: form.name,
      from_email: form.email,
      phone: form.phone,
      message: form.comment,
      image_url: attachedUrl || ''
    };
    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT || import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => setMsg('Message sent — we will contact you.'),
        () => setMsg('Failed to send message')
      );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[40vh] bg-black"
      >
        <div className="absolute inset-0">
          <img
            src="/images/contact-hero.jpg"
            alt="Contact Us"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl md:text-2xl">We'd Love to Hear From You</p>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
            <p className="text-gray-300 mb-8">
              Have questions about our products or services? We're here to help!
              Reach out to us through any of the following channels.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-gray-200">
              <FaEnvelope className="text-2xl text-pink-500" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>mohamedtareq543219@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-gray-200">
              <FaPhone className="text-2xl text-pink-500" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>01557266288</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-gray-200">
              <FaInstagram className="text-2xl text-pink-500" />
              <div>
                <h3 className="font-semibold">Instagram</h3>
                <a
                  href="https://www.instagram.com/224_.studios?igsh=bHluNm1vdnQ5bmlv"
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-400 hover:text-pink-300 underline decoration-dotted"
                >
                  @224_.studios
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-gray-200">
              <FaMapMarkerAlt className="text-2xl text-pink-500" />
              <div>
                <h3 className="font-semibold">Location</h3>
                <p>Alexandria - Our Brand Coming Soon</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 p-8 rounded-lg shadow-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200">Name</label>
              <input
                name="name"
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200">Email</label>
              <input
                name="email"
                type="email"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200">Phone</label>
              <input
                name="phone"
                type="tel"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200">Message</label>
              <textarea
                name="comment"
                rows="4"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                value={form.comment}
                onChange={handleChange}
                required
              ></textarea>
              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex items-center px-3 py-2 rounded-md bg-gray-700 text-gray-100 text-sm cursor-pointer hover:bg-gray-600">
                  Attach image
                  <input type="file" accept="image/*" className="hidden" onChange={(e)=> handleAttach((e.target.files||[])[0])} />
                </label>
                {attachedUrl && (
                  <a href={attachedUrl} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300 text-sm underline decoration-dotted">View attachment</a>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Send Message
            </motion.button>
          </form>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded bg-blue-500 bg-opacity-20 text-blue-200"
            >
              {msg}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Map Section */}
      <div className="w-full h-[400px] bg-gray-800">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27814.54364831889!2d31.24967233955078!3d30.044419699999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzM5LjkiTiAzMcKwMTQnNTguOCJF!5e0!3m2!1sen!2seg!4v1635000000000!5m2!1sen!2seg"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
