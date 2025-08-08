import React from 'react';
import { Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const VerifyEmailForgetNotice = () => {
  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '100px auto',
      backgroundColor: '#f0f2f5',
      padding: 24,
      textAlign: 'center',
      border: '1px solid #f0f0f0',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Title level={3}>Vui lòng xác thực email</Title>
      <Paragraph>
      Vui lòng kiểm tra hộp thư email của bạn và làm theo hướng dẫn để hoàn tất quá trình đặt lại mật khẩu.
      </Paragraph>
      <Button type="primary" size="large" onClick={openGmail} style={{ marginBottom: 16 }}>
        Mở Gmail để kiểm tra 
      </Button>
      <br />
      <Button type="link" href="/login">
        Quay lại trang đăng nhập
      </Button>
    </div>
  );
};

export default VerifyEmailForgetNotice;
