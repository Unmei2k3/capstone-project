import errorimg from '../../assets/images/404error.jpg';
import { Row, Col, Typography, Button, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
function ErrorPage() {
    // Import useNavigate from react-router-dom

    const navigate = useNavigate();

    return (
        <Row
            justify="center"
            align="middle"
            style={{
                minHeight: '76vh',
                margin: 0,
                background: '#D4F1EF',
            }}
        >
            <Col>
                <Space direction="horizontal" size="large" align="center">
                    <img
                        src={errorimg}
                        alt="404 error"
                        style={{ maxWidth: 500, borderRadius: '50%' }}
                    />
                    <Space direction="vertical" size="large" align="center">
                        <Title level={2} style={{ margin: 0, color: '#222' }}>
                            OOPS...
                        </Title>
                        <Title level={1} style={{ margin: 0, color: '#222', fontSize: 72 }}>
                            404
                        </Title>
                        <Text style={{ fontSize: 20, color: '#555' }}>
                            KHÔNG TÌM THẤY TRANG
                        </Text>
                        <Text style={{ color: '#888' }}>
                            Trang bạn tìm kiếm không đúng hoặc không tồn tại!
                        </Text>
                        <Button
                            type="primary"
                            icon={<HomeOutlined />}
                            size="large"
                            onClick={() => navigate('/')}
                        >
                            Trở về trang chủ
                        </Button>
                    </Space>
                </Space>
            </Col>
        </Row>
    );
}

export default ErrorPage;