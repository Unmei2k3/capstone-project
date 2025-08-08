import React, { useState, useRef, useEffect } from 'react';
import { Layout, Typography, Row, Col, Button, Input, Avatar, Badge, Card, Divider, message as antMessage } from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    QuestionCircleOutlined,
    ClockCircleOutlined,
    BookOutlined,
    HeartOutlined,
    LoadingOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import './ChatPage.scss';

// ✅ Import chatbot service
import { 
    createChatBotSession, 
    sendMessage as sendChatMessage,
    extractTextFromResponse,
    generateSessionId 
} from '../../services/chatbotService';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ChatPage = () => {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Xin chào! Tôi là DABS Assistant - Trợ lý đặt khám thông minh được hỗ trợ bởi AI. Tôi có thể giúp bạn đặt lịch khám bệnh, tìm bác sĩ phù hợp và trả lời các câu hỏi về y tế. Bạn cần hỗ trợ gì hôm nay?',
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // ✅ Get user and token from Redux store
    const user = useSelector((state) => state.user?.user || state.auth?.user);
    const accessToken = useSelector((state) => state.user?.accessToken || state.auth?.accessToken);
    const userId = user?.id || `guest_${Date.now()}`;

    // ✅ Initialize chat session when component mounts
    useEffect(() => {
        if (userId && userId !== `guest_${Date.now()}` && accessToken) {
            initializeChatSession();
        }
    }, [userId, accessToken]);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Focus vào input khi trang được load
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // ✅ Initialize chat session using chatbotService
    const initializeChatSession = async () => {
        if (isInitializing) return;

        setIsInitializing(true);

        try {
            console.log('🔄 Initializing chat session for user:', userId);

            // Generate unique session ID
            const newSessionId = generateSessionId();
            
            // Create session using chatbotService
            const sessionResult = await createChatBotSession(newSessionId, userId, accessToken);
            
            console.log('✅ Session created:', sessionResult);
            setSessionId(newSessionId);
            
            antMessage.success('Đã kết nối với trợ lý AI!');

        } catch (error) {
            console.error('❌ Error initializing chat session:', error);
            antMessage.error('Không thể kết nối với trợ lý AI. Vui lòng thử lại.');
            setSessionId(null);
        } finally {
            setIsInitializing(false);
        }
    };

    // ✅ Function to start new chat session
    const startNewSession = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Starting new session...');

            if (!accessToken) {
                antMessage.error('Vui lòng đăng nhập để sử dụng trợ lý AI');
                return;
            }

            // Generate new session ID
            const newSessionId = generateSessionId();
            
            // Create new session
            const sessionResult = await createChatBotSession(newSessionId, userId, accessToken);
            
            setSessionId(newSessionId);

            // Reset messages with welcome message
            setMessages([{
                type: 'bot',
                content: `Xin chào ${user?.fullName || user?.name || 'bạn'}! Tôi là DABS Assistant - Trợ lý đặt khám thông minh được hỗ trợ bởi AI.

🏥 Tôi có thể giúp bạn:
• Đặt lịch khám bệnh theo chuyên khoa
• Tìm bác sĩ phù hợp với triệu chứng
• Tư vấn quy trình khám chữa bệnh
• Hướng dẫn chuẩn bị trước khi khám
• Giải đáp thắc mắc về y tế

Hãy cho tôi biết bạn cần hỗ trợ gì hôm nay!`,
                time: new Date()
            }]);

            antMessage.success('Đã tạo phiên chat mới với trợ lý AI!');
            console.log('✅ New session started:', newSessionId);

        } catch (error) {
            console.error('❌ Error creating new session:', error);
            antMessage.error('Không thể tạo phiên chat mới. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && input.trim() && !isLoading) {
            sendMessage();
        }
    };

    // ✅ Enhanced sendMessage using chatbotService
    const sendMessage = async () => {
        if (!input.trim() || isLoading || !sessionId || !accessToken) {
            if (!accessToken) {
                antMessage.error('Vui lòng đăng nhập để sử dụng trợ lý AI');
            }
            return;
        }

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        // Thêm tin nhắn của người dùng ngay lập tức
        const userMessageObj = {
            type: 'user',
            content: userMessage,
            time: new Date()
        };

        setMessages(prev => [...prev, userMessageObj]);

        try {
            console.log('🔄 Sending message to ADK agent...');

            // ✅ Send message to API
            const response = await sendChatMessage(sessionId, userId, userMessage);

            console.log('✅ Raw response from API:', response);

            // ✅ Extract text from response using helper function
            const botResponseText = extractTextFromResponse(response);
            
            console.log('✅ Bot response text:', botResponseText);

            // ✅ Add bot response to messages
            const botMessageObj = {
                type: 'bot',
                content: botResponseText || 'Tôi đã nhận được tin nhắn của bạn nhưng không thể tạo phản hồi phù hợp.',
                time: new Date()
            };

            setMessages(prev => [...prev, botMessageObj]);

        } catch (error) {
            console.error('❌ Error sending message:', error);
            
            const errorMessageObj = {
                type: 'bot',
                content: 'Xin lỗi, có lỗi xảy ra khi kết nối với trợ lý AI. Vui lòng thử lại sau.',
                time: new Date()
            };

            setMessages(prev => [...prev, errorMessageObj]);
            antMessage.error('Lỗi kết nối API. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Handle suggested question click
    const handleSuggestedQuestion = async (questionText) => {
        if (!sessionId || !accessToken) {
            antMessage.error('Vui lòng đăng nhập để sử dụng trợ lý AI');
            return;
        }

        setInput('');
        setIsLoading(true);

        // Thêm tin nhắn của người dùng
        const userMessageObj = {
            type: 'user',
            content: questionText,
            time: new Date()
        };

        setMessages(prev => [...prev, userMessageObj]);

        try {
            // Send to API
            const response = await sendChatMessage(sessionId, userId, questionText);
            const botResponseText = extractTextFromResponse(response);
            
            // Add bot response
            const botMessageObj = {
                type: 'bot',
                content: botResponseText || 'Tôi đã nhận được câu hỏi của bạn nhưng không thể tạo phản hồi phù hợp.',
                time: new Date()
            };

            setMessages(prev => [...prev, botMessageObj]);

        } catch (error) {
            console.error('❌ Error sending suggested question:', error);
            
            const errorMessageObj = {
                type: 'bot',
                content: 'Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại sau.',
                time: new Date()
            };

            setMessages(prev => [...prev, errorMessageObj]);
            antMessage.error('Lỗi kết nối API. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format timestamp
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ✅ Get session status
    const getSessionStatus = () => {
        if (isInitializing) return { status: 'processing', text: 'Đang kết nối...' };
        if (!accessToken) return { status: 'warning', text: 'Chưa đăng nhập' };
        if (!sessionId) return { status: 'error', text: 'Chưa kết nối' };
        return { status: 'success', text: 'Trực tuyến với AI' };
    };

    const sessionStatus = getSessionStatus();

    // Danh sách câu hỏi gợi ý
    const suggestedQuestions = [
        { icon: <QuestionCircleOutlined />, text: 'Cách đặt lịch khám?' },
        { icon: <ClockCircleOutlined />, text: 'Giờ làm việc?' },
        { icon: <BookOutlined />, text: 'Có những chuyên khoa nào?' },
        { icon: <HeartOutlined />, text: 'Làm thế nào để tạo hồ sơ bệnh nhân?' },
    ];

    return (
        <Content className="chat-page-container">
            <Row gutter={[24, 24]}>
                <Col xs={24} md={16} lg={16} className="chat-main-col">
                    <Card className="chat-card">
                        <div className="chat-header">
                            <Avatar icon={<RobotOutlined />} className="bot-avatar" size={42} />
                            <div className="header-info">
                                <Title level={4} className="bot-name">DABS Assistant</Title>
                                <div className="bot-status">
                                    <Badge status={sessionStatus.status} />
                                    <span>{sessionStatus.text}</span>
                                </div>
                            </div>
                            {/* ✅ Add new session button */}
                            <div className="header-actions">
                                <Button
                                    type="text"
                                    icon={<ReloadOutlined />}
                                    onClick={startNewSession}
                                    disabled={isLoading || isInitializing}
                                    loading={isLoading}
                                    title="Tạo phiên chat mới"
                                />
                            </div>
                        </div>

                        <Divider className="chat-divider" />

                        <div className="chat-messages">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
                                >
                                    {message.type === 'bot' && (
                                        <Avatar
                                            icon={<RobotOutlined />}
                                            className="message-avatar"
                                            size="default"
                                        />
                                    )}

                                    <div className="message-content">
                                        <div className="message-bubble">
                                            {message.content}
                                        </div>
                                        <div className="message-time">
                                            {formatTime(message.time)}
                                        </div>
                                    </div>

                                    {message.type === 'user' && (
                                        <Avatar
                                            icon={<UserOutlined />}
                                            className="message-avatar"
                                            size="default"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* ✅ Loading indicator */}
                            {(isLoading || isInitializing) && (
                                <div className="message bot-message">
                                    <Avatar
                                        icon={<RobotOutlined />}
                                        className="message-avatar"
                                        size="default"
                                    />
                                    <div className="message-content">
                                        <div className="message-bubble loading">
                                            <LoadingOutlined /> {isInitializing ? 'Đang kết nối trợ lý AI...' : 'Đang xử lý...'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input">
                            <Input
                                placeholder={
                                    isLoading ? "Đang xử lý..." : 
                                    isInitializing ? "Đang kết nối..." : 
                                    !accessToken ? "Vui lòng đăng nhập để sử dụng AI..." :
                                    !sessionId ? "Chưa kết nối với AI..." :
                                    "Nhập câu hỏi về y tế, đặt khám..."
                                }
                                value={input}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                size="large"
                                ref={inputRef}
                                disabled={isLoading || isInitializing || !sessionId || !accessToken}
                                suffix={
                                    <Button
                                        type="primary"
                                        icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                                        onClick={sendMessage}
                                        disabled={!input.trim() || isLoading || isInitializing || !sessionId || !accessToken}
                                        className="send-button"
                                        loading={isLoading}
                                    >
                                        Gửi
                                    </Button>
                                }
                            />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={8} lg={8}>
                    <Card className="info-card">
                        <Title level={4}>Hỏi đáp y tế với AI</Title>
                        <Paragraph>
                            Trợ lý ảo DABS Assistant được hỗ trợ bởi AI có thể giúp bạn trả lời các câu hỏi về dịch vụ y tế,
                            đặt khám và thông tin về bác sĩ tại hệ thống DABS.
                        </Paragraph>

                        {/* ✅ Session info */}
                        {sessionId && (
                            <div className="session-info">
                                <small style={{ color: '#666' }}>
                                    Session ID: {sessionId.slice(-8)}...
                                </small>
                            </div>
                        )}

                        <Divider />

                        <div className="suggested-questions">
                            <Title level={5}>Câu hỏi thường gặp</Title>
                            {suggestedQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    className="question-button"
                                    icon={question.icon}
                                    onClick={() => handleSuggestedQuestion(question.text)}
                                    disabled={isLoading || isInitializing || !sessionId || !accessToken}
                                    loading={isLoading}
                                >
                                    {question.text}
                                </Button>
                            ))}
                        </div>

                        <Divider />

                        <div className="contact-info">
                            <Title level={5}>Cần hỗ trợ thêm?</Title>
                            <Paragraph>
                                Vui lòng liên hệ với chúng tôi qua hotline: <strong>1900 1234</strong>
                                <br />
                                hoặc email: <strong>contact@dabs.com.vn</strong>
                            </Paragraph>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Content>
    );
};

export default ChatPage;