🌩️ Cloud Resource Manager
A multi-cloud dashboard to manage AWS, Azure, and GCP resources with monitoring, logs, RBAC, and cost visibility.

🚀 Overview
- Cloud Resource Manager is a full-stack project that provides a unified console for managing cloud resources across AWS, Azure, and GCP.
- It includes features like:
- Multi-cloud resource provisioning
- Real-time (and mocked) monitoring
- RBAC (Admin / Developer / Viewer access levels)
- Resource logs & audits
- Cost and billing estimates
- Dark mode UI
- A clean dashboard layout inspired by AWS Console & GCP Console

🎯 Key Features

✅ Multi-Cloud Resource Management
- Supports creating and managing
- EC2-like Virtual Machines
- S3-like Storage Buckets
- DynamoDB-like Databases
- Serverless functions
- Load Balancers
- VM & database status auto-refreshes from AWS in real-time.

📊 Monitoring Dashboard
- CPU usage
- Memory
- Network In/Out
- Auto fallback to mock metrics if CloudWatch is not available

🧾 Logs & Audit Trails
- Tracks all create, update, delete events:
- Timestamp
- User
- Provider
- Status
- Resource Name
- Fully visible in the Logs & Audit page.

💰 Cost & Billing
- Auto calculates resource cost per month (mock values)
- Total cloud spend summary

🔐 RBAC – Role-Based Access Control
- Three built-in roles:

Role	        Permissions
- Admin	        Full access — create, update, delete, view logs, view RBAC
- Developer	    Can create resources but cannot delete them
- Viewer	    Read-only UI, all actions disabled

Credentials:
- Role	    Email	            Password
- Admin	    admin@example.com	admin123
- Developer	dev@example.com	    dev123
- Viewer	viewer@example.com	viewer123

All three show up in RBAC / Access section.

🌙 Full Dark / Light Mode
- Modern UI with TailwindCSS & React.
- Dark mode applies properly across:

All Resources
- Databases
- Networks
- Monitoring
- Logs & Audit
- RBAC
- Settings

🛠️ Tech Stack
- Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- Axios (API client)
- Backend
- Python FastAPI
- SQLAlchemy ORM
- SQLite database
- AWS SDK (boto3)
- CloudWatch Metrics
- dotenv
- Cloud
- AWS EC2, S3, DynamoDB implemented
- Azure & GCP mock integrations

📁 Project Structure
cloud-manager/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── aws/
│   │   │   ├── ec2.py
│   │   │   ├── s3.py
│   │   │   ├── dynamodb.py
│   │   │   └── metrics.py
│   │   ├── cloud/
│   │   │   ├── azure_mock.py
│   │   │   └── gcp_mock.py
│   │   └── ...
│   └── ...
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── types/
    │   └── ...

# ⚙️ Setup Instructions #

1️⃣ Backend Setup
- cd backend
- python -m venv venv
- venv\Scripts\activate    # Windows
- pip install -r requirements.txt
- uvicorn app.main:app --reload

Backend runs at:
http://localhost:8000


2️⃣ Frontend Setup
- cd frontend
- npm install
- npm run dev

Frontend runs at:
http://localhost:5173


🔑 Login Credentials
- Role	    Email	            Password
- Admin	    admin@example.com	admin123
- Developer	dev@example.com	    dev123
- Viewer	viewer@example.com	viewer123

🖼️ Screenshots (Add Your Images)
# Dashboard
# Resource List
# Logs & Audit
# RBAC Access
# Settings Page

🧪 Future Enhancements
- Real AWS cost explorer integration
- Multi-cloud provisioning across Azure/GCP
- Serverless logs and monitoring
- User activity analytics
- Graph-based topology map
- Auto scaling rules