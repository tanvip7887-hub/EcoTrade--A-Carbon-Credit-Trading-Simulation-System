# EcoTrade: Implementation Strategy & Project Summary

## 1. Project Overview
EcoTrade is a carbon credit trading simulation system that models an environmental economy. It features a **Government Admin** role for oversight and **Company** roles for market participation.

## 2. Technical Stack
- **Backend:** Flask / Python / SQLAlchemy (SQLite)
- **Frontend:** React / Vite / Recharts
- **Security:** JWT (JSON Web Tokens)
- **Architecture:** Modular REST API

## 3. Data Structures & Logic
We use advanced data structures to solve specific economic simulation problems:
- **Hash Table:** Used for O(1) instant retrieval of company details by ID.
- **AVL Tree:** A self-balancing search tree used to rank companies by credits. Provides O(log n) efficiency.
- **Graph:** A directed graph mapping "Seller -> Buyer" relationships for network analysis.
- **Queue:** FIFO (First-In-First-Out) structure used to log trade history in order.
- **Stack:** LIFO (Last-In-First-Out) structure used to power the "Undo Trade" feature.

## 4. `routes.py` Contribution Division (The 4 Parts)
To divide the work on the main backend logic, we split `routes.py` into these 4 sections:

### Part 1: Authentication & Identity
- **Keywords:** `register`, `login`, `JWT`
- **Goal:** Manage secure access and identity for all users.

### Part 2: Registry & Allocation
- **Keywords:** `handle_companies`, `credits_allocated`
- **Goal:** Government tools for authorized entity management and credit issuance.

### Part 3: Trade Engine & Persistence
- **Keywords:** `execute_trade`, `undo_trade`, `db.session.commit`
- **Goal:** The core transaction logic that keeps company balances synchronized.

### Part 4: Analytics & Visualization
- **Keywords:** `get_rankings`, `get_stats`, `get_network`, `AVLTree`, `Graph`
- **Goal:** Converting raw database rows into data-structure-driven insights for the dashboard.

## 5. Persistence Strategy
All data is stored in the master `ecotrade.db` file in the root directory. Every registration, trade, and allocation is committed to disk immediately to prevent data loss.
