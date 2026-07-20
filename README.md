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
docker compose up --build
```

Lần đầu chạy mất khoảng **3–10 phút**. Các lần sau chỉ vài giây.

**Khi hệ thống sẵn sàng:**

| Dịch vụ | URL |
|---|---|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ API Backend | http://localhost:5000/api/v1 |
| 🗄️ MongoDB | `localhost:27018` |
| 📦 Redis | `localhost:6379` |

### 4. Cài đặt Piston (Code Judge)

Mở **terminal mới** (giữ terminal hệ thống chính):

```bash
cd piston
docker compose up -d

# Cài ngôn ngữ lập trình (chỉ cần 1 lần)
docker exec piston_api cli ppman install javascript
```

Piston chạy tại `http://localhost:2000`.

### 5. Seed dữ liệu mẫu (Tùy chọn)

```bash
# Tạo khóa học mẫu
docker exec coding_platform_backend node seeders/seeder.js

# Tạo bài viết Blog mẫu
docker exec coding_platform_backend node seeders/blogSeeder.js

# Tạo tài khoản test
docker exec coding_platform_backend node seeders/userSeeder.js
```

**Tài khoản test:**

| Loại | Email | Mật khẩu |
|---|---|---|
| 👑 Admin | `admin@test.com` | `password123` |
| 🎓 Học viên | `student@test.com` | `password123` |

---

## Cấu trúc dự án

```
📦 learning-programming-website/
 ┣ 📂 backend/                  # API Server (Node.js/Express)
 ┃ ┣ 📂 config/                 # Kết nối Database
 ┃ ┣ 📂 controllers/            # Logic xử lý API
 ┃ ┃ ┣ 📂 admin/                # API quản trị
 ┃ ┃ ┣ 📂 auth/                 # Đăng ký, Đăng nhập, OAuth
 ┃ ┃ ┣ 📂 course/               # Khóa học, Bài học
 ┃ ┃ ┣ 📂 judge/                # Chạy code, AI phân tích
 ┃ ┃ ┣ 📂 payment/              # VNPay
 ┃ ┃ ┗ 📂 progress/             # Tiến độ học tập
 ┃ ┣ 📂 middlewares/            # JWT Auth, Rate Limit, Upload
 ┃ ┣ 📂 models/                 # MongoDB Schemas
 ┃ ┣ 📂 queue/                  # BullMQ Worker chấm bài
 ┃ ┣ 📂 routes/                 # Định tuyến API (v1)
 ┃ ┣ 📂 seeders/                # Dữ liệu mẫu
 ┃ ┣ 📂 uploads/                # File được upload
 ┃ ┣ 📜 server.js               # Entry point
 ┃ ┗ 📜 .env.example            # Mẫu biến môi trường
 ┣ 📂 frontend/                 # React App (Vite + TailwindCSS)
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 app/                  # Components & Pages
 ┃ ┃ ┣ 📂 layouts/              # Layout chung
 ┃ ┃ ┗ 📂 styles/               # CSS
 ┃ ┣ 📂 services/               # API services (axios)
 ┃ ┗ 📜 .env.example            # Mẫu biến môi trường
 ┣ 📂 piston/                   # Code Judge Engine
 ┃ ┗ 📜 docker-compose.yaml
 ┣ 📂 deploy/                   # Scripts & configs deploy
 ┣ 📜 docker-compose.yml        # Docker Compose chính
 ┗ 📜 README.md
```

---

## API Keys cần chuẩn bị

| API | Mục đích | Link đăng ký |
|---|---|---|
| Google Gemini | AI phân tích code | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Google OAuth | Đăng nhập Google | [console.cloud.google.com](https://console.cloud.google.com/) |
| VNPay Sandbox | Thanh toán | [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn/devreg/) |
| Gmail App Password | Gửi email | [myaccount.google.com](https://myaccount.google.com/security) |

> Dự án vẫn chạy được mà không cần điền API keys. Chỉ các tính năng tương ứng sẽ không hoạt động.

---

## Lệnh Docker hữu ích

```bash
# Tắt tất cả
docker compose down

# Xem log realtime
docker compose logs -f backend

# Cài thêm thư viện
docker exec -it coding_platform_backend npm install <package>

# Reset sạch database
docker compose down -v
docker compose up --build
```

---

## Xử lý sự cố

| Lỗi | Giải pháp |
|---|---|
| `port is already allocated` | `docker compose down` rồi chạy lại |
| Frontend không kết nối Backend | Kiểm tra cả 2 service đang chạy: `docker compose ps` |
| Piston trả về 404 | Kiểm tra Piston đang chạy (`http://localhost:2000`) và ngôn ngữ đã cài |
| CORS error | Kiểm tra `CORS_ORIGINS` trong `backend/.env` |

---

## Tác giả

- **Bùi Duy Kha** — 52300032
- **Lê Đoàn Anh Hào** — 52300022
- **GVHD:** ThS. Dương Hữu Phước
- Năm học 2025–2026 | Học kỳ 2