Gõ lệnh để vào thư mục backend:
cd backend

Chạy lệnh khởi động:
dotnet run --project BookStore.API

Bước 2: Khởi động Frontend (React + Vite)
Bạn hãy mở thêm một Terminal mới (bấm dấu + ở góc phải bảng Terminal) và thực hiện:

Gõ lệnh để vào thư mục frontend:
cd frontend
npm install
Chạy lệnh khởi động:
npm run dev

 SWAGGER
http://localhost:5000/swagger/index.html
docker-compose down
docker-compose up --build -d
docker ps


netstat -ano | findstr :5000


D:\clone
cd D:\clone
git clone https://github.com/minhcang294/Web_bansach.git

LỊCH SỬ THAO TÁC
Sau đó, mở Terminal (cửa sổ dòng lệnh) ở thư mục Backend và chạy 2 lệnh quen thuộc để cập nhật Database:
cd backend/BookStore.API
dotnet ef migrations add AddActivityLogTable

dotnet ef database update


git add .
git commit -m "Hoàn thiện luồng Auth, thêm Quản lý Nhà Cung Cấp và chuẩn hóa ERD/Database"
git push