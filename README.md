# 🌾 Gram Sahayak (ग्राम सहायक)
### Digital Citizen Services Portal for Rural India
> **Academic Full-Stack MERN Mini Project** &bull; Lab Evaluation Ready &bull; Strictly Plain MERN Stack

---

## 📌 Project Overview
**Gram Sahayak** is a beginner-friendly, clean, full-stack digital rural governance portal built for rural Indian villages. It bridges the communication and service delivery gap between rural citizens (**Villagers / Farmers**) and the local administration (**Gram Panchayat**).

The project is structured into **5 Core Citizen Modules** designed for academic mini-project presentations, college lab evaluations, and technical viva voce:

```
                                  🌾 GRAM SAHAYAK
                                         │
        ┌───────────────────┬────────────┴───────┬───────────────────┐
        ▼                   ▼                    ▼                   ▼
┌──────────────┐    ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│  1. Auth &   │    │  2. Sarkari  │     │ 3. Shikayat  │    │  4. Krishi   │
│  User Roles  │    │   Yojanas    │     │   Nivaran    │    │    Bazaar    │
│ (Villager vs │    │  (Schemes &  │     │ (Grievances  │    │(Direct Farmer│
│  Panchayat)  │    │ Applications)│     │ & Redressal) │    │  Marketplace)│
└──────────────┘    └──────────────┘     └──────────────┘    └──────────────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │ 5. Suchna    │
                             │    Patra     │
                             │  (Panchayat  │
                             │   Notices)   │
                             └──────────────┘
```

---

## 🚀 The 5 Core Modules

### 1. User Authentication & Roles (प्रमाणीकरण एवं भूमिकाएँ)
- **Roles**: `villager` (default citizen registered online) and `panchayat` (pre-seeded administrative officer).
- **Security**: Passwords hashed using `bcryptjs` (salt rounds: 10), stateless session management via JSON Web Tokens (`jwt`), and role-based route guards (`ProtectedRoute`, `PanchayatRoute`).

### 2. Sarkari Yojanas (सरकारी योजनाएँ एवं ऑनलाइन आवेदन)
- **Villager Flow**:
  - Filter schemes by category (`farmer`, `health`, `housing`, `pension`, `education`).
  - View scheme details, eligibility criteria, and required documents.
  - Apply online by entering age, income, and landholding. Duplicate applications for the same scheme are blocked automatically.
  - Track real-time status (`Under Review`, `Approved`, `Rejected`) along with official remarks.
- **Panchayat Flow**:
  - Review applications with applicant details.
  - 1-Click **Approve** or **Reject** with official remarks.
  - Add new government welfare schemes or delete outdated ones.

### 3. Shikayat Nivaran (नागरिक शिकायत निवारण)
- **Villager Flow**:
  - Lodge grievances under categories like `water`, `road`, `electricity`, `sanitation`, `other`.
  - Track grievance status (`Open` ➜ `In Progress` ➜ `Resolved`).
  - Read official responses from the Panchayat.
  - Can withdraw/delete grievance while status is `open`.
- **Panchayat Flow**:
  - View complaints filterable by category and status.
  - Update complaint status and attach official resolution messages.

### 4. Krishi Bazaar (किसान कृषि बाज़ार)
- **Direct Farmer-to-Buyer Marketplace**:
  - Eliminates middlemen commission by allowing farmers to list fresh harvests directly.
  - Browse produce with category filter pills (`Vegetables`, `Food Grains`, `Dairy`, `Fruits`, `Other`) and keyword search.
  - Produce cards show farmer name, farm location, available quantity, and unit price.
  - **1-Click Direct Contact**: "Contact Farmer" modal displays farmer details, exact farm location, and a direct `tel:` call button.
  - **Farmer Controls**: Farmers can list produce with price and quantity, toggle stock (`In Stock` / `Sold Out`), and delete listings.

### 5. Gram Suchna Patra (ग्राम सूचना पट्ट)
- **Digital Village Circulars**:
  - Official Panchayat notices for Gram Sabha assemblies, pulse polio immunization camps, canal water schedules, and health drives.
  - Categorized under `meeting`, `camp`, `water`, `general` with publication dates.
  - Prominently highlighted on the homepage banner and dedicated notice board.
  - Panchayat officers can publish and delete notices.

---

## 🛠️ Tech Stack & Constraints
The project adheres to beginner-friendly college standards without unnecessary external complexity:

| Layer | Technologies Used | What is Avoided (No Over-engineering) |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite), React Router v6, Axios, Bootstrap 5.3, Bootstrap Icons | No Redux, No Context API, No Tailwind, No TypeScript, No custom hooks |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv` | No Multer / Cloudinary / heavy image upload, No WebSocket, No aggregation pipelines |
| **Database** | MongoDB (6 clean models with native Mongoose queries) | Plain Mongoose queries only (`find`, `findById`, `create`, `save`, `deleteOne`, `countDocuments`) |

---

## 🔑 Default Login Credentials

All test accounts share the password **`password123`**:

| Role | Username | Password | Purpose / Features to Demo |
| :--- | :--- | :--- | :--- |
| **Panchayat Officer** | `panchayat_admin` | `password123` | Control Panel: Approve applications, resolve complaints, publish notices, add schemes |
| **Farmer (Villager)** | `ramesh_kumar` | `password123` | Apply for schemes, lodge complaints, list produce in Krishi Bazaar |
| **Villager** | `anil_farmer` | `password123` | Browse market, contact farmers, file electricity complaints |

---

## 🗄️ Database Schemas (6 Models)

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│       User       │       │        Scheme        │       │     Application      │
├──────────────────┤       ├──────────────────────┤       ├──────────────────────┤
│ _id              │       │ _id                  │       │ _id                  │
│ name: String     │◄──┐   │ name: String         │◄──┐   │ user: ObjectId (User)│───┘
│ username: String │   │   │ description: String  │   │   │ scheme: ObjectId     │───┘
│ password: Hash   │   │   │ category: Enum       │   └───│ fullName: String     │
│ role: Enum       │   │   │ minAge: Number       │       │ age: Number          │
│ isBlocked: Bool  │   │   │ maxIncome: Number    │       │ income: Number       │
│ createdAt: Date  │   │   │ documentsRequired: []│       │ status: Enum         │
└──────────────────┘   │   │ createdAt: Date      │       │ remark: String       │
                       │   └──────────────────────┘       │ appliedAt: Date      │
                       │                                  └──────────────────────┘
                       │   ┌──────────────────────┐       ┌──────────────────────┐
                       │   │      Complaint       │       │       Product        │
                       │   ├──────────────────────┤       ├──────────────────────┤
                       │   │ _id                  │       │ _id                  │
                       │   │ user: ObjectId (User)│   ┌───│ seller: ObjectId     │
                       └───│ title: String        │   │   │ name: String         │
                           │ category: Enum       │   │   │ category: Enum       │
                           │ description: String  │   │   │ price: Number        │
                           │ status: Enum         │   │   │ quantity: Number     │
                           │ panchayatReply: Str  │   │   │ unit: String         │
                           │ createdAt: Date      │   │   │ location: String     │
                           └──────────────────────┘   │   │ contactPhone: String │
                                                      │   │ isAvailable: Boolean │
                           ┌──────────────────────┐   │   │ createdAt: Date      │
                           │        Notice        │   │   └──────────────────────┘
                           ├──────────────────────┤   │
                           │ _id                  │   │
                           │ title: String        │   │
                           │ body: String         │   │
                           │ type: Enum           │   │
                           │ date: Date           │   │
                           └──────────────────────┘   │
```

---

## 🔌 REST API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new villager account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Get logged-in user profile |
| `PUT` | `/api/auth/profile` | Protected | Update profile name or password |

### 2. Sarkari Yojanas (`/api/schemes` & `/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/schemes` | Public | List all schemes (supports `?category=` and `?search=`) |
| `POST` | `/api/schemes` | Panchayat | Add new welfare scheme |
| `DELETE` | `/api/schemes/:id` | Panchayat | Delete welfare scheme |
| `POST` | `/api/applications` | Villager | Submit scheme application (checks eligibility & duplicates) |
| `GET` | `/api/applications/mine` | Villager | View applicant's own applications |
| `GET` | `/api/applications` | Panchayat | View all citizen applications (supports `?status=`) |
| `PUT` | `/api/applications/:id` | Panchayat | Approve or reject application with remark |

### 3. Shikayat Nivaran (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Villager | File a new village complaint |
| `GET` | `/api/complaints/mine` | Villager | View complaints filed by the logged-in user |
| `DELETE` | `/api/complaints/:id` | Villager | Delete complaint (only while status is `open`) |
| `GET` | `/api/complaints` | Panchayat | View all village complaints (supports `?status=`) |
| `PUT` | `/api/complaints/:id/respond`| Panchayat | Update grievance status & add official reply |

### 4. Krishi Bazaar (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Browse produce (supports `?category=` and `?search=`) |
| `GET` | `/api/products/mine` | Villager | View produce listed by logged-in farmer |
| `POST` | `/api/products` | Villager | List new farm produce with price, quantity, phone |
| `PUT` | `/api/products/:id/toggle-stock` | Seller | Toggle produce availability (`In Stock` / `Sold Out`) |
| `DELETE` | `/api/products/:id` | Seller | Delete produce listing |

### 5. Gram Suchna Patra (`/api/notices`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | Public | View all official notices (supports `?type=`) |
| `POST` | `/api/notices` | Panchayat | Publish new village circular |
| `DELETE` | `/api/notices/:id` | Panchayat | Delete circular |

### 6. Administration Summary (`/api/reports/summary`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/summary` | Panchayat | Aggregate counts for pending applications, open complaints, schemes, and notices |

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/gram_sahayak` or MongoDB Atlas URI)

### Step 1: Start Backend
```bash
cd server
npm install
node seed.js      # Populates test users, schemes, complaints, products, and notices
node server.js    # Runs backend on http://localhost:5001
```

### Step 2: Start Frontend
```bash
cd client
npm install
npm run dev       # Runs Vite client on http://localhost:3000
```

### Step 3: Run Automated Integration Tests
```bash
cd server
node test_mini_project.js
# Runs 20 automated tests validating all 5 modules (Auth, Schemes, Complaints, Market, Notices)
```

---

## 🎓 College Viva Presentation Cheat Sheet

When the examiner asks questions during project evaluation, refer to these straightforward answers:

1. **"What is the objective of your mini project?"**
   > *"Sir, Gram Sahayak is a digital rural governance portal that brings 5 essential Gram Panchayat services online: welfare scheme applications, grievance redressal, direct farmer produce selling, official notices, and administrative approvals."*

2. **"Why did you use plain Mongoose and useState instead of Redux/Context API?"**
   > *"To keep the code clean, predictable, and easy to maintain without unnecessary abstraction layers. Each page manages its own localized state with standard React hooks, making the code 100% transparent and beginner-friendly."*

3. **"How does the scheme application workflow work?"**
   > *"When a villager applies, the backend verifies minimum age and maximum income ceiling. It prevents duplicate applications for the same scheme. The application is marked 'pending' until the Panchayat officer reviews the documents and marks it 'approved' or 'rejected' with official remarks."*

4. **"How does Krishi Bazaar help farmers?"**
   > *"Farmers can directly post their produce with price, quantity, and phone number. Buyers can filter produce and click 'Contact Farmer' to call them directly, cutting out middlemen commission."*

---

&copy; Gram Sahayak &bull; Full-Stack MERN Mini Project &bull; Clean Architecture
