**QBoard – Quantum Jobs Tracker**

QBoard is a modern React-based dashboard for monitoring IBM Quantum backends and job queues.
It helps users visualize backend availability, pending quantum jobs, predicted wait times, and backend status in an interactive and user-friendly way.
---

📌 Problem Statement

Quantum computing users submit jobs (quantum circuits/programs) to IBM Quantum backends.
However, monitoring backend queue load, availability, and estimated wait times across multiple systems is difficult and scattered.

The goal of this project is to build a centralized dashboard that:

Tracks IBM Quantum backend queues
Displays pending jobs
Predicts wait times
Monitors online/offline backend status
Provides filtering, searching, charts, and live refresh
--

🎯 Project Objective

The main objective of QBoard is to simplify quantum backend monitoring by providing:

A real-time dashboard
Queue analytics
Backend performance insights
Visual representations of backend load
Faster backend selection for users
--
⚙️ Workflow
1. Data Fetching
The frontend fetches backend/job data from the API endpoint:

/api/backends

If the API is unavailable, fallback simulated data is used.

2. Data Processing

Fetched data is processed into:

Backend name
Pending jobs
Online/offline status
Predicted wait time

3. Visualization

The processed data is displayed using:

Tables
Charts
Status badges
Summary cards

4. User Interaction

Users can:

Search backends
Sort queues
Filter online/offline systems
Change refresh intervals
Pause/resume live updates
Download CSV reports

🛠️ Tech Stack
**Frontend**
React.js
JavaScript 
HTML5
CSS3
**Charts & Visualization**
Chart.js
React Icons
**Backend**
Python
Pandas
Qiskit
**IBM Quantum Runtime API**
API/Data
IBM Quantum Services
REST API Fetch
--

**Features Implemented**
**✅ Dashboard Summary Cards**

Displays:

- Total pending jobs
- Average predicted wait
- Online systems
- Offline systems
- Most busy backend
- Least busy backend

**✅ Backend Queue Monitoring**

**Tracks:**

- Backend name
- Pending jobs
- Online/offline state
- Predicted wait time

✅ Live Refresh System

**Auto-refreshes backend data every:**

5 seconds
10 seconds
15 seconds

**Users can also:**

- Pause updates
- Resume updates

**✅ Interactive Charts**

**Supports:**

- Bar chart
- Pie chart
- Line chart
- Built using Chart.js.

**✅ Search & Filtering**

Users can:

- Search backend names
- Filter online/offline systems
- Sort by queue size

**✅ Pagination**

Supports:

- Multiple pages
- Adjustable rows per page

✅ CSV Export
Users can download backend statistics as CSV reports.

✅ Best Backend Recommendation
Displays the backend with:

Lowest predicted wait time
Active online status
🔄 Real-Time Update Logic

The project uses a custom interval hook:
useInterval(callback, delay)
This periodically refreshes backend data automatically.

**📊 Charts Used**
Chart Type	Purpose
- Bar Chart	Compare pending jobs
- Pie Chart	Queue distribution
- Line Chart	Queue history over time

**📈 Future Improvements**
Real IBM Quantum live backend integration
Authentication system
Historical analytics
Quantum job submission
AI-based wait prediction
Dark/Light theme toggle
Backend health monitoring

**▶️ Installation & Setup**
1. Clone Repository
git clone <repo-url>
cd qboard
2. Install Dependencies
npm install
3. Start Development Server
npm run dev
🌐 API Endpoint
