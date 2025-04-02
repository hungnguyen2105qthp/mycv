var currentuser; // user hiện tại, biến toàn cục

window.onload = function () {
    khoiTao();

    // autocomplete cho khung tim kiem
    autocomplete(document.getElementById('search-box'), list_products);

    // thêm tags (từ khóa) vào khung tìm kiếm
    var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
    for (var t of tags) addTags(t, "index.html?search=" + t);

    currentuser = getCurrentUser();
    addProductToTable(currentuser);
}

function addProductToTable(user) {
    var table = document.getElementsByClassName('listSanPham')[0];

    var s = `
        <tbody>
            <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Thời gian</th>
                <th>Xóa</th>
            </tr>`;

    if (!user) {
        s += `
            <tr>
                <td colspan="7"> 
                    <h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
                        Bạn chưa đăng nhập !!
                    </h1> 
                </td>
            </tr>
        `;
        table.innerHTML = s;
        return;
    } else if (user.products.length == 0) {
        s += `
            <tr>
                <td colspan="7"> 
                    <h1 style="color:green; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
                        Giỏ hàng trống !!
                    </h1> 
                </td>
            </tr>
        `;
        table.innerHTML = s;
        return;
    }

    var totalPrice = 0;
    for (var i = 0; i < user.products.length; i++) {
        var masp = user.products[i].ma;
        var soluongSp = user.products[i].soluong;
        var p = timKiemTheoMa(list_products, masp);
        var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
        var thoigian = new Date(user.products[i].date).toLocaleString();
        var thanhtien = stringToNum(price) * soluongSp;

        s += `
            <tr>
                <td>` + (i + 1) + `</td>
                <td class="noPadding imgHide">
                    <a target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `" title="Xem chi tiết">
                        ` + p.name + `
                        <img src="` + p.img + `">
                    </a>
                </td>
                <td class="alignRight">` + price + ` ₫</td>
                <td class="soluong">
                    <button onclick="giamSoLuong('` + masp + `')"><i class="fa fa-minus"></i></button>
                    <input size="1" onchange="capNhatSoLuongFromInput(this, '` + masp + `')" value=` + soluongSp + `>
                    <button onclick="tangSoLuong('` + masp + `')"><i class="fa fa-plus"></i></button>
                </td>
                <td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
                <td style="text-align: center">` + thoigian + `</td>
                <td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(` + i + `)"></i> </td>
            </tr>
        `;
        totalPrice += thanhtien;
    }

    s += `
            <tr style="font-weight:bold; text-align:center">
                <td colspan="4">TỔNG TIỀN: </td>
                <td class="alignRight">` + numToString(totalPrice) + ` ₫</td>
                <td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
                <td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
            </tr>
        </tbody>
    `;

    table.innerHTML = s;
}

function xoaSanPhamTrongGioHang(i) {
    if (window.confirm('Xác nhận hủy mua')) {
        currentuser.products.splice(i, 1);
        capNhatMoiThu();
    }
}

function thanhToan() {
    var c_user = getCurrentUser();
    if (c_user.off) {
        alert('Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!');
        addAlertBox('Tài khoản của bạn đã bị khóa bởi Admin.', '#aa0000', '#fff', 10000);
        return;
    }
    
    if (!currentuser.products.length) {
        addAlertBox('Không có mặt hàng nào cần thanh toán !!', '#ffb400', '#fff', 2000);
        return;
    }
    
    // Tính tổng số tiền trong giỏ hàng
    var totalPrice = 0;
    for (var i = 0; i < currentuser.products.length; i++) {
        var masp = currentuser.products[i].ma;
        var soluongSp = currentuser.products[i].soluong;
        var p = timKiemTheoMa(list_products, masp);
        var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
        var thanhtien = stringToNum(price) * soluongSp;
        totalPrice += thanhtien;
    }
    
    // Lưu tổng tiền vào biến toàn cục để sử dụng cho bước sau
    window.totalPriceOrder = totalPrice;
    
    // Hiển thị modal nhập thông tin giao hàng
    document.getElementById('qrModal').style.display = 'flex';
    // Hiển thị form giao hàng, ẩn phần QR code
    document.getElementById('shippingForm').style.display = 'block';
    document.getElementById('qrSection').style.display = 'none';
}

// Hàm kiểm tra thông tin giao hàng và hiển thị lỗi nếu chưa nhập
function validateShippingInfo() {
    var valid = true;
    var nameField = document.getElementById('shipName');
    var phoneField = document.getElementById('shipPhone');
    var addressField = document.getElementById('shipAddress');

    // Xóa thông báo lỗi cũ
    document.getElementById('errorShipName').style.display = "none";
    document.getElementById('errorShipPhone').style.display = "none";
    document.getElementById('errorShipAddress').style.display = "none";
    nameField.classList.remove('input-error');
    phoneField.classList.remove('input-error');
    addressField.classList.remove('input-error');

    if(nameField.value.trim() === "") {
         document.getElementById('errorShipName').innerText = "Vui lòng nhập họ tên!";
         document.getElementById('errorShipName').style.display = "block";
         nameField.classList.add('input-error');
         valid = false;
    }
    if(phoneField.value.trim() === "") {
         document.getElementById('errorShipPhone').innerText = "Vui lòng nhập số điện thoại!";
         document.getElementById('errorShipPhone').style.display = "block";
         phoneField.classList.add('input-error');
         valid = false;
    }
    if(addressField.value.trim() === "") {
         document.getElementById('errorShipAddress').innerText = "Vui lòng nhập địa chỉ!";
         document.getElementById('errorShipAddress').style.display = "block";
         addressField.classList.add('input-error');
         valid = false;
    }
    return valid;
}

window.showQRModal = function(totalPrice) {
    var qrContainer = document.getElementById('qrCode');
    if (!qrContainer) {
         console.error("qrContainer not found");
         return;
    }
    document.getElementById('totalAmount').innerText = numToString(totalPrice);
    qrContainer.innerHTML = "";
    // Sử dụng chuỗi QR ngắn gọn
    var qrText = "TT:" + totalPrice.toString() + "VND";
    new QRCode(qrContainer, {
        text: qrText,
        width: 128,
        height: 128,
        correctLevel: QRCode.CorrectLevel.L
    });
    // Hiển thị phần QR code, ẩn form giao hàng
    document.getElementById('qrSection').style.display = 'block';
    document.getElementById('shippingForm').style.display = 'none';
};

window.closeQRModal = function() {
    document.getElementById('qrModal').style.display = 'none';
};

window.confirmPayment = function() {
    // Sau khi người dùng nhấn "Đã thanh toán", giỏ hàng sẽ được làm trống
    if (window.confirm('Xác nhận thanh toán giỏ hàng ?')) {
        currentuser.donhang.push({
            "sp": currentuser.products,
            "ngaymua": new Date(),
            "tinhTrang": 'Đang chờ xử lý',
            "shipping": currentuser.shippingInfo
        });
        // LÀM RỖNG GIỎ HÀNG
        currentuser.products = [];
        capNhatMoiThu();
        addAlertBox('Các sản phẩm đã được gửi vào đơn hàng và chờ xử lý.', '#17c671', '#fff', 4000);
    }
    window.closeQRModal();
};

window.proceedWithQR = function() {
    // Kiểm tra thông tin giao hàng bắt buộc nhập
    if(!validateShippingInfo()){
        return;
    }
    // Lấy thông tin giao hàng từ form
    var name = document.getElementById('shipName').value.trim();
    var phone = document.getElementById('shipPhone').value.trim();
    var address = document.getElementById('shipAddress').value.trim();
    currentuser.shippingInfo = { name: name, phone: phone, address: address };
    
    // Ẩn form giao hàng và hiển thị phần QR code
    document.getElementById('shippingForm').style.display = 'none';
    document.getElementById('qrSection').style.display = 'block';
    
    // Sử dụng totalPriceOrder đã lưu từ bước thanh toán
    var totalPrice = window.totalPriceOrder;
    document.getElementById('totalAmount').innerText = numToString(totalPrice);
    var qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = "";
    var qrText = "TT:" + totalPrice.toString() + "VND";
    new QRCode(qrContainer, {
        text: qrText,
        width: 128,
        height: 128,
        correctLevel: QRCode.CorrectLevel.L
    });
};

window.directPayment = function() {
    // Kiểm tra thông tin giao hàng bắt buộc nhập
    if(!validateShippingInfo()){
        return;
    }
    var name = document.getElementById('shipName').value.trim();
    var phone = document.getElementById('shipPhone').value.trim();
    var address = document.getElementById('shipAddress').value.trim();
    currentuser.shippingInfo = { name: name, phone: phone, address: address };
    if (window.confirm('Xác nhận thanh toán giỏ hàng trực tiếp?')) {
        currentuser.donhang.push({
            "sp": currentuser.products,
            "ngaymua": new Date(),
            "tinhTrang": 'Đang chờ xử lý',
            "shipping": currentuser.shippingInfo
        });
        currentuser.products = [];
        capNhatMoiThu();
        addAlertBox('Các sản phẩm đã được gửi vào đơn hàng và chờ xử lý.', '#17c671', '#fff', 4000);
    }
    window.closeQRModal();
};

function xoaHet() {
    if (currentuser.products.length) {
        if (window.confirm('Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!')) {
            currentuser.products = [];
            capNhatMoiThu();
        }
    }
}

// Cập nhật số lượng lúc nhập số lượng vào input
function capNhatSoLuongFromInput(inp, masp) {
    var soLuongMoi = Number(inp.value);
    if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;

    for (var p of currentuser.products) {
        if (p.ma == masp) {
            p.soluong = soLuongMoi;
        }
    }

    capNhatMoiThu();
}

function tangSoLuong(masp) {
    for (var p of currentuser.products) {
        if (p.ma == masp) {
            p.soluong++;
        }
    }

    capNhatMoiThu();
}

function giamSoLuong(masp) {
    for (var p of currentuser.products) {
        if (p.ma == masp) {
            if (p.soluong > 1) {
                p.soluong--;
            } else {
                return;
            }
        }
    }

    capNhatMoiThu();
}

function capNhatMoiThu() { // Mọi thứ
    animateCartNumber();

    // cập nhật danh sách sản phẩm trong localstorage
    setCurrentUser(currentuser);
    updateListUser(currentuser);

    // cập nhật danh sách sản phẩm ở table
    addProductToTable(currentuser);

    // Cập nhật trên header
    capNhat_ThongTin_CurrentUser();
}

