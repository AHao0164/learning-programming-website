<div align="center">

# HK Learning Platform

**Nền tảng Học Lập Trình Trực Tuyến Tích Hợp AI**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## Giới thiệu

**HK Learning** là hệ thống LMS (Learning Management System) cho phép học viên học lập trình trực tuyến với các tính năng:

- 🤖 **AI Trợ giảng** (Google Gemini) — Phân tích code, gợi ý sửa lỗi, đánh giá thuật toán
- ⚡ **Online Judge** — Trình biên dịch code trực tuyến (Piston Engine) hỗ trợ nhiều ngôn ngữ
- 🎮 **Gamification** — Hệ thống XP, Streak, Leaderboard
- 💳 **Thanh toán** — Tích hợp VNPay Sandbox
- 📧 **Email** — Quên mật khẩu qua Gmail SMTP
- 🔐 **OAuth** — Đăng nhập bằng Google
- 🔔 **Realtime** — Thông báo qua Socket.IO
- 📝 **Blog** — Hệ thống bài viết với Editor.js

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| **Frontend** | React 18 (Vite), TailwindCSS v4, Radix UI, Socket.IO Client |
| **Backend** | Node.js 18, Express.js, Socket.IO |
| **Database** | MongoDB (Mongoose ODM) |
| **Cache / Queue** | Redis + BullMQ |
| **Code Judge** | Piston Engine (Docker) |
| **AI** | Google Gemini API |
| **Thanh toán** | VNPay Sandbox |
| **Email** | Nodemailer (Gmail SMTP) |
| **Infrastructure** | Docker & Docker Compose |

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản | Link |
|---|---|---|
| **Docker Desktop** | 4.x+ | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | Bất kỳ | [git-scm.com](https://git-scm.com/) |

> **Lưu ý:** Không cần cài Node.js hay MongoDB trên máy. Docker Compose sẽ quản lý toàn bộ.

---

## Cài đặt & Chạy

### 1. Clone dự án

```bash
git clone <URL_REPO>
cd learning-programming-website
```

### 2. Tạo file `.env`

```bash
# Backend
cp backend/.env.example backend/.env
# Sửa backend/.env và điền các giá trị cần thiết

# Frontend
cp frontend/.env.example frontend/.env
# Sửa frontend/.env nếu cần
```

> **Chạy nhanh:** Hệ thống vẫn hoạt động mà không cần điền Gemini API Key, VNPay, SMTP hay Google OAuth. Chỉ các tính năng tương ứng sẽ bị tắt.

### 3. Khởi chạy hệ thống

```bash
docker compose up --build -d
```

Lần đầu chạy mất khoảng **3–7 phút** để tải các Docker images. Các lần sau chỉ mất vài giây.
Docker Compose sẽ khởi chạy đồng thời cả **5 dịch vụ**:

| Dịch vụ | URL / Cổng | Ghi chú |
|---|---|---|
| 🌐 **Frontend** | [http://localhost:5173](http://localhost:5173) | Giao diện React (Vite) |
| ⚙️ **API Backend** | [http://localhost:5005/api/v1](http://localhost:5005/api/v1) | Express REST API |
| ⚡ **Piston Engine** | [http://localhost:2000](http://localhost:2000) | Trình biên dịch & chấm code |
| 🗄️ **MongoDB** | `localhost:27018` | Cơ sở dữ liệu chính |
| 📦 **Redis** | `localhost:6379` | Hàng đợi BullMQ & Cache |

> **Lưu ý cổng Backend:** Mặc định cổng ngoài ánh xạ là `5005:5000` để tránh xung đột cổng `5000` với Windows WSL2/Hyper-V. File `frontend/.env` đã được cấu hình trỏ tới `5005`.

### 4. Cài đặt ngôn ngữ cho Piston (Code Judge)

Piston đã tích hợp sẵn trong Docker Compose. Để tải các môi trường chạy code (JavaScript, Python, C/C++), chỉ cần chạy lệnh tự động sau (chỉ cần chạy 1 lần duy nhất):

```bash
docker exec coding_platform_backend node scripts/installPiston.js
```

### 5. Seed dữ liệu mẫu (Khóa học, Blog, User)

Hệ thống đã phân chia sẵn 3 file seed độc lập và tinh gọn:

```bash
# 1. Tạo 18 khóa học, chương học và các bài tập mẫu
docker exec coding_platform_backend node seeders/courseSeeder.js

# 2. Tạo 18 bài viết Blog mẫu
docker exec coding_platform_backend node seeders/blogSeeder.js

# 3. Tạo tài khoản test (Admin & Học viên)
docker exec coding_platform_backend node seeders/userSeeder.js
```

**Tài khoản test có sẵn:**

| Loại | Email | Mật khẩu |
|---|---|---|
| 👑 Admin | `admin@test.com` | `password123` |
| 🎓 Học viên | `student@test.com` | `password123` |

---

## Cấu trúc dự án

```
📦 learning-programming-website/
 ┣ 📂 backend/                  # API Server (Node.js/Express)
 ┃ ┣ 📂 config/                 # Kết nối MongoDB, Redis
 ┃ ┣ 📂 controllers/            # Logic xử lý API (Admin, Auth, Course, Judge, Blog, Payment)
 ┃ ┣ 📂 middlewares/            # JWT Auth, Rate Limit, Upload Multer
 ┃ ┣ 📂 models/                 # Mongoose Schemas (User, Course, Problem, Blog, ...)
 ┃ ┣ 📂 queue/                  # BullMQ Worker chấm bài Piston
 ┃ ┣ 📂 routes/                 # Định tuyến API (v1)
 ┃ ┣ 📂 scripts/                # Script tự động (installPiston.js)
 ┃ ┣ 📂 seeders/                # File cấy dữ liệu mẫu (courseSeeder, blogSeeder, userSeeder)
 ┃ ┣ 📂 uploads/                # File avatar & media upload
 ┃ ┣ 📜 server.js               # Entry point Express
 ┃ ┗ 📜 .env.example            # Mẫu biến môi trường
 ┣ 📂 frontend/                 # React App (Vite + TailwindCSS + Monaco Editor)
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 app/                  # Pages & Components
 ┃ ┃ ┣ 📂 layouts/              # Navbar, Sidebar, Footer Layouts
 ┃ ┃ ┗ 📂 styles/               # CSS
 ┃ ┣ 📂 services/               # API clients (axios) & Socket.io
 ┃ ┗ 📜 .env.example            # Mẫu biến môi trường
 ┣ 📂 piston/                   # Cấu hình Piston Code Judge
 ┃ ┗ 📂 data/                   # Gói ngôn ngữ Piston (đã tự động bỏ qua trong .gitignore)
 ┣ 📂 deploy/                   # Nginx & script deploy production
 ┣ 📜 docker-compose.yml        # Docker Compose chính (quản lý trọn gói 5 dịch vụ)
 ┗ 📜 README.md
```

---

## API Keys cần chuẩn bị

| API | Mục đích | Link đăng ký |
|---|---|---|
| Google Gemini | AI phân tích code, trợ giảng, sinh bài tập | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Google OAuth | Đăng nhập bằng Google | [console.cloud.google.com](https://console.cloud.google.com/) |
| VNPay Sandbox | Thanh toán khóa học | [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn/devreg/) |
| Gmail App Password | Gửi email quên mật khẩu | [myaccount.google.com](https://myaccount.google.com/security) |

> Hệ thống hoạt động bình thường với tài khoản mặc định mà không bắt buộc phải có API Keys.

---

## Lệnh Docker hữu ích

```bash
# Xem trạng thái các containers
docker compose ps

# Xem log realtime của Backend
docker compose logs -f backend

# Tắt toàn bộ hệ thống
docker compose down

# Khởi động lại riêng Backend khi sửa cấu hình
docker restart coding_platform_backend

# Reset sạch database và khởi động lại từ đầu
docker compose down -v
docker compose up --build -d
```

---

## Xử lý sự cố

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| `Bind for 0.0.0.0:5000 failed` | Port 5000 bị Windows WSL2 chiếm giữ | Đổi port ngoài sang `5005:5000` trong `docker-compose.yml` và `frontend/.env` |
| `Piston Server: runtime is not installed` | Chưa tải ngôn ngữ cho Piston | Chạy `docker exec coding_platform_backend node scripts/installPiston.js` |
| `ReferenceError: crypto is not defined` | Node 18 thiếu global webcrypto | Đã tích hợp polyfill ở đầu `server.js` và các file `seeders/` |
| `Failed to fetch / CORS error` | Sai URL backend hoặc CORS | Kiểm tra `VITE_API_URL` trong `frontend/.env` và `CORS_ORIGINS` trong `backend/.env` |

---

## Tác giả

- **Bùi Duy Kha** — 52300032
- **Lê Đoàn Anh Hào** — 52300022
- **GVHD:** ThS. Dương Hữu Phước
- Năm học 2025–2026 | Học kỳ 2