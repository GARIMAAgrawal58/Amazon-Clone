# 🛒 Amazon Clone (Full Stack Project)

A simple full-stack Amazon-style e-commerce application built using Node.js, Express.js, EJS, and MySQL.
This project includes basic e-commerce features such as product pages, cart system, user authentication, and admin management.

## ⭐ Features

### 🛍️ Product Features
- View all products
- View product details
- Products stored in MySQL database
- Product images stored locally (using multer)
- No search bar

### 👤 User Features
- User registration
- User login
- Password hashing using argon2
- Session-based authentication
- Protected pages after login

### 🧺 Cart
- Add items to cart
- Remove items from cart
- Automatic cart total calculation
- (No quantity update feature)

### 📦 Orders
- Checkout page
- Address form
- Order summary page
- Shows “Order Placed” after checkout
- (No order history feature)

### 🔧 Admin Panel
- Admin login
- Add products
- Edit products
- Delete products
- View/manage user orders

## 🛠️ Tech Stack

Frontend:
- EJS Templating
- CSS
- Responsive layout

Backend:
- Node.js
- Express.js
- Express Sessions
- Argon2 (password hashing)
- Multer (file uploads)

Database:
- MySQL

## 📂 Project Structure (Simple Overview)

public          → CSS, images, assets
uploads         → Product images (multer)
views           → EJS pages
routes          → All routes (user, admin, products, cart)
controllers     → Backend logic
models          → Database queries

## ▶️ How to Run

1. Install dependencies:
   npm install

2. Setup database:
   - require('mysql')

3. Start the server:
   nodemon amazon_server.js

Server runs on: http://localhost:1000

## 👩‍💻 Author
Garima Agrawal
