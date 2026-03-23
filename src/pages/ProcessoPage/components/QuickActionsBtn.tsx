import { Box } from '@mui/material';

type Props = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick: () => void;
  isUrgent?: boolean;
};

const QuickActionsBtn = ({ title, subtitle, icon, onClick, isUrgent }: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        borderRadius: '12px',
        px: 1,
        py: 1,
        border: '0.5px solid rgba(125,125,125,0.1)',
        alignItems: 'center',
        cursor: 'pointer',
        minWidth: 300,
        '&:hover': {
          borderColor: isUrgent ? 'error.main' : 'primary.main'
        },
        backgroundColor: isUrgent ? 'rgba(255, 0, 0, 0.05)' : 'transparent'
      }}
      onClick={onClick}
    >
      <Box>{icon}</Box>
      <Box
        display='flex'
        flexDirection='column'
        gap={0.5}
      >
        <Box
          fontSize={14}
          fontWeight={500}
          color={isUrgent ? 'error.main' : 'text.primary'}
        >
          {title}
        </Box>
        {subtitle && (
          <Box
            fontSize={12}
            fontWeight={700}
            color={isUrgent ? 'error.main' : 'text.secondary'}
          >
            {subtitle}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export { QuickActionsBtn };
