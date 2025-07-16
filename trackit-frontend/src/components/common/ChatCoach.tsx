import CloseIcon from '@mui/icons-material/Close';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';
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
      const res = await api.post('/ai/chat', {
        message: input,
        history: messages,
      });
      setMessages((msgs) => [...msgs, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
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
      {/* Sidebar chat drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 350,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              AI Wellness Coach
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, background: '#f9f9f9' }}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                  mb: 1.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    background: msg.sender === 'user' ? '#6366f1' : '#e0e7ff',
                    color: msg.sender === 'user' ? 'white' : '#3730a3',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    maxWidth: 220,
                    wordBreak: 'break-word',
                    fontSize: 15,
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) sendMessage();
            }}
            sx={{
              display: 'flex',
              gap: 1,
              p: 2,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <InputBase
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              sx={{
                flex: 1,
                borderRadius: 2,
                background: 'white',
                px: 2,
                py: 1,
                fontSize: 15,
                border: '1px solid #e5e7eb',
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
              style={{ minWidth: 70 }}
            >
              {loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                'Send'
              )}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatCoach;
