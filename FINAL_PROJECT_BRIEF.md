# FINAL PROJECT BRIEF

**Project Name:** 224 | 2Day 2Morrow 4Ever

**Admin Email:** mohamedtareq543219@gmail.com

## Frameworks & Tools

- Frontend: React + Vite + Bootstrap 5
- Auth: Clerk (Login / Sign-up / Profile Sync)
- Backend: Node.js (Express)
- Database: MongoDB (Products + Orders + Users)
- Payments: Paymob (Visa / MasterCard)
- Email: EmailJS
- Hosting: Vercel / Netlify (Frontend) + MongoDB Atlas (Backend)

---

## General Design Style

- Theme: Galaxy Universe — deep black background with purple & violet glow
- Animations: soft star movement / glowing hover effects
- Buttons & inputs: neon border animation
- Font: Poppins or Orbitron
- Use Bootstrap components (Cards, Navbar, Modals, Carousel) but customize with glowing gradient theme
- Dark + Light theme switch

---

## Authentication (Clerk)

- Login / Sign-up using Clerk
- Users can log in via:
  - Email + Password
  - Google / Apple
- After login redirect → `/profile`
- Clerk data used in Profile:
  - `fullName`, `emailAddress`, `imageUrl`

---

## Home Page

- Animated galaxy background + brand slogan:
  “2Day 2Morrow 4Ever — Designed Beyond Reality”
- Sections:
  - Hero (full-screen)
  - Featured Products (carousel)
  - About the Brand
  - “Shop Now” button → `/shop`

---

## Shop Page

- Grid layout (Bootstrap cards) for products
- Each product card:
  - Image
  - Name
  - Price (if on sale, show salePrice crossed with old price)
  - “Add to Cart” button
  - “View Details” button

Product model example:

```json
{
  "id": "p001",
  "name": "Dark Denim Low Waist Baggy",
  "price": 1200,
  "salePrice": 950,
  "isOnSale": true,
  "isSoldOut": false,
  "image": "/images/denim.png",
  "sizeOptions": ["S", "M", "L", "XL"],
  "colorOptions": ["Black", "Dark Blue", "Gray"],
  "description": "Premium low waist denim with a relaxed fit."
}
```

Logic:

- If `isOnSale === true` → show badge `SALE`
- If `isSoldOut === true` → overlay `SOLD OUT` and disable buttons

---

## Product Details Page

- Show product image, name, description, sizes, colors, price
- Buttons:
  - “Add to Cart”
  - “Buy Now”
- Display SALE or SOLD OUT badges
- If the user is logged in, allow adding to wishlist (optional feature)

---

## Profile Page

- Auto-fill from Clerk data:
  - Name
  - Email
  - Image
- Editable fields:
  - Custom display name
  - Bio
  - Upload new profile picture
  - Save changes to MongoDB using user ID

---

## Contact Page

Form fields:

- Title: mohamedtareq543219@gmail.com
- Name
- Email
- Phone Number
- Comment
- Custom Design Section:
  - Size (text input)
  - Color (text input)
  - Image upload (file input)
- “Send Message” button → send via EmailJS to `mohamedtareq543219@gmail.com`
- Success popup after send
- Background: galaxy style, glowing borders

---

## Cart Page

- Show all products added to cart
- Quantity update (+ / -)
- Remove button
- Display subtotal, shipping, total
- Button → “Checkout”
- Data stored locally or in MongoDB (if logged in)

---

## Checkout Page

1. Billing details (auto from Profile)
2. Shipping info
3. Payment method:
   - Cash on Delivery
   - Paymob
4. On submit:
   - Generate unique Order ID (ex: `#29867`)
   - Send Email via EmailJS to `mohamedtareq543219@gmail.com` with full order info

Example email subject/body:

```
Subject: New Order #29867
Product: Dark Denim Low Waist Baggy
Quantity: 1
Payment: Paymob (Visa)
Status: Shipped / Pending
```

- Show confirmation screen “Your order is out for delivery”

---

## AAST Student Discount Feature (NEW)

Add a button on Checkout page labeled:

🎓 “I’m an AAST Student — Get 15% Off”

When clicked:

1. Show input field: “Enter Your Registration Number”
2. Validate: registration number must start with 19 / 20 / 21 / 22 / 23 / 25

```js
const valid = /^(19|20|21|22|23|25)\//.test(regNumber);
```

3. If valid → apply 15% discount permanently to total
4. Show message:
✅ “AAST student discount applied: 15% off your total.”
5. If invalid → show
❌ “Invalid AAST registration number.”

---

## Order Confirmation Email (EmailJS)

When the order is submitted (cash or Paymob):
Send email to `mohamedtareq543219@gmail.com`:

**Subject:** Order Confirmation #<ORDER_ID>

**Body:**

Hello Mohamed,

A new order has been placed.
Details:
- Order ID: #29867
- Product: Dark Denim Low Waist Baggy
- Size: M
- Color: Dark Blue
- Payment: Paymob (Visa)
- Status: Shipped / Pending
- Total: 950 EGP

Best,
224 | 2Day 2Morrow 4Ever

---

## Folder Structure (for developer)

```
src/
 ┣ components/
 ┃ ┣ Navbar.jsx
 ┃ ┣ Footer.jsx
 ┃ ┣ ProductCard.jsx
 ┃ ┣ AASTDiscountButton.jsx
 ┃ ┗ Loader.jsx
 ┣ pages/
 ┃ ┣ Home.jsx
 ┃ ┣ Shop.jsx
 ┃ ┣ ProductDetails.jsx
 ┃ ┣ Contact.jsx
 ┃ ┣ Profile.jsx
 ┃ ┣ Cart.jsx
 ┃ ┗ Checkout.jsx
 ┣ services/
 ┃ ┣ email.js
 ┃ ┣ paymob.js
 ┃ ┗ products.js
 ┣ App.jsx
 ┣ main.jsx
 ┣ index.css
```

---

## Completion Target

- Framework: Bootstrap 5
- Must be fully responsive & functional
- Complete all features listed
- Finish by today (end of day)
- Testing both payment methods (COD + Paymob)
- Test EmailJS sending
- Test AAST discount button logic

---

Would you like me to generate a ready-to-send version (PDF or .txt) of this message for your developer — nicely formatted with title and sections?
