// SAMURAI_JAPANESE_APP - Backend Server
// Chức năng: Xử lý Đăng ký và Xác thực Email với GỬI EMAIL THẬT (Sử dụng Nodemailer)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer'); // <--- 1. IMPORT NODEMAILER

const app = express();
const PORT = 3001; // Port cho Backend

// --- KHAI BÁO THÔNG TIN EMAIL CỦA BẠN (CẦN THAY THẾ DỮ LIỆU THỰC TẾ) ---
// Thay thế bằng địa chỉ Gmail bạn muốn dùng để gửi thư
const SENDER_EMAIL = 'nhanah895@gmail.com'; 
// Thay thế bằng Mật khẩu Ứng dụng 16 ký tự bạn đã tạo
const SENDER_PASSWORD = 'qezw inur bhmb vopl'; 
// -----------------------------------------------------------------------


// Tạo Transporter cho Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Sử dụng Gmail
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
    },
});

/**
 * Hàm gửi email xác thực thực tế
 * @param {string} toEmail - Địa chỉ email người nhận
 * @param {string} name - Tên người nhận
 * @param {string} correctCode - Mã xác thực đúng
 * @param {string[]} options - 4 mã code để người dùng chọn
 */
const sendVerificationEmail = async (toEmail, name, correctCode, options) => {
    const mailOptions = {
        from: `"SAMURAI JAPANESE APP" <${SENDER_EMAIL}>`,
        to: toEmail,
        subject: 'Mã Xác thực Đăng ký Tài khoản của bạn',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; max-width: 600px; margin: auto;">
                <h2 style="color: #4f46e5; text-align: center;">Xác Nhận Tài Khoản Cần Thiết</h2>
                <p>Xin chào ${name},</p>
                <p>Để hoàn tất đăng ký tài khoản tại SAMURAI JAPANESE APP, chúng tôi đã gửi tổng cộng 4 mã code đến màn hình đăng ký của bạn.</p>
                
                <p style="font-size: 1.1em;">Vui lòng kiểm tra email này, tìm **MÃ XÁC THỰC CHÍNH XÁC** và nhập nó vào form đăng ký.</p>
                
                <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #93c5fd;">
                    <p style="font-size: 1.1em; font-weight: bold; color: #1e40af;">MÃ XÁC THỰC CHÍNH XÁC (Mã bạn cần nhập) LÀ:</p>
                    <h3 style="color: #10b981; font-size: 2.2em; text-align: center; margin: 10px 0; letter-spacing: 3px;">${correctCode}</h3>
                </div>

                <p style="font-size: 0.9em; color: #6b7280;">
                    Lưu ý: Mã code này sẽ hết hạn sau 5 phút. Các mã khác bạn có thể thấy trên màn hình là: 
                    <span style="font-weight: bold;">${options.join(', ')}</span>.
                </p>
                <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br>Đội ngũ SAMURAI JAPANESE APP</p>
            </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[GỬI EMAIL THẬT] Message sent: %s`, info.messageId);
};


// --- Cấu hình Middleware ---
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
}));
app.use(bodyParser.json());

// --- Cấu trúc dữ liệu tạm thời để lưu mã xác thực ---
// Lưu trữ: { email: { correctCode: '123456', options: ['123456', '789012', '345678', '901234'] } }
const verificationCodesStore = {};

/**
 * Hàm tạo một mã ngẫu nhiên 6 chữ số
 * @returns {string} Mã ngẫu nhiên 6 chữ số
 */
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// --- ENDPOINT 1: Khởi tạo quy trình xác thực ---
// Đã thay đổi thành async function
app.post('/api/register-start-verification', async (req, res) => { 
    const { name, email, phone, password } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Thiếu email để xác thực.' });
    }

    // 1. Tạo Mã Xác thực Chính xác và 3 mã giả
    const correctCode = generateCode();
    const options = [correctCode];
    while (options.length < 4) {
        const dummyCode = generateCode();
        if (!options.includes(dummyCode)) {
            options.push(dummyCode);
        }
    }
    options.sort(() => Math.random() - 0.5);

    // 2. Lưu trữ mã đúng vào bộ nhớ tạm thời (TTL 5 phút)
    verificationCodesStore[email] = {
        correctCode: correctCode,
        options: options, // Lưu cả 4 mã để gửi về frontend
        user: { name, phone, password }, // Lưu tạm thông tin người dùng
        timestamp: Date.now(),
    };

    // 3. THAY THẾ MÔ PHỎNG BẰNG CHỨC NĂNG GỬI EMAIL THẬT
    try {
        await sendVerificationEmail(email, name, correctCode, options);
        
        // 4. Trả về cho Frontend 4 mã để hiển thị trong giao diện
        res.status(200).json({ 
            success: true, 
            message: 'Đã gửi mã xác thực đến email. Vui lòng kiểm tra hộp thư.',
            codes: options, // Gửi 4 mã code để hiển thị trên UI
        });

    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        // Trả về lỗi nếu gửi email thất bại
        return res.status(500).json({ 
            success: false, 
            message: 'Không thể gửi email xác thực. Vui lòng kiểm tra địa chỉ email và cấu hình server.', 
            error: error.message 
        });
    }
});

// --- ENDPOINT 2: Xác thực mã người dùng nhập vào (Giữ nguyên) ---
app.post('/api/verify-code', (req, res) => {
    const { email, code } = req.body;

    const data = verificationCodesStore[email];

    // 1. Kiểm tra tồn tại và thời hạn
    if (!data) {
        return res.status(404).json({ success: false, message: 'Phiên xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng ký lại.' });
    }

    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - data.timestamp > fiveMinutes) {
        delete verificationCodesStore[email];
        return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại.' });
    }

    // 2. Kiểm tra mã
    if (code === data.correctCode) {
        // Mã đúng!
        
        // --- THAO TÁC ĐĂNG KÝ THỰC TẾ (Lưu vào DB) ---
        console.log(`[ĐĂNG KÝ HOÀN TẤT] Email: ${email} đã được xác thực và lưu vào CSDL.`);
        // Ví dụ: saveUserToDatabase(data.user);
        
        // Xóa mã khỏi bộ nhớ tạm
        delete verificationCodesStore[email];

        return res.status(200).json({ success: true, message: 'Xác thực thành công! Tài khoản đã được tạo.' });
    } else {
        // Mã sai
        return res.status(400).json({ success: false, message: 'Mã xác thực không đúng. Vui lòng kiểm tra email và thử lại.' });
    }
});

// --- Khởi động Server ---
app.listen(PORT, () => {
    console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
});

// Để chạy: node backend/server.js
