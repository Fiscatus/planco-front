import { createContext, useContext, useState, type ReactNode } from 'react';
import { SupportChat } from '@/components/SupportChat';

type SupportChatContextType = {
  openChat: () => void;
  closeChat: () => void;
};

const SupportChatContext = createContext<SupportChatContextType>({
  openChat: () => {},
  closeChat: () => {},
});

export const SupportChatProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <SupportChatContext.Provider value={{ openChat: () => setOpen(true), closeChat: () => setOpen(false) }}>
      {children}
      <SupportChat open={open} onClose={() => setOpen(false)} />
    </SupportChatContext.Provider>
  );
};

export const useSupportChat = () => useContext(SupportChatContext);
