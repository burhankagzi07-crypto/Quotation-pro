# Plumber Quotation System

Professional full-stack quotation builder for a manufacturing company.

## Features

- Secure JWT login with admin/user role routing
- Admin dashboard and user dashboard
- Product catalogue with direct image upload
- Cloudinary upload support with automatic local-upload fallback
- Product code/group search such as `MUN`, `AGN`, `MUN-001`
- Quotation builder with 6 required columns:
  1. Image + Code
  2. Description
  3. Quantity
  4. MRP
  5. Discount %
  6. Net Price
- Dynamic auto-calculation
- PDF quotation/invoice download
- Quotation history
- Keyboard shortcuts:
  - Ctrl + K = Focus product search
  - Enter in search = Add first matched product
  - Ctrl + S = Save quotation
  - Ctrl + P = Download PDF
  - Esc = Clear search

## Folder Structure

```txt
plumber-quotation-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── seedUsers.js
│   └── server.js
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── admin.html
│   ├── login.html
│   ├── products.html
│   ├── quotation.html
│   ├── quotations.html
│   └── user.html
├── .env.example
├── package.json
└── README_CLIENT_DELIVERY.md
```

## Setup Steps

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Copy `.env.example` to `.env` and update values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/plumber_quotation
JWT_SECRET=replace_with_a_long_random_secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=plumber-products
```

Cloudinary is optional. If Cloudinary fields are blank, uploaded product images are saved locally inside `backend/uploads`.

### 3. Start MongoDB

Local MongoDB should be running at:

```txt
mongodb://127.0.0.1:27017
```

### 4. Seed default users

```bash
npm run seed
```

Default logins:

```txt
Admin: admin@gmail.com / 123456
User : user@gmail.com / 123456
```

### 5. Start server

```bash
npm start
```

Open:

```txt
http://localhost:5000/login.html
```

## Important Notes

- Do not run frontend with VS Code Live Server. Use `http://localhost:5000/login.html` so API and frontend share the same origin.
- Do not commit `.env` to GitHub.
- For production, replace default passwords and use a strong JWT secret.
- If client wants online image storage, fill Cloudinary credentials in `.env`.

## Troubleshooting

### MongoDB connection error

Make sure MongoDB Server is installed and running. MongoDB Compass alone is not enough.

### Invalid credentials

Run:

```bash
npm run seed
```

Then login again with default users.

### Product image not uploading

If Cloudinary is not configured, local uploads are used. Check `backend/uploads`.
