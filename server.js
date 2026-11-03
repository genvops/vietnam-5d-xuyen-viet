// npm i tiktok-live-connector socket.io express
const express=require('express'), app=express(), http=require('http').createServer(app), io=require('socket.io')(http,{cors:{origin:"*"}});
// SỬA BẮT BUỘC để chạy được với npm hiện tại: bản 0.9.30 không còn export
// TikTokLiveConnection nữa (chỉ còn WebcastPushConnection). Code gốc Sếp gửi
// dùng TikTokLiveConnection nên chạy là crash ngay dòng new. Dùng class nào
// có sẵn trong thư viện, ưu tiên TikTokLiveConnection nếu bản cũ còn nó.
const tiktokLib=require('tiktok-live-connector');
const TikTokConn=tiktokLib.TikTokLiveConnection||tiktokLib.WebcastPushConnection;
const USERNAME='thay_username_tiktok_cua_may';
app.use(express.static(__dirname));
let tiktok=new TikTokConn(USERNAME);
if(USERNAME==='thay_username_tiktok_cua_may'){
  console.log('⚠️ Chưa đặt username TikTok: thay USERNAME trong server.js rồi chạy lại. Server vẫn chạy để game nối socket.');
} else {
  tiktok.connect().then(s=>console.log('LIVE OK',s.roomId)).catch(e=>console.log('Chưa live, bật TikTok đi'));
}
// Bản mới của thư viện trả d.user.uniqueId, bản cũ trả d.uniqueId.
// Chuẩn hóa ở đây để game không nhận được tên undefined. Count quà cũng
// gửi kèm để game phân biệt 1 bông / 5 bông.
const pickUser=d=>(d&&d.user&&(d.user.uniqueId||d.user.nickname))||(d&&(d.uniqueId||d.nickname))||'Người xem TikTok';
const pickGift=d=>(d&&(d.giftName||(d.gift&&d.gift.name)||(d.extendedGiftInfo&&d.extendedGiftInfo.name)))||'Quà';
const pickCount=d=>Number((d&&(d.repeatCount||d.repeat_count||(d.gift&&d.gift.repeatCount)))||1);
tiktok.on('chat',d=>io.emit('tiktok-chat',pickUser(d),d.comment));
tiktok.on('gift',d=>io.emit('tiktok-gift',pickUser(d),pickGift(d),pickCount(d)));
tiktok.on('member',d=>io.emit('tiktok-join',pickUser(d)));
http.listen(3000,()=>console.log('http://localhost:3000'));
