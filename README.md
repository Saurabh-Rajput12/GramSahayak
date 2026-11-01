# 🌾 Gram Sahayak (ग्राम सहायक)
### Digital Rural Governance & Services Portal for Indian Villages

> **College Lab Project — Full-Stack MERN Application**  
> Built strictly using allowed fundamentals: Node.js, Express, MongoDB (Mongoose), React 18 (Vite), React Router v6, Axios, and Bootstrap 5.  
> Beginner-friendly code structure with descriptive documentation above every function.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Allowed Tech Stack](#-allowed-tech-stack)
3. [Folder Structure](#-folder-structure)
4. [Test Credentials & Demo Accounts](#-test-credentials--demo-accounts)
5. [Local Setup & Installation](#-local-setup--installation)
6. [Complete REST API Reference](#-complete-rest-api-reference)
7. [Postman API Test Specification](#-postman-api-test-specification)
8. [End-to-End Testing & Edge Cases Checklist](#-end-to-end-testing--edge-cases-checklist)
9. [Git Commands Guide](#-git-commands-guide)
10. [Production Deployment Guide (Atlas, Render, Vercel)](#-production-deployment-guide)

---

## 🌟 Project Overview
**Gram Sahayak** is a web-based e-governance and citizen portal tailored for village residents (*Gramvasi*) and local administrative bodies (*Gram Panchayat*). It consolidates critical rural public services into one accessible, light-themed web portal:

- **Welfare Schemes**: Discover central and state welfare initiatives (PM-KISAN, Ayushman Bharat, PMAY Housing, Old Age Pension) with eligibility validation and online applications.
- **Civic Grievances Redressal**: File civic complaints (water leakage, broken street lamps, roads, sanitation) and track official Panchayat responses.
- **Agricultural Mandi Rates**: Daily market rates across APMC trading yards with dynamic highest/lowest rate calculations.
- **Rural Marketplace**: Direct farmer-to-consumer commerce where villagers list farm produce (milk, mustard oil, vegetables, handicrafts) and neighbours buy via a shopping cart and order dispatch system.
- **Public Bulletins & Community Events**: Transparent notices carousel and seat registration for free health checkup camps and livestock vaccination drives.
- **Panchayat Administration**: User account moderation, scheme sanctioning, complaint resolution, and live statistical reports using plain Mongoose `countDocuments`.

---

## 🛠️ Allowed Tech Stack

### Frontend
- **React (Vite)** with JavaScript (ES6+)
- **React Router v6** (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Axios** for HTTP communication
- **Bootstrap 5.3** (`bootstrap` npm package + `bootstrap.bundle.min.js`)
- **Bootstrap Icons** via official CDN
- Pure `useState` and `useEffect` hooks only
- **Light Theme**: Green `#2E7D32` (Primary), Saffron `#F59E0B` (Accent), `#F7FAF5` (Body Background)

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose ODM** (Plain `find`, `findById`, `create`, `save`, `deleteOne`, `countDocuments`)
- **bcryptjs** (Password salt hashing)
- **jsonwebtoken (JWT)** (Stored in `localStorage`, sent as `Authorization: Bearer <token>`)
- **cors** & **dotenv**

---

## 📁 Folder Structure

```text
GramSahayak/
├── client/                              # Vite + React Frontend
│   ├── index.html                       # HTML entry with Bootstrap Icons CDN
│   ├── vite.config.js                   # Vite config with /api proxy to port 5001
│   ├── package.json
│   └── src/
│       ├── main.jsx                     # React root DOM rendering
│       ├── App.jsx                      # Client router & navigation layouts
│       ├── custom.css                   # Light theme overrides & status badges
│       ├── components/
│       │   ├── Navbar.jsx               # Responsive role-based header & global search
│       │   ├── Footer.jsx               # Contact info & village helpline notice
│       │   ├── AlertMessage.jsx         # Dismissible Bootstrap alerts
│       │   ├── FormInput.jsx            # Bootstrap validated form controls
│       │   ├── ProtectedRoute.jsx       # Route guard for logged-in users
│       │   ├── PanchayatRoute.jsx       # Route guard for Panchayat administrators
│       │   ├── SchemeCard.jsx           # Welfare scheme display card
│       │   ├── NoticeCard.jsx           # Village bulletin display card
│       │   ├── ProductCard.jsx          # Rural market item card with Add to Cart
│       │   └── EventCard.jsx            # Community event card with seat countdown
│       └── pages/
│           ├── Home.jsx                 # Hero banner, notices carousel, glance stats
│           ├── Login.jsx                # Resident authentication with validation
│           ├── Register.jsx             # Villager self-registration form
│           ├── Schemes.jsx              # Schemes catalog, details modal, apply modal
│           ├── Mandi.jsx                # Daily APMC crop rates table & min/max stats
│           ├── Notices.jsx              # Official public announcements board
│           ├── Helpline.jsx             # Emergency directory with click-to-call links
│           ├── Members.jsx              # Our Panchayat elected committee directory
│           ├── Market.jsx               # Rural produce market with filters & modals
│           ├── CartPage.jsx             # Shopping cart, checkout, and order management
│           ├── Events.jsx               # Scheduled camps & seat booking
│           ├── Complaints.jsx           # Civic grievance filing & tracking
│           ├── Dashboard.jsx            # Villager multi-tab citizen services panel
│           ├── Reports.jsx              # Panchayat metrics with native CSS progress bar
│           └── panchayat/
│               ├── UserManagement.jsx   # User moderation, block toggle, reset password
│               ├── SchemeManagement.jsx # Scheme CRUD management
│               ├── ApplicationManagement.jsx # Application reviews & sanctions
│               ├── ComplaintManagement.jsx   # Grievance redressal & reply
│               ├── PriceManagement.jsx  # Mandi rate recording
│               ├── NoticeManagement.jsx # Circulars publication
│               ├── EventManagement.jsx  # Events & registered attendee rosters
│               ├── HelplineManagement.jsx    # Emergency helpline directory CRUD
│               ├── FeedbackManagement.jsx    # Citizen suggestions viewer
│               └── MemberManagement.jsx      # Elected representative profiles CRUD
│
├── server/                              # Node.js + Express Backend
│   ├── .env                             # Local environment variables
│   ├── .env.example                     # Environment template
│   ├── server.js                        # Express server entry point & route mounting
│   ├── seed.js                          # Database initial seeder script
│   ├── package.json
│   ├── middleware/
│   │   └── authMiddleware.js            # JWT verification (protect) & onlyPanchayat
│   ├── models/                          # 13 Mongoose Data Schemas
│   │   ├── User.js                      # Villager & Panchayat accounts
│   │   ├── Scheme.js                    # Welfare scheme rules & criteria
│   │   ├── Application.js               # Citizen scheme applications
│   │   ├── Complaint.js                 # Grievances & Panchayat replies
│   │   ├── CropPrice.js                 # Daily APMC mandi rates
│   │   ├── Notice.js                    # Public announcements & bulletins
│   │   ├── Product.js                   # Produce listed on rural market
│   │   ├── Cart.js                      # Shopping cart items per user
│   │   ├── Order.js                     # Market orders & statuses
│   │   ├── Event.js                     # Camps, meetings & attendee registers
│   │   ├── Helpline.js                  # Village emergency contacts
│   │   ├── Feedback.js                  # Citizen suggestions & ratings
│   │   └── Member.js                    # Gram Panchayat committee officials
│   ├── routes/                          # 15 Modular Express Route Handlers
│   └── controllers/                     # Business logic controllers
└── README.md
```

---

## 👥 Test Credentials & Demo Accounts

All demo accounts share the standard password: `password123`.

| Role | Name | Username | Password | Access Capabilities |
|---|---|---|---|---|
| **Panchayat Admin** | Gram Sachiv (Panchayat Admin) | `panchayat_admin` | `password123` | Full admin access: User moderation, scheme reviews, grievance redressal, notices/prices/events CRUD, statistics. |
| **Villager** | Ramesh Kumar | `ramesh_kumar` | `password123` | Apply for schemes, file complaints, sell farm produce, buy from market, register for events. |
| **Villager** | Sita Devi | `sita_devi` | `password123` | Rural marketplace seller (A2 Milk, Mango Pickle), submit feedback, book event seats. |
| **Villager** | Anil Verma | `anil_farmer` | `password123` | Wheat & potato farmer, file complaints, apply to welfare schemes. |

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### 1. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Verify environment file (.env)
# Default values:
# PORT=5001
# MONGO_URI=mongodb://127.0.0.1:27017/gram_sahayak
# JWT_SECRET=gram_sahayak_super_secret_lab_key_2026

# Seed initial database records (1 Admin, 3 Villagers, 10 Schemes, 20 Prices, 5 Notices, etc.)
npm run seed

# Start backend server
npm start
# Server runs on: http://localhost:5001
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on: http://localhost:3000
```

---

## 📡 Complete REST API Reference

### 1. Authentication & Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new villager account (`name`, `username`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue 7-day JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in user details |
| `PUT` | `/api/auth/profile` | Protected | Update profile name and/or password |

### 2. User Management (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Panchayat | List all users with `?search=`, `?role=`, `?blocked=` filters |
| `PUT` | `/api/users/:id/block` | Panchayat | Toggle `isBlocked` status (prevents self-block) |
| `PUT` | `/api/users/:id/reset-password` | Panchayat | Reset a user's password (`{ newPassword }`) |
| `DELETE` | `/api/users/:id` | Panchayat | Remove user account (prevents self-deletion) |

### 3. Welfare Schemes (`/api/schemes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/schemes` | Public | List schemes with backend `?search=` and `?category=` filters |
| `GET` | `/api/schemes/:id` | Public | Get single scheme details |
| `POST` | `/api/schemes` | Panchayat | Create new welfare scheme |
| `PUT` | `/api/schemes/:id` | Panchayat | Update scheme rules and eligibility criteria |
| `DELETE` | `/api/schemes/:id` | Panchayat | Delete welfare scheme |

### 4. Scheme Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/applications` | Protected | Submit application (validates age, income, and prevents duplicates) |
| `GET` | `/api/applications/mine` | Protected | Fetch applications submitted by logged-in villager |
| `GET` | `/api/applications` | Panchayat | List all applications with `?status=` filter |
| `PUT` | `/api/applications/:id` | Panchayat | Update status (`approved`/`rejected`) and add remark |

### 5. Grievance Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/complaints` | Protected | File new civic complaint (`title`, `category`, `description`) |
| `GET` | `/api/complaints/mine` | Protected | View complaints filed by logged-in villager |
| `PUT` | `/api/complaints/:id` | Protected | Edit open complaint (allowed only while status is `open`) |
| `DELETE` | `/api/complaints/:id` | Protected | Delete open complaint (allowed only while status is `open`) |
| `GET` | `/api/complaints` | Panchayat | List all complaints with `?status=`, `?category=`, `?search=` |
| `PUT` | `/api/complaints/:id/respond` | Panchayat | Record status and official reply (`panchayatReply`) |

### 6. Mandi Crop Prices (`/api/prices`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/prices` | Public | Search mandi prices with `?search=`, `?district=`, `?minPrice=`, `?maxPrice=` |
| `POST` | `/api/prices` | Panchayat | Record new daily crop price |
| `PUT` | `/api/prices/:id` | Panchayat | Update crop rate record |
| `DELETE` | `/api/prices/:id` | Panchayat | Remove crop rate record |

### 7. Public Notices (`/api/notices`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notices` | Public | List notices with `?type=` and `?search=` filters |
| `POST` | `/api/notices` | Panchayat | Publish new notice |
| `PUT` | `/api/notices/:id` | Panchayat | Edit notice content |
| `DELETE` | `/api/notices/:id` | Panchayat | Delete notice bulletin |

### 8. Rural Marketplace (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Search market produce with `?search=`, `?category=`, `?minPrice=`, `?maxPrice=` |
| `GET` | `/api/products/:id` | Public | View product details with seller info |
| `GET` | `/api/products/mine` | Protected | View products listed by logged-in seller |
| `POST` | `/api/products` | Protected | List produce item for sale |
| `PUT` | `/api/products/:id` | Protected | Update item details / toggle `isAvailable` (owner only) |
| `DELETE` | `/api/products/:id` | Protected | Delete product listing (owner only) |

### 9. Shopping Cart & Orders (`/api/cart`, `/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Protected | View active cart with live total calculated in backend |
| `POST` | `/api/cart` | Protected | Add item to cart (`{ productId, quantity }`) |
| `PUT` | `/api/cart/:productId` | Protected | Update item quantity in cart |
| `DELETE` | `/api/cart/:productId` | Protected | Remove specific item from cart |
| `DELETE` | `/api/cart` | Protected | Clear entire shopping cart |
| `POST` | `/api/orders` | Protected | Checkout cart, create order, and clear cart |
| `GET` | `/api/orders/mine` | Protected | View orders placed by user as buyer |
| `GET` | `/api/orders/received` | Protected | View orders received by user as seller |
| `PUT` | `/api/orders/:id` | Protected | Buyer cancels (placed only); Seller accepts/delivers |

### 10. Camps & Events (`/api/events`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public | List events with `?type=` and `?search=` filters |
| `GET` | `/api/events/:id` | Public | View event details with registered attendees |
| `POST` | `/api/events` | Panchayat | Schedule new event or camp |
| `PUT` | `/api/events/:id` | Panchayat | Update event details |
| `DELETE` | `/api/events/:id` | Panchayat | Delete event |
| `POST` | `/api/events/:id/register` | Protected | Reserve seat (blocks duplicates and capacity overbooking) |
| `DELETE` | `/api/events/:id/register` | Protected | Cancel seat reservation |
| `GET` | `/api/events/mine` | Protected | View registered events for current user |

### 11. Helpline Directory (`/api/helplines`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/helplines` | Public | Search emergency contacts by `?category=` and `?search=` |
| `POST` | `/api/helplines` | Panchayat | Add helpline number |
| `PUT` | `/api/helplines/:id` | Panchayat | Update helpline details |
| `DELETE` | `/api/helplines/:id` | Panchayat | Delete helpline contact |

### 12. Citizen Feedback (`/api/feedback`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/feedback` | Protected | Submit suggestion/appreciation (`subject, message, type, rating`) |
| `GET` | `/api/feedback/mine` | Protected | View personal feedback submissions |
| `GET` | `/api/feedback` | Panchayat | List all feedback with `?type=` filter |
| `PUT` | `/api/feedback/:id/read` | Panchayat | Mark feedback entry as reviewed |
| `DELETE` | `/api/feedback/:id` | Panchayat | Delete feedback entry |

### 13. Panchayat Committee Members (`/api/members`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/members` | Public | List elected representatives and tenure |
| `POST` | `/api/members` | Panchayat | Add committee member profile |
| `PUT` | `/api/members/:id` | Panchayat | Update member profile |
| `DELETE` | `/api/members/:id` | Panchayat | Delete member profile |

### 14. Village Statistics & Reports (`/api/reports/summary`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/summary` | Panchayat | Uses `countDocuments` only to return counts of villagers, complaints by status, applications by status, orders, and feedback |

---

## 🧪 Postman API Test Specification

| # | Method | URL Path | Headers | Body Sample | Expected Status |
|---|---|---|---|---|:---:|
| 1 | `POST` | `/api/auth/register` | `Content-Type: application/json` | `{"name":"Aman Singh","username":"aman_singh","password":"password123"}` | `201 Created` |
| 2 | `POST` | `/api/auth/login` | `Content-Type: application/json` | `{"username":"ramesh_kumar","password":"password123"}` | `200 OK` |
| 3 | `GET` | `/api/auth/me` | `Authorization: Bearer <token>` | None | `200 OK` |
| 4 | `PUT` | `/api/auth/profile` | `Authorization: Bearer <token>` | `{"name":"Ramesh Kumar Patel"}` | `200 OK` |
| 5 | `GET` | `/api/users?search=ramesh` | `Authorization: Bearer <panchayat_token>` | None | `200 OK` |
| 6 | `PUT` | `/api/users/<user_id>/block` | `Authorization: Bearer <panchayat_token>` | None | `200 OK` |
| 7 | `PUT` | `/api/users/<user_id>/reset-password` | `Authorization: Bearer <panchayat_token>` | `{"newPassword":"newPassword123"}` | `200 OK` |
| 8 | `GET` | `/api/schemes?category=farmer` | None | None | `200 OK` |
| 9 | `POST` | `/api/applications` | `Authorization: Bearer <token>` | `{"scheme":"<scheme_id>","fullName":"Ramesh Kumar","age":35,"income":120000,"landAcres":2}` | `201 Created` |
| 10 | `PUT` | `/api/applications/<app_id>` | `Authorization: Bearer <panchayat_token>` | `{"status":"approved","remark":"Documents verified"}` | `200 OK` |
| 11 | `POST` | `/api/complaints` | `Authorization: Bearer <token>` | `{"title":"Handpump broken","category":"water","description":"Near Ward 2"}` | `201 Created` |
| 12 | `PUT` | `/api/complaints/<id>/respond`| `Authorization: Bearer <panchayat_token>` | `{"status":"resolved","panchayatReply":"Parts replaced"}` | `200 OK` |
| 13 | `GET` | `/api/prices?district=Indore` | None | None | `200 OK` |
| 14 | `POST` | `/api/products` | `Authorization: Bearer <token>` | `{"name":"Desi Ghee","category":"dairy","price":850,"quantity":10,"unit":"kg"}` | `201 Created` |
| 15 | `POST` | `/api/cart` | `Authorization: Bearer <token>` | `{"productId":"<product_id>","quantity":2}` | `200 OK` |
| 16 | `POST` | `/api/orders` | `Authorization: Bearer <token>` | `{"address":"House 12, Ward 3, Near Temple"}` | `201 Created` |
| 17 | `POST` | `/api/events/<event_id>/register` | `Authorization: Bearer <token>` | None | `200 OK` |
| 18 | `GET` | `/api/reports/summary` | `Authorization: Bearer <panchayat_token>` | None | `200 OK` |

---

## ✅ End-to-End Testing & Edge Cases Checklist

### Standard User Happy Paths
- [x] **Registration Flow**: Fill in name, username, and password >= 6 characters. Verify account creation, token generation, and immediate redirect to Dashboard.
- [x] **Login Flow**: Log in with credentials. Verify navigation items dynamically adapt based on role (`villager` vs `panchayat`).
- [x] **Welfare Scheme Application**: Browse `/schemes`, open "View Details" modal, inspect required documents, click "Apply Now", submit age/income data, and check status in Dashboard.
- [x] **Rural Marketplace & Ordering Flow**: Browse `/market`, click "Add to Cart", visit `/cart`, adjust item quantities, enter village delivery address, click "Place Order", and observe automatic cart clearing and order appearance in "My Orders".
- [x] **Seller Order Processing**: Log in as seller, open "Received Orders", click "Accept Order", then click "Mark Delivered".
- [x] **Camp & Event Booking**: Navigate to `/events`, inspect remaining seat counter, click "Register", observe seat decrement, and verify ability to cancel reservation.
- [x] **Civic Grievance Redressal**: File a water/electricity issue on `/complaints`, log in as Panchayat, update status to `in_progress` or `resolved` with reply, and verify reply on villager dashboard.

### Edge Case Verifications
- [x] **Password Too Short**: Registration fails with `400 Bad Request` if password is less than 6 characters.
- [x] **Duplicate Username**: Registration fails with `409 Conflict` if username is already taken.
- [x] **Blocked User Login**: Blocked users receive `403 Forbidden` with explanation message upon login attempt.
- [x] **Panchayat Self-Block & Self-Delete**: Admin accounts are prevented from blocking or deleting themselves (`400 Bad Request`).
- [x] **Scheme Minimum Age Criteria**: Applying for Old Age Pension (`minAge: 60`) with an age under 60 is blocked with `400 Bad Request`.
- [x] **Scheme Maximum Income Limit**: Applying for housing/health schemes with income exceeding ceiling is blocked with `400 Bad Request`.
- [x] **Duplicate Scheme Application**: Applying twice for the same scheme is blocked with `400 Bad Request`.
- [x] **Event Full Capacity**: Registering when seats are exhausted is blocked with `400 Bad Request`.
- [x] **Empty Cart Checkout**: Submitting an order with an empty cart fails with `400 Bad Request`.
- [x] **Editing Resolved Complaints**: Villagers cannot edit or delete grievances once status is `in_progress` or `resolved` (`400 Bad Request`).
- [x] **Unauthorized Editing**: Non-owners cannot edit or delete another villager's marketplace produce listing (`403 Forbidden`).

---

## 💻 Git Commands Guide

Use the following commands to initialize, commit, and push this repository to GitHub:

```bash
# 1. Initialize git repository (if not already initialized)
git init

# 2. Stage all files (respecting .gitignore for node_modules and .env)
git add .

# 3. Create your initial commit
git commit -m "feat: complete Gram Sahayak full-stack MERN portal"

# 4. Rename default branch to main
git branch -M main

# 5. Add remote GitHub repository (replace with your repository URL)
git remote add origin https://github.com/your-username/gram-sahayak.git

# 6. Push commit to GitHub
git push -u origin main
```

---

## 🌐 Production Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox Cluster**.
3. Under **Database Access**, create a database user (e.g., `admin_sahayak`) with a strong password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Connect your application** (Driver: Node.js) and copy the connection string:
   ```text
   mongodb+srv://admin_sahayak:<password>@cluster0.mongodb.net/gram_sahayak?retryWrites=true&w=majority
   ```

### 2. Backend: Render.com
1. Create a free account at [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `5001`
   - `MONGO_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Your Secret Random String>`
6. Deploy the web service and copy the live URL (e.g., `https://gram-sahayak-api.onrender.com`).
7. Run the seed script once on Render using the **Shell** tab:
   ```bash
   node seed.js
   ```

### 3. Frontend: Vercel or Netlify

#### Option A: Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Select your repository.
3. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In `client/vite.config.js` or via Axios baseURL, set the production API URL to your Render backend:
   ```javascript
   // In client code or vite proxy: target: 'https://gram-sahayak-api.onrender.com'
   ```
5. Deploy the project!

#### Option B: Netlify
1. Sign in to [Netlify](https://www.netlify.com).
2. Choose **Add new site** -> **Import an existing project**.
3. Set **Base directory** to `client`, **Build command** to `npm run build`, and **Publish directory** to `client/dist`.
4. Deploy site!

---

*Developed for Academic Curriculum & College Lab Project Evaluation.*
