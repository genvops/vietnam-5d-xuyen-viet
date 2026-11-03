// TikTok LIVE -> Game GTA Hội An (hoian.html)
// Chạy:  npm i   rồi   node server.js
// Username lấy từ biến môi trường TIKTOK_USERNAME, nếu không có thì dùng
// giá trị dưới đây. Đổi ở đây HOẶC chạy:  TIKTOK_USERNAME=hoian.5d node server.js
// Lưu ý: GitHub Pages là web tĩnh, KHÔNG chạy được file này.
// Muốn live thật: chạy file này trên PC/VPS của Sếp, mở game trên cùng
// máy (http://localhost:3000) hoặc trỏ game tới địa chỉ server đó.
// Thư viện tiktok-live-connector là dự án đảo ngược không chính thức của
// TikTok, có thể ngừng hoạt động khi TikTok đổi API — không phải API chính thức.
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });
const { TikTokLiveConnection } = require('tiktok-live-connector');

const USERNAME_TIKTOK = process.env.TIKTOK_USERNAME || 'thay_bang_username_cua_may'; // VD: 'hoian.5d'
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(__dirname + '/hoian.html'));
app.get('/health', (req, res) => res.json({
  ok: true, username: USERNAME_TIKTOK, connected: !!currentRoomId, roomId: currentRoomId,
  note: 'Server chay, game noi qua socket.io. TikTok chi that khi username dang live.'
}));

// Test không cần TikTok thật: mở trình duyệt tới các link này là game nhận event.
// VD: http://localhost:3000/test/join?user=GenZ123
app.get('/test/chat', (req, res) => { io.emit('tiktok-chat', req.query.user || 'Test', req.query.comment || 'dep qua'); res.send('ok chat'); });
app.get('/test/join', (req, res) => { io.emit('tiktok-join', req.query.user || 'Test'); res.send('ok join'); });
app.get('/test/gift', (req, res) => { io.emit('tiktok-gift', req.query.user || 'Test', req.query.gift || 'Hoa hồng', Number(req.query.count || 1)); res.send('ok gift'); });

// Chuẩn hóa dữ liệu: bản mới của thư viện trả data.user.uniqueId,
// bản cũ trả data.uniqueId trực tiếp. Hỗ trợ cả hai để không vỡ game.
function pickUser(data) {
  return (data && data.user && (data.user.uniqueId || data.user.nickname))
    || (data && (data.uniqueId || data.nickname)) || 'Người xem TikTok';
}
function pickGiftName(data) {
  return (data && (data.giftName || (data.gift && data.gift.name)
    || (data.extendedGiftInfo && data.extendedGiftInfo.name))) || 'Quà';
}
function pickCount(data) {
  return Number((data && (data.repeatCount || data.repeat_count
    || (data.gift && data.gift.repeatCount))) || 1);
}

let tiktok = null;
let currentRoomId = null;
let connecting = false;

async function connectTikTok(username) {
  if (connecting) return;
  if (!username || username === 'thay_bang_username_cua_may') {
    console.log('⚠️ Chưa đặt TIKTOK_USERNAME. Server vẫn chạy để test, nhưng chưa nối TikTok thật.');
    io.emit('live-status', '⚠️ Chưa đặt @TikTok: chạy TIKTOK_USERNAME=ten_cua_ban node server.js');
    return;
  }
  connecting = true;
  try {
    if (tiktok) { try { await tiktok.disconnect(); } catch (e) { /* bỏ qua */ } }
    tiktok = new TikTokLiveConnection(username);
    const state = await tiktok.connect();
    currentRoomId = state.roomId;
    connecting = false;
    console.log(`✅ Đã kết nối LIVE TikTok @${username}:`, state.roomId);
    io.emit('live-status', `🔴 LIVE @${username} - ${state.roomId}`);

    tiktok.on('chat', data => {
      const user = pickUser(data);
      console.log(`💬 ${user}: ${data.comment}`);
      io.emit('tiktok-chat', user, data.comment);
    });
    tiktok.on('gift', data => {
      const user = pickUser(data);
      const gift = pickGiftName(data);
      const count = pickCount(data);
      console.log(`🎁 ${user} tặng ${gift} x${count}`);
      io.emit('tiktok-gift', user, gift, count);
    });
    tiktok.on('member', data => {
      const user = pickUser(data);
      console.log(`👋 ${user} vừa vào`);
      io.emit('tiktok-join', user);
    });
    tiktok.on('like', data => {
      const user = pickUser(data);
      io.emit('tiktok-like', user, Number(data.likeCount || data.totalLikeCount || 1));
    });
    // Số người xem (nếu thư viện gửi): roomUser / viewerCount
    tiktok.on('roomUser', data => {
      if (data && data.viewerCount != null) io.emit('tiktok-viewers', Number(data.viewerCount));
    });
    tiktok.on('disconnected', () => {
      currentRoomId = null;
      console.log('⚠️ Mất nối TikTok, thử nối lại sau 5s...');
      io.emit('live-status', '⚠️ Mất nối TikTok, đang nối lại...');
      setTimeout(() => connectTikTok(username), 5000);
    });
  } catch (err) {
    connecting = false;
    currentRoomId = null;
    console.error('❌ Lỗi kết nối TikTok:', err && err.message ? err.message : err);
    io.emit('live-status', '❌ Chưa live, hãy bật live TikTok đi!');
  }
}

// Game bấm "Bắt đầu Live" có thể gửi @ mới lên, server sẽ nối lại đúng @ đó.
io.on('connection', (socket) => {
  socket.emit('live-status', currentRoomId
    ? `🔴 LIVE @${USERNAME_TIKTOK} - ${currentRoomId}`
    : 'Chưa nối TikTok thật — bấm Bắt đầu Live sau khi chạy server.');
  socket.on('set-username', (name) => {
    if (typeof name === 'string' && name.trim()) connectTikTok(name.trim().replace(/^@/, ''));
  });
});

connectTikTok(USERNAME_TIKTOK);

http.listen(PORT, () => console.log(`Server chạy http://localhost:${PORT} - Đợi TikTok Live...`));
