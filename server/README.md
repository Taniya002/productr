# Productr Backend

Product Management Dashboard - REST API

## Tech Stack

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- Multer + Cloudinary (image upload)
- Nodemailer (OTP email)

## Folder Structure

```
server/
├── config/
│   ├── db.js
│   └── cloudinary.js
├── controllers/
│   ├── auth.controller.js
│   └── product.controller.js
├── middleware/
│   ├── auth.middleware.js
│   ├── upload.middleware.js
│   └── error.middleware.js
├── models/
│   ├── User.js
│   ├── OTP.js
│   └── Product.js
├── routes/
│   ├── auth.routes.js
│   └── product.routes.js
├── utils/
│   ├── otp.utils.js
│   ├── cloudinary.utils.js
│   └── response.utils.js
├── .env.example
├── package.json
└── server.js
```

## Setup Instructions

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/productr
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Productr <your_email@gmail.com>

OTP_EXPIRES_MINUTES=5
CLIENT_URL=http://localhost:3000
```

### 3. Run the server

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Reference

### Auth APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp | Send OTP to email |
| POST | /api/auth/verify-otp | Verify OTP + get JWT token |

#### POST /api/auth/send-otp
```json
{ "email": "user@example.com" }
```

#### POST /api/auth/verify-otp
```json
{ "email": "user@example.com", "otp": "123456" }
```
Response includes `token` — use this as `Authorization: Bearer <token>` in all product APIs.

---

### Product APIs (Protected — requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/products | Create product |
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get single product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| PATCH | /api/products/publish/:id | Publish product |
| PATCH | /api/products/unpublish/:id | Unpublish product |
| GET | /api/products/published | Get published products |
| GET | /api/products/unpublished | Get unpublished products |

#### Create / Update Product (multipart/form-data)

| Field | Type | Required |
|-------|------|----------|
| productName | text | Yes |
| productType | text (Food/Electronics/Fashion/Grocery/Beauty/Furniture) | Yes |
| quantityStock | number | Yes |
| mrp | number | Yes |
| sellingPrice | number | Yes |
| brandName | text | Yes |
| description | text | No |
| images | file (max 5) | No |
| exchangeEligible | boolean (true/false) | No |

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "..."
}
```

## Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords" → Generate one for "Mail"
4. Use that 16-character password as `EMAIL_PASS`
