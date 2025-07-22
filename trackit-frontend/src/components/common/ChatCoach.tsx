import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../../services/api';
import Button from './Button';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ChatCoach: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hi! I am your AI Wellness Coach. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/api/ai/chat', {
        message: input,
        history: messages,
      });
      setMessages((msgs) => [...msgs, { sender: 'ai', text: res.data.reply }]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: 'Sorry, I could not process your request.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat icon button */}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300 }}>
        <IconButton
          color="primary"
          size="large"
          onClick={() => setOpen(true)}
          sx={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '2px solid #6366f1',
            '&:hover': { background: '#f3f4f6' },
            width: 60,
            height: 60,
          }}
        >
          <SmartToyOutlinedIcon sx={{ fontSize: 36, color: '#6366f1' }} />
        </IconButton>
      </Box>
      {/* Centered chat modal */}
      {open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.10)',
            zIndex: 2000,
          }}
        >
          <Box
            sx={{
              background: '#fff',
              borderRadius: { xs: 0, sm: 4 },
              boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
              border: '1.5px solid #e5e7eb',
              width: { xs: '100vw', sm: 420 },
              height: { xs: '100vh', sm: 'auto' },
              minHeight: { xs: '100vh', sm: 600 },
              maxHeight: { xs: '100vh', sm: 700 },
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              p: 0,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2.5,
                borderBottom: '1.5px solid #e5e7eb',
                background: '#f5f6fa',
                borderTopLeftRadius: { xs: 0, sm: 16 },
                borderTopRightRadius: { xs: 0, sm: 16 },
                position: 'sticky',
                top: 0,
                zIndex: 20,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                AI Wellness Coach
              </Typography>
              <IconButton
                onClick={() => setOpen(false)}
                size="large"
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: { xs: 2, sm: 4 },
                background: '#f8fafc',
              }}
            >
              {messages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    flexDirection:
                      msg.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    mb: 2.5,
                    gap: 1.2,
                  }}
                >
                  {/* Avatar/Icon */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: msg.sender === 'user' ? '#6366f1' : '#e0e7ef',
                      color: msg.sender === 'user' ? '#fff' : '#6366f1',
                      borderRadius: '50%',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {msg.sender === 'user' ? (
                      <PersonIcon fontSize="small" />
                    ) : (
                      <SmartToyOutlinedIcon fontSize="small" />
                    )}
                  </Box>
                  {/* Message bubble */}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      background:
                        msg.sender === 'user'
                          ? 'linear-gradient(90deg,#6366f1 60%,#a5b4fc 100%)'
                          : '#f1f5f9',
                      color: msg.sender === 'user' ? '#fff' : '#222',
                      borderRadius: 3,
                      px: 2.2,
                      py: 1.3,
                      maxWidth: 320,
                      wordBreak: 'break-word',
                      fontSize: 15,
                      lineHeight: 1.7,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      textAlign: 'left',
                      border:
                        msg.sender === 'user'
                          ? '1.2px solid #6366f1'
                          : '1.2px solid #e0e7ef',
                    }}
                  >
                    {msg.sender === 'ai' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p style={{ margin: '0 0 10px 0' }} {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              style={{ margin: '0 0 10px 18px', padding: 0 }}
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li style={{ marginBottom: 6 }} {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            {/* Sticky input area */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) sendMessage();
              }}
              sx={{
                display: 'flex',
                gap: 1.5,
                p: 2.5,
                borderTop: '1.5px solid #e5e7eb',
                background: '#f5f6fa',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
              }}
            >
              <InputBase
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  background: '#fff',
                  px: 2.5,
                  py: 1.5,
                  fontSize: 17,
                  border: '1.5px solid #e5e7eb',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                disabled={loading}
                autoFocus
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                disabled={loading || !input.trim()}
                style={{ minWidth: 80, fontSize: 17, borderRadius: 3 }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Send'
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ChatCoach;
