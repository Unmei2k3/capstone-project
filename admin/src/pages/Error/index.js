import errorimg from '../../assets/images/404error.jpg';
import { Row, Col, Typography, Button, Space, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { clearMessage } from '../../redux/slices/messageSlice';

const { Title, Text } = Typography;
function ErrorPage() {

    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const { accessToken, isInitializing, user } = useSelector((state) => state.user);
    console.log("user role is : " + JSON.stringify(user?.role));
    const messageState = useSelector((state) => state.message)
    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,

            });
            dispatch(clearMessage());
        }
    }, [messageState, dispatch]);
    return (
        <>
            {contextHolder}
            <Row
                justify="center"
                align="middle"
                style={{
                    height: '100vh',
                    margin: 0,
                    background: '#D4F1EF',
                }}
            >
                <Col>
                    <Space direction="horizontal" size="large" align="center">
                        <img
                            src={errorimg}
                            alt="404 error"
                            style={{ borderRadius: '50%' }}
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
                            <Space direction="horizontal" size="middle" style={{ marginTop: 20, justifyContent: 'center', display: 'flex' }}>
                                <Button
                                    type="primary"
                                    icon={<HomeOutlined />}
                                    size="large"
                                    onClick={() => navigate('/')}
                                >
                                    Trở về trang chủ
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate(-1)}
                                >
                                    Quay lại trang trước
                                </Button>
                            </Space>
                        </Space>
                    </Space>
                </Col>
            </Row>
        </>
    );
}

export default ErrorPage;