import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatus('error');
      setMessage('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setStatus('error');
      setMessage('Vui lòng nhập đầy đủ mật khẩu!');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setStatus('loading');

    try {
      // Gọi API Backend của bạn (thay đổi URL nếu cần)
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      } else {
        const errorData = await response.text();
        setStatus('error');
        setMessage(errorData || 'Liên kết đã hết hạn hoặc có lỗi xảy ra. Vui lòng thử lại.');
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
          Đặt lại mật khẩu
        </h2>
        <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px', fontSize: '14px' }}>
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#27ae60', padding: '15px', backgroundColor: '#eafaf1', borderRadius: '4px', marginBottom: '20px' }}>
              {message}
            </div>
            <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
              &larr; Quay lại trang đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!token && (
              <div style={{ color: '#e74c3c', marginBottom: '20px', fontSize: '14px', padding: '10px', backgroundColor: '#fdedec', borderRadius: '4px' }}>
                Liên kết không hợp lệ. Vui lòng kiểm tra lại email của bạn.
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#34495e', fontSize: '14px' }}>
                Mật khẩu mới
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={status === 'loading' || !token}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#34495e', fontSize: '14px' }}>
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={status === 'loading' || !token}
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
              disabled={status === 'loading' || !token}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: (status === 'loading' || !token) ? '#95a5a6' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (status === 'loading' || !token) ? 'not-allowed' : 'pointer',
                transition: '0.3s'
              }}
            >
              {status === 'loading' ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>
                Quay lại trang đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;