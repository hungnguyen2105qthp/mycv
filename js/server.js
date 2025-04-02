// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Đường dẫn đến file messages.json
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Hàm đọc tin nhắn từ file JSON
function loadMessagesFromFile() {
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

// Hàm lưu tin nhắn vào file JSON
function saveMessagesToFile(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Mảng tạm để lưu tin nhắn khi server chạy
// Mỗi lần khởi động server, ta load từ file
let messages = loadMessagesFromFile();

// Khi client kết nối
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Gửi lịch sử tin nhắn cho client mới
  socket.emit('loadMessages', messages);

  // Lắng nghe khi client gửi tin nhắn
  socket.on('sendMessage', (msg) => {
    // Thêm vào mảng
    messages.push(msg);
    // Lưu vào file
    saveMessagesToFile(messages);
    // Phát tin nhắn đến tất cả client
    io.emit('receiveMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Phục vụ các file tĩnh trong thư mục public
app.use(express.static('public'));

// Chạy server trên cổng 3000
http.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
