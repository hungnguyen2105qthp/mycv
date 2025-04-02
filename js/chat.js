document.addEventListener("DOMContentLoaded", function () {
  const chatWindow = document.getElementById("chatWindow");
  const chatButton = document.getElementById("chatButton");
  const closeChat = document.getElementById("closeChat");
  const chatSendButton = document.getElementById("chatSend");
  const chatInput = document.getElementById("chatInput");

  if (!chatWindow || !chatButton || !closeChat || !chatSendButton || !chatInput) {
      console.error("Không tìm thấy phần tử chat.");
      return;
  }

  function toggleChat() {
      chatWindow.classList.toggle("open");
  }

  chatButton.addEventListener("click", toggleChat);
  closeChat.addEventListener("click", toggleChat);
  chatSendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") sendMessage();
  });
});

// Hàm gửi tin nhắn từ cả khách hàng & admin
function sendMessage() {
  const chatMessagesDiv = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");

  if (!chatMessagesDiv || !chatInput) {
      console.error("Không tìm thấy các phần tử chat.");
      return;
  }

  const text = chatInput.value.trim();
  if (!text) return;

  // Xác định người gửi là Admin hay Khách hàng
  const sender = window.location.pathname.includes("admin") ? "Admin" : "Khách hàng";

  const newMessage = {
      sender: sender,
      text: text,
      time: new Date().toLocaleString()
  };

  db.ref("messages").push(newMessage);
  chatInput.value = "";

  // Nếu người gửi là khách hàng, admin sẽ trả lời sau 10 giây
  if (sender === "Khách hàng") {
      setTimeout(sendAutoAdminMessage, 10000);
  }
}

// Hàm gửi tin nhắn tự động từ Admin khi khách nhắn tin
function sendAutoAdminMessage() {
  const autoReply = {
      sender: "Admin",
      text: "Cảm ơn bạn đã nhắn tin! Chúng tôi sẽ phản hồi sớm nhất.",
      time: new Date().toLocaleString()
  };

  db.ref("messages").push(autoReply);
}

// Hàm hiển thị tin nhắn mới
function appendMessage(msg) {
  const chatMessagesDiv = document.getElementById("chatMessages");
  if (!chatMessagesDiv) return;

  const div = document.createElement("div");
  div.className = msg.sender === "Admin" ? "adminMessage" : "userMessage";
  div.textContent = `${msg.sender}: ${msg.text} (${msg.time})`;
  chatMessagesDiv.appendChild(div);
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

// Lắng nghe tin nhắn mới từ Firebase (Cập nhật tự động trên cả Admin và Khách hàng)
db.ref("messages").on("child_added", function(snapshot) {
  const msg = snapshot.val();
  appendMessage(msg);
});
document.addEventListener("DOMContentLoaded", function () {
  var chatInput = document.getElementById("chatInput");
  var chatSend = document.getElementById("chatSend");
  var chatMessages = document.getElementById("chatMessages");

  var db = firebase.database().ref("messages");

  // Gửi tin nhắn lên Firebase
  chatSend.addEventListener("click", function () {
      var message = chatInput.value.trim();
      if (message !== "") {
          db.push({
              sender: "customer",
              text: message,
              timestamp: Date.now()
          });
          chatInput.value = ""; // Xóa nội dung ô nhập
      }
  });

  // Lắng nghe tin nhắn từ Firebase
  db.on("child_added", function (snapshot) {
      var msg = snapshot.val();
      var msgElement = document.createElement("div");
      msgElement.textContent = msg.sender === "customer" ? "Bạn: " + msg.text : "Admin: " + msg.text;
      chatMessages.appendChild(msgElement);
      chatMessages.scrollTop = chatMessages.scrollHeight; // Cuộn xuống tin mới nhất
  });
});

