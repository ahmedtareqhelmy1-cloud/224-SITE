# 224 | 2Day 2Morrow 4Ever — Starter Scaffold

This workspace contains a starter frontend (Vite + React + Bootstrap) and a minimal Express backend.

Locations:
- Frontend: `cavee2/frontend`
- Backend: `cavee2/backend`

Quick start (Windows PowerShell):

1) Frontend

```powershell
cd c:\Users\tareq\CAVEE2\cavee2\frontend
npm install
npm run dev
```

2) Backend

```powershell
cd c:\Users\tareq\CAVEE2\cavee2\backend
npm install
npm run start
```

Notes & next steps:
- Clerk, Paymob, EmailJS and MongoDB are not wired. I created stubs and pages (Shop, Product, Checkout) and a working AAST discount feature in `Checkout.jsx`.
- To fully implement auth, payments and email sending, provide API keys and I can wire them up and test.
- I can also convert `FINAL_PROJECT_BRIEF.md` to PDF and add more components (Navbar, Footer, ProductCard) and cart persistence.
