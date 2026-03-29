# 🚀 Smart Reimbursement System  
### Intelligent Expense Management with Dynamic Approval Engine  

---

## 📌 Overview  

Smart Reimbursement System is a full-stack web application built for the **Odoo x VIT Pune Hackathon**.  

It automates the entire expense reimbursement lifecycle — from submission to approval — using a **dynamic rule-based engine**, ensuring flexibility, transparency, and scalability.

---

## 🎯 Problem Statement  

Traditional reimbursement systems suffer from:
- ❌ Manual approvals and delays  
- ❌ Lack of transparency  
- ❌ Rigid approval workflows  
- ❌ Error-prone data entry  

---

## 💡 Our Solution  

We built an **AI-assisted, rule-driven reimbursement platform** that enables:

- 🧾 Seamless expense submission  
- 🧑‍⚖️ Multi-level approval workflows  
- ⚙️ Dynamic approval rules (JSON-based engine)  
- 🌍 Real-time currency conversion  
- 🤖 Receipt auto-fill (OCR simulation)  
- 🔐 Secure role-based access control  

---

## 🏗️ System Architecture  
Frontend (Next.js + Tailwind + shadcn/ui)
↓
Server Actions (Next.js)
↓
Backend (Supabase - PostgreSQL + Auth + RLS)
↓
External APIs (Currency API)


---

## 👥 User Roles  

### 🧑‍💼 Admin
- Configure approval rules  
- Manage system behavior  
- Access all data  

### 🧑‍⚖️ Manager
- View team expenses  
- Approve / reject requests  
- Add comments  

### 🧑‍💻 Employee
- Submit expenses  
- Upload receipts  
- Track status  

---

## ⚙️ Core Features  

### 🔐 Authentication & Authorization
- Supabase Auth integration  
- Role-Based Access Control (RBAC)  
- Secure Row Level Security (RLS)  

---

### 🧾 Expense Submission
- Input: amount, currency, category, description  
- Receipt upload (auto-fill simulation)  
- Secure backend submission  

---

### 💱 Currency Conversion
- Real-time conversion using ExchangeRate API  
- Stores:
  - Original amount  
  - Normalized amount  

---

### 🧑‍⚖️ Approval Workflow
- Manager dashboard  
- Approve / Reject actions  
- Mandatory comments for rejection  
- Audit trail tracking  

---

### ⚙️ Dynamic Rule Engine (Key Feature 🔥)
- Rules stored in **PostgreSQL JSONB**
- Admin-configurable approval logic  

Example:
```json
{
  "rule_type": "percentage",
  "conditions": {
    "min_percentage": 0.6
  }
}
Enables:
Flexible approval flows
No code changes required
Scalable enterprise logic
-----------------------------------------
🤖 OCR (Demo Simulation)
Upload receipt
Auto-fill expense fields
Enhances user experience
------------------------------------
🛠️ Tech Stack
Frontend                           
Next.js (App Router)               
Tailwind CSS                         
shadcn/ui
Backend
Supabase (PostgreSQL + Auth + RLS)
Server Actions
APIs
ExchangeRate API (currency conversion)
🔐 Security
Row Level Security (RLS) enforced at DB level
Secure Server Actions
No client-side trust for sensitive data
Role-based data isolation
-------------------------------------------------------
🚀 Getting Started
1️⃣ Clone the repository
git clone <your-repo-url>
cd project
------------------------
2️⃣ Install dependencies
npm install
-----------------------------
3️⃣ Setup environment variables

Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
----------------
4️⃣ Run the app
npm run dev
--------------------------------------------------
## 🎬 Demo Flow

### 🔹 Step 1: Employee Flow
- Login as Employee
- Submit a new expense:
  - Enter amount, category, description
  - Upload receipt (auto-filled using OCR simulation)
- System automatically converts currency in real-time
- Expense is saved with status: **Pending**

---

### 🔹 Step 2: Manager Flow
- Login as Manager
- View all pending expenses in dashboard
- Review expense details
- Approve or Reject with comments
- Status updates instantly and is recorded in audit trail

---

### 🔹 Step 3: Admin Flow
- Login as Admin
- Access Admin Panel
- Create approval rules dynamically
- Rules are stored in JSON format (no code changes required)

---

### 🔹 Step 4: Smart System Behavior
- Role-based access control ensures secure data visibility
- Dynamic rule engine controls approval flow
- Database enforces strict security using RLS
- System adapts to different organizational needs

---

### 🔹 Step 5: End-to-End Flow
Employee → Submit Expense  
Manager → Approve/Reject  
Admin → Configure Rules  

✔ Complete reimbursement lifecycle demonstrated
-------------------------------------
🏆 Why This Stands Out
JSON-based dynamic rule engine
Database-driven workflow logic
Clean UI + smooth UX
Real-world business use case
Scalable architecture
--------------------------------------
🔮 Future Enhancements
Real OCR integration (Veryfi API)
Multi-level hierarchical approvals
Notifications (Email/SMS)
Analytics dashboard
Mobile app
-------------------------------------
## 🔥 Key Highlights

- ⚡ Built within an 8-hour hackathon constraint
- 🔐 Secure Role-Based Access Control (RBAC)
- 🧾 Seamless Expense Submission System
- 🧑‍⚖️ Multi-level Approval Workflow
- ⚙️ Dynamic JSON-based Rule Engine (Core Innovation)
- 🌍 Real-time Currency Conversion
- 🤖 OCR-based Receipt Auto-fill (Simulated)
- 📊 Clean and Modern SaaS Dashboard UI
- 🔍 Full Audit Trail for transparency
- 🛡️ Row Level Security (RLS) for data protection
-----------------------------------------------------------
License

This project is for educational and hackathon purposes.

