import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Vui lòng nhập địa chỉ email!');
      return;
    }

    setStatus('loading');
    
    try {
      // Gọi API Backend của bạn (thay đổi URL nếu cần)
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Một đường dẫn khôi phục mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.');
      } else {
        const errorData = await response.text();
        setStatus('error');
        setMessage(errorData || 'Email không tồn tại trong hệ thống hoặc có lỗi xảy ra.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f6f8',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>
          Quên mật khẩu?
        </h2>
        <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px', fontSize: '14px' }}>
          Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#27ae60', padding: '15px', backgroundColor: '#eafaf1', borderRadius: '4px', marginBottom: '20px' }}>
              {message}
            </div>
            <a href="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
              &larr; Quay lại trang đăng nhập
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#34495e', fontSize: '14px' }}>
                Địa chỉ Email
              </label>
              <input
                type="email"
                placeholder="Ví dụ: email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
              />
            </div>

            {status === 'error' && (
              <div style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '14px', padding: '10px', backgroundColor: '#fdedec', borderRadius: '4px' }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: status === 'loading' ? '#95a5a6' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: '0.3s'
              }}
            >
              {status === 'loading' ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a href="/login" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>
                Quay lại trang đăng nhập
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;  