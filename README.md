# VIỆT NAM 5D XUYÊN VIỆT - TRAI VIỆT GÁI VIỆT

1 trang duy nhất, màu đỏ vàng Việt Nam, bản đồ chữ S vàng kim ở giữa, 15 cổng hologram vàng xếp theo hình chữ S. Hội An to nhất ở giữa.

## 15 tỉnh (Bắc → Nam)
Hà Giang, Sapa, Hà Nội, Hạ Long, Ninh Bình, Phong Nha, Huế, Đà Nẵng, Hội An, Nha Trang, Đà Lạt, Sài Gòn, Miền Tây, Phú Quốc, Cà Mau.

Mỗi tỉnh 1 bộ đồ Việt Nam thường ngày và 1 phương tiện riêng — ví dụ Hà Nội xích lô, Hạ Long thuyền rồng, Sapa tàu hỏa + cáp treo, Miền Tây xuồng ba lá duy nhất đi quanh rặng dừa. Tuyệt đối không giáp võ lâm, không đồ Trung Quốc.

## Tính năng
- Bay 5D nhẹ giữa các cổng, hiện "[TÊN TỈNH] Đã tới..."
- Cảnh Miền Tây đặc biệt: bấm dừa rụng, bấm nước tạo sóng, nút "Uống dừa"
- Nhạc tự động theo tỉnh, crossfade 2s, thư mục `public/music/` có 15 file mp3 (đang để trống để Sếp tự thay), nút Upload nhạc lưu localStorage, Khôi phục nhạc gốc, Xuất danh sách
- Live TikTok: gõ comment không dấu `hoi an`, `mien tay`, `da lat` để bay tới; gõ `yeu viet nam` bắn pháo hoa đỏ vàng; nút Bay ngẫu nhiên; Hộ chiếu đủ 15 tỉnh cấp Bằng khen Yêu nước + Fashionista Xuyên Việt; nút chụp ảnh lưu niệm tải PNG về
- Nút dưới: MAP, QUESTS, START JOURNEY!, REWARDS, SHOP

## Chạy local
Mở `index.html` bằng trình duyệt, hoặc chạy server tĩnh rồi mở `http://localhost:8000`.

## Deploy GitHub Pages
Repo: `genvops/vietnam-5d-xuyen-viet`, nhánh `main`, thư mục gốc `/`.
Link live (sau khi bật Pages): https://genvops.github.io/vietnam-5d-xuyen-viet/

## Live TikTok qua OBS
Thêm Browser Source với link live trên, đặt 1080×1920 (dọc) hoặc 1920×1080 (ngang). Nhân vật là hình minh họa phong cách Việt, không dùng ảnh người thật không rõ nguồn.

## Game Hội An + TikTok LIVE thật (hoian.html + server.js)
Từ 2026-11-03, theo lệnh của Sếp, hoian.html đã THAY HOÀN TOÀN bằng bản GTA HỘI AN 5D do Sếp gửi (Three.js 0.160, thuyền hộp, HUD GTA, minimap, bản đồ VN vàng). Bản cũ y ảnh / hoa sen / góc "Xem như ảnh" (commit 62dbb16d) không còn trên Pages nữa, nhưng vẫn còn trong lịch sử Git và bản sao lưu local hoian-v3-lotus-backup.html / server-full-backup.js.
Chạy live thật:
```bash
npm i
# thay USERNAME trong server.js thành @TikTok của Sếp, rồi:
node server.js
# mở http://localhost:3000/hoian.html (game tự nối socket.io tới server)
```
Lưu ý kỹ thuật: bản tiktok-live-connector mới nhất (0.9.30) không còn export TikTokLiveConnection, chỉ còn WebcastPushConnection — server.js đã sửa để dùng class có sẵn, nếu không sẽ crash ngay dòng new. Khi chưa đặt username, server vẫn chạy để game nối socket, chỉ chưa nối TikTok thật. Pages là web tĩnh, không chạy được server.js.
