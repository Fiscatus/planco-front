import { useEffect, useRef, useState } from 'react';
import { Box, type BoxProps } from '@mui/material';

const RevealBox = ({ children, sx, ...props }: BoxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: 'opacity .6s ease, transform .6s ease',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export { RevealBox };
