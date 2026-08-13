import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Vui lòng nhập địa chỉ email!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Gọi API thực tế xuống Backend C#
      const response = await fetch('http://18.232.139.209:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      if (response.ok) {
        setMessage('Hướng dẫn khôi phục đã được gửi đến email của bạn.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.message || 'Email này không tồn tại hoặc có lỗi xảy ra.');
      }
    } catch (error) {
      setMessage('Lỗi kết nối đến máy chủ!');
      console.error("Lỗi gửi mail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f6f9',
      fontFamily: 'inherit'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px 30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2c3e50', margin: '0 0 10px 0', fontSize: '24px' }}>
          Quên mật khẩu?
        </h2>
        
        <p style={{ color: '#7f8c8d', fontSize: '14px', lineHeight: '1.5', marginBottom: '30px' }}>
          Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
            Địa chỉ Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nm358338@gmail.com"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #222',
              borderRadius: '4px',
              boxSizing: 'border-box',
              marginBottom: '20px'
            }}
          />

          {/* Khung hiển thị thông báo lỗi hoặc thành công */}
          {message && (
            <div style={{ 
              color: message.includes('Lỗi') || message.includes('Vui lòng') || message.includes('không tồn tại') ? '#e74c3c' : '#2ecc71', 
              fontSize: '13px', 
              marginBottom: '15px', 
              textAlign: 'center', 
              fontWeight: 'bold' 
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>

        <div style={{ marginTop: '25px' }}>
          <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>
            Quay lại trang đăng nhập
          </Link>
        </div>
        
      </div>
    </div>
  );
}