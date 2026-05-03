# 🌿 EcoTrade: Carbon Credit Trading Simulation System

EcoTrade is a high-performance Carbon Credit Trading Simulator built as an Advanced Data Structures project. The platform models a real-world environmental economy, demonstrating the power of custom algorithmic structures for market management, ranking, and network analysis.

---

## 🚀 Key Features

| Feature | Data Structure | Impact |
| :--- | :--- | :--- |
| **Marketplace** | **Transactions** | Real-time "Before & After" trade intelligence for companies. |
| **Rankings** | **AVL Tree** | Self-balancing rankings of companies based on carbon performance. |
| **Network Graph** | **Graph** | Visual mapping of trading relationships (Seller → Buyer). |
| **Trade Audit** | **Queue** | Chronological FIFO logging of every transaction in the market. |
| **Admin Undo** | **Stack** | LIFO-based "Safe Revert" to undo the most recent market trade. |

---

## 🛠️ Technology Stack

- **Frontend:** React (Vite), Recharts, Lucide Icons, Axios.
- **Backend:** Flask (Python), JWT Authentication, RESTful API.
- **Persistence:** SQLite (SQLAlchemy) for permanent market storage.
- **Algorithmic Layer:** Custom implementations of AVL Trees, Directed Graphs, Queues, and Stacks.

---

## 📂 Project Structure

```bash
EcoTrade/
├── backend/
│   ├── app/
│   │   ├── data_structures.py  # Custom Algorithm implementations
│   │   ├── models.py           # Database Schema
│   │   └── routes.py           # Trade Engine & API Logic
│   ├── run.py                  # Backend Entry Point
│   └── ecotrade.db             # Master Database File
├── frontend-react/
│   ├── src/
│   │   ├── pages/              # Dashboard, Trading, Registry views
│   │   └── api.js              # Central API Configuration
│   └── package.json            # Frontend Dependencies
└── PROJECT_BLUEPRINT.md        # Technical implementation strategy
```

---

## 👥 Team Roles & Contributions

We divided the project into four specialized focus areas:

1. **Backend Architect:** Database schema, API routing, and JWT security.
2. **Algorithms Engineer:** Implementation and optimization of custom Data Structures.
3. **UI/UX Designer:** React component architecture and modern dashboard design.
4. **Integration Specialist:** Market transaction logic and full-stack connectivity.

---

## 🏁 Getting Started

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Runs on http://127.0.0.1:5000*

### 2. Frontend Setup
```bash
cd frontend-react
npm install
npm run dev
```
*Runs on http://localhost:5173*

---

## 🔑 Access Control

- **Administrator:** `admin` / `admin` (Full market oversight, Registry control, Undo power).
- **Companies:** Register via the "Create Account" portal to access the trading floor and private dashboard.

---

## 🎓 Educational Objective
This project was developed to demonstrate the practical application of **Advanced Data Structures** in solving complex socio-economic and environmental problems. Every data structure used is implemented from scratch to ensure algorithmic transparency.
