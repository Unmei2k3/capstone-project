import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Badge, Tooltip, message } from 'antd';
import {
    SendOutlined,
    CloseOutlined,
    RobotOutlined,
    UserOutlined,
    CommentOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import './ChatBot.scss';

// ✅ Import chatbot service
import {
    createChatBotSession,
    sendMessage as sendChatMessage,
    sendFirstMessage,
    extractTextFromResponse,
    generateSessionId
} from '../../services/chatbotService';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Xin chào! Tôi là DABS Assistant - Trợ lý đặt khám thông minh. Tôi có thể giúp bạn đặt lịch khám bệnh, tìm bác sĩ phù hợp và trả lời các câu hỏi về y tế. Bạn cần hỗ trợ gì hôm nay?',
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isFirstMessage, setIsFirstMessage] = useState(true);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // ✅ Get userId from Redux store
    const user = useSelector((state) => state.user?.user);
    const accessToken = useSelector((state) => state.user?.accessToken || state.auth?.accessToken);

    const userId = user?.id || `guest_${Date.now()}`;


    // ✅ Initialize chat session when component mounts
    useEffect(() => {
        if (userId && userId !== `guest_${Date.now()}` && accessToken) {
            initializeChatSession();
        }
    }, [userId, accessToken]);

    // ✅ Initialize chat session using chatbotService
    const initializeChatSession = async () => {
        if (isInitializing) return;

        setIsInitializing(true);

        try {
            console.log('🔄 Initializing chat session for user:', userId);
            console.log('🔑 Using access token:', accessToken ? 'Available' : 'Not available');

            // Generate unique session ID
            const newSessionId = generateSessionId();

            // ✅ Use accessToken as patient_token
            const sessionResult = await createChatBotSession(newSessionId, userId, accessToken);

            console.log('✅ Session created:', sessionResult);
            setSessionId(newSessionId);
            setIsFirstMessage(true);

            message.success('Đã kết nối với trợ lý AI!');

        } catch (error) {
            console.error('❌ Error initializing chat session:', error);
            message.error('Không thể kết nối với trợ lý AI. Vui lòng thử lại.');
            setSessionId(null);
        } finally {
            setIsInitializing(false);
        }
    };

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Focus vào input khi mở chat
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset số tin nhắn chưa đọc khi mở chat
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && input.trim() && !isLoading) {
            sendMessage();
        }
    };


    // ✅ Simplified sendMessage in ChatBot component
    const sendMessage = async () => {
        if (!input.trim() || isLoading || !sessionId || !accessToken) {
            if (!accessToken) {
                message.error('Vui lòng đăng nhập để sử dụng trợ lý AI');
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

            // ✅ Simplified - no need for user profile or first message logic
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

            // Update unread count if chat is closed
            if (!isOpen) {
                setUnreadCount(prev => prev + 1);
            }

        } catch (error) {
            console.error('❌ Error sending message:', error);

            const errorMessageObj = {
                type: 'bot',
                content: 'Xin lỗi, có lỗi xảy ra khi kết nối với trợ lý AI. Vui lòng thử lại sau.',
                time: new Date()
            };

            setMessages(prev => [...prev, errorMessageObj]);
            message.error('Lỗi kết nối API. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Function to start new chat session
    const startNewSession = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Starting new session...');

            // Generate new session ID
            const newSessionId = generateSessionId();

            // Create new session
            const sessionResult = await createChatBotSession(newSessionId, userId, accessToken);

            setSessionId(newSessionId);
            setIsFirstMessage(true);

            // Reset messages with welcome message
            setMessages([{
                type: 'bot',
                content: `Xin chào! Tôi là DABS Assistant - Trợ lý đặt khám thông minh được hỗ trợ bởi AI.

🏥 Tôi có thể giúp bạn:
• Đặt lịch khám bệnh theo chuyên khoa
• Tìm bác sĩ phù hợp với triệu chứng
• Tư vấn quy trình khám chữa bệnh
• Hướng dẫn chuẩn bị trước khi khám
• Giải đáp thắc mắc về y tế

Hãy cho tôi biết bạn cần hỗ trợ gì hôm nay!`,
                time: new Date()
            }]);

            message.success('Đã tạo phiên chat mới với trợ lý AI!');
            console.log('✅ New session started:', newSessionId);

        } catch (error) {
            console.error('❌ Error creating new session:', error);
            message.error('Không thể tạo phiên chat mới. Vui lòng thử lại.');
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
        if (!sessionId) return { status: 'error', text: 'Chưa kết nối' };
        return { status: 'success', text: 'Trực tuyến với AI' };
    };

    const sessionStatus = getSessionStatus();

    return (
        <div className="chat-bot-container">
            {/* Nút mở chat */}
            <Button
                type="primary"
                shape="circle"
                size="large"
                className="chat-toggle-button"
                onClick={toggleChat}
                icon={
                    isOpen ? (
                        <CloseOutlined />
                    ) : (
                        <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                            <CommentOutlined />
                        </Badge>
                    )
                }
            />

            {/* Cửa sổ chat */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-title">
                            <Avatar icon={<RobotOutlined />} className="bot-avatar" />
                            <div className="header-info">
                                <div className="bot-name">DABS Assistant</div>
                                <div className="bot-status">
                                    <Badge status={sessionStatus.status} />
                                    <span>{sessionStatus.text}</span>
                                </div>
                            </div>
                        </div>
                        <div className="header-actions">
                            {/* Session info button */}
                            <Tooltip title="Thông tin phiên chat">
                                <Button
                                    type="text"
                                    icon={<CommentOutlined />}
                                    onClick={() => {
                                        message.info(`Session ID: ${sessionId || 'N/A'}\nTrạng thái: ${sessionStatus.text}`);
                                    }}
                                    size="small"
                                />
                            </Tooltip>
                            {/* New session button */}
                            <Tooltip title="Tạo phiên chat mới">
                                <Button
                                    type="text"
                                    icon={<RobotOutlined />}
                                    onClick={startNewSession}
                                    disabled={isLoading || isInitializing}
                                    size="small"
                                />
                            </Tooltip>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={toggleChat}
                                className="close-button"
                            />
                        </div>
                    </div>

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
                                        size="small"
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
                                        size="small"
                                    />
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {(isLoading || isInitializing) && (
                            <div className="message bot-message">
                                <Avatar
                                    icon={<RobotOutlined />}
                                    className="message-avatar"
                                    size="small"
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
                                        !sessionId ? "Chưa kết nối với AI..." :
                                            "Nhập tin nhắn về y tế, đặt khám..."
                            }
                            value={input}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading || isInitializing || !sessionId}
                            suffix={
                                <Tooltip title="Gửi">
                                    <Button
                                        type="primary"
                                        icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                                        onClick={sendMessage}
                                        disabled={!input.trim() || isLoading || isInitializing || !sessionId}
                                        className="send-button"
                                        loading={isLoading}
                                    />
                                </Tooltip>
                            }
                            ref={inputRef}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;