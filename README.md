# Productr - Product Management Dashboard

A full-stack product management web application built with the MERN stack. Users can log in using OTP-based email authentication, manage their products, and publish or unpublish them to the marketplace.

---

## Live Demo

- Frontend: https://your-frontend.onrender.com
- Backend: https://productr-backend-i6va.onrender.com

---

## Tech Stack

**Frontend**
- React.js (Vite)
- React Router DOM
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Resend (OTP Email)
- Cloudinary (Image Upload)
- Multer
- Express Validator
- Helmet
- Express Rate Limit

---

## Features

- OTP-based email authentication (no password required)
- JWT protected routes
- Add, edit, delete products
- Upload multiple product images (stored on Cloudinary)
- Publish and unpublish products
- Responsive product dashboard
- Toast notifications
- Loading and error handling

---

## Folder Structure

```
productr/
├── server/                  Backend
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── product.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── OTP.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── product.routes.js
│   ├── utils/
│   │   ├── otp.utils.js
│   │   ├── cloudinary.utils.js
│   │   └── response.utils.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── client/                  Frontend
    ├── public/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Resend account

---

### Backend Setup

1. Navigate to the server folder

```bash
cd server
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env
```

4. Fill in the environment variables in `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/productr
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_api_key
```

5. Run the backend server

```bash
npm run dev
```

Server will start on http://localhost:5000

---

### Frontend Setup

1. Navigate to the client folder

```bash
cd client
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env
```

4. Fill in the environment variables in `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

5. Run the frontend

```bash
npm run dev
```

Frontend will start on http://localhost:5173

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp | Send OTP to email |
| POST | /api/auth/verify-otp | Verify OTP and get JWT token |

### Products (Protected - requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/products | Create a product |
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get single product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| PATCH | /api/products/publish/:id | Publish product |
| PATCH | /api/products/unpublish/:id | Unpublish product |
| GET | /api/products/published | Get published products |
| GET | /api/products/unpublished | Get unpublished products |

---

## Response Format

Success Response
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error Response
```json
{
  "success": false,
  "message": "..."
}
```

---

## Deployment

Both frontend and backend are deployed on Render.

**Backend** - Render Web Service
- Build Command: npm install
- Start Command: node server.js

**Frontend** - Render Static Site
- Build Command: npm install && npm run build
- Publish Directory: dist

---

## Note on OTP Email

OTP emails are sent using the Resend API. On the free tier, emails can only be delivered to verified addresses. For testing the live application, please use the email address provided during the demo or reach out for test credentials.

---

## Author

Taniya Tondwal
GitHub: https://github.com/Taniya002
