import {
  CloseOutlined,
  CloseFullscreenOutlined,
  HeadphonesOutlined,
  MinimizeOutlined,
  OpenInFullOutlined,
  SendOutlined,
  SmartToyOutlined,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Collapse,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { playNotificationSound } from '@/hooks/useNotificationPrefs';
import { useAuth } from '@/hooks/useAuth';
import logo from '/assets/isologo.svg';

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const BOT_WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: 'Olá! 👋 Sou o assistente do Planco. O chat de suporte está em desenvolvimento e em breve você poderá falar com nossa equipe diretamente por aqui. Por enquanto, entre em contato pelo e-mail suporte@planco.com.br.',
  timestamp: new Date(),
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const SupportChat = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeSent = useRef(false);

  useEffect(() => {
    if (open && !welcomeSent.current) {
      welcomeSent.current = true;
      setBotTyping(true);
      setTimeout(() => {
        setMessages([BOT_WELCOME]);
        setBotTyping(false);
        playNotificationSound();
      }, 800);
    }
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Ao restaurar do minimizado, foca o input
  useEffect(() => {
    if (!minimized) setTimeout(() => inputRef.current?.focus(), 300);
  }, [minimized]);

  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping, minimized]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // ── Aqui será integrada a API do bot ──
    // const botReply = await api.post('/support/chat', { message: text });
    // setMessages(prev => [...prev, { role: 'bot', text: botReply.data.text, ... }]);

    setBotTyping(true);
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'bot',
        text: 'Obrigado pela mensagem! 🚧 O suporte via chat ainda está em desenvolvimento. Em breve nossa equipe poderá responder por aqui.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setBotTyping(false);
      playNotificationSound();
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const chatWidth = expanded ? 560 : 360;
  const userInitials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <Collapse
      in={open}
      timeout={250}
      unmountOnExit
      sx={{ position: 'fixed', bottom: 0, right: 24, zIndex: 1300 }}
    >
      <Paper
        elevation={8}
        sx={{
          width: chatWidth,
          borderRadius: '12px 12px 0 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
          borderBottom: 'none',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.14)',
          transition: 'width 0.25s ease, height 0.25s ease',
        }}
      >
        {/* ── Header — sempre visível ── */}
        <Box
          sx={{
            px: 2, py: 1.5, bgcolor: '#1877F2',
            display: 'flex', alignItems: 'center', gap: 1.5,
            cursor: minimized ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          onClick={() => { if (minimized) setMinimized(false); }}
        >
          <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={logo} alt='Planco' style={{ width: 20, height: 20, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff', lineHeight: 1.2 }}>
              Suporte Planco
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80' }} />
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                {minimized ? 'Clique para restaurar' : 'Em desenvolvimento'}
              </Typography>
            </Box>
          </Box>

          {/* Botões — param propagação para não restaurar ao clicar neles */}
          <Box sx={{ display: 'flex', gap: 0.25 }} onClick={e => e.stopPropagation()}>
            {!minimized && (
              <Tooltip title={expanded ? 'Reduzir' : 'Expandir'}>
                <IconButton size='small' onClick={() => setExpanded(v => !v)} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  {expanded ? <CloseFullscreenOutlined sx={{ fontSize: 15 }} /> : <OpenInFullOutlined sx={{ fontSize: 15 }} />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={minimized ? 'Restaurar' : 'Minimizar'}>
              <IconButton size='small' onClick={() => setMinimized(v => !v)} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <MinimizeOutlined sx={{ fontSize: 15, mb: minimized ? 0 : '-4px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Fechar'>
              <IconButton size='small' onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <CloseOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── Corpo — oculto quando minimizado ── */}
        <Collapse in={!minimized} timeout={200}>
          {/* Mensagens */}
          <Box sx={{ height: expanded ? 560 : 400, overflowY: 'auto', px: 2, py: 1.5, bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 1.5, transition: 'height 0.25s ease' }}>
            {messages.length === 0 && !botTyping && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1.5, color: '#94a3b8' }}>
                <HeadphonesOutlined sx={{ fontSize: 48 }} />
                <Typography sx={{ fontSize: '0.875rem', textAlign: 'center' }}>Iniciando conversa...</Typography>
              </Box>
            )}

            {messages.map(msg => (
              <Box key={msg.id} sx={{ display: 'flex', gap: 1, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {msg.role === 'bot' ? (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#1877F2', flexShrink: 0 }}>
                    <SmartToyOutlined sx={{ fontSize: 16 }} />
                  </Avatar>
                ) : (
                  <Avatar src={user?.avatarUrl ?? undefined} sx={{ width: 28, height: 28, bgcolor: '#7C3AED', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                    {!user?.avatarUrl && userInitials}
                  </Avatar>
                )}
                <Box sx={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 0.25 }}>
                  <Box sx={{ px: 1.5, py: 1, borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', bgcolor: msg.role === 'user' ? '#1877F2' : '#fff', border: msg.role === 'bot' ? '1px solid #e2e8f0' : 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                    <Typography sx={{ fontSize: '0.8125rem', color: msg.role === 'user' ? '#fff' : '#0f172a', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.text}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', px: 0.5 }}>{formatTime(msg.timestamp)}</Typography>
                </Box>
              </Box>
            ))}

            {botTyping && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#1877F2', flexShrink: 0 }}>
                  <SmartToyOutlined sx={{ fontSize: 16 }} />
                </Avatar>
                <Box sx={{ px: 1.5, py: 1, borderRadius: '12px 12px 12px 2px', bgcolor: '#fff', border: '1px solid #e2e8f0', display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#94a3b8', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </Box>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box sx={{ px: 1.5, py: 1.25, borderTop: '1px solid #e2e8f0', bgcolor: '#fff', display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <InputBase
              inputRef={inputRef}
              multiline maxRows={3} fullWidth
              placeholder='Digite sua mensagem...'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ fontSize: '0.875rem', px: 1.5, py: 0.75, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid #e2e8f0', '&:focus-within': { borderColor: '#1877F2' } }}
            />
            <IconButton onClick={sendMessage} disabled={!input.trim()}
              sx={{ bgcolor: '#1877F2', color: '#fff', width: 36, height: 36, borderRadius: 2, flexShrink: 0, '&:hover': { bgcolor: '#1565C0' }, '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' } }}>
              <SendOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Collapse>
      </Paper>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </Collapse>
  );
};
