import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Result } from 'antd';
import { verifyEmailResetPassword } from '../../../../services/authService';


const VerifyEmailForgetAuto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  useEffect(() => {
    async function verify() {
      const params = new URLSearchParams(location.search);
      const c = params.get('c');
      const email = params.get('email');
      if (c && email) {
        const payload = { email, c };
        try {
          const result = await verifyEmailResetPassword(payload);
          if (result && result.token && result.email) {
            setStatus('success');
            setMessage('Xác thực thành công!' );
            setTimeout(() => {
              navigate('/login/new-password', { state: { token: result.token, email: result.email } });
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Xác thực thất bại!');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } catch (error) {
          setStatus('error');
          setMessage('Xác thực thất bại!');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage('Thiếu mã xác thực!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    }
    verify();
  }, [location.search, navigate]);


  if (status === 'pending') {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 24, fontSize: 18 }}>Đang xác thực email, vui lòng chờ...</div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <Result
        status="success"
        title={message}
        subTitle="Vui lòng chờ, bạn sẽ được chuyển tới trang đăng nhập."
      />
    );
  }

  return (
    <Result
      status="error"
      title={message}
      subTitle={"Đường dẫn xác thực không hợp lệ hoặc đã hết hạn, vui lòng thử lại."}
    />
  );
};

export default VerifyEmailForgetAuto;
