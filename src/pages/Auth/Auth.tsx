import { Box } from '@mui/material';
import { useState } from 'react';
import { AuthSplitLayout } from '@/components/auth';
import CreateAccount from './components/CreateAccount';
import RegistrationSuccess from './components/RegistrationSuccess';
import SignIn from './components/SignIn';

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleBackToLogin = () => {
    if (registrationSuccess) setRegistrationSuccess(false);
    setIsSignIn(true);
  };

  // Login: sem slot no topo. Demais telas: link "← Já tenho conta"
  const topRightSlot = isSignIn ? null : (
    <Box
      component='button'
      type='button'
      onClick={handleBackToLogin}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        p: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '0.8125rem',
        color: '#6B7280',
        transition: 'color 0.15s ease',
        '&:hover': { color: '#0B1220' }
      }}
    >
      <Box
        component='svg'
        width={15}
        height={15}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M19 12H5M12 19l-7-7 7-7' />
      </Box>
      Já tenho conta
    </Box>
  );

  // CreateAccount usa maxWidth 480; Login e RegistrationSuccess usam o default 440
  const formMaxWidth = !registrationSuccess && !isSignIn ? 480 : 440;

  return (
    <AuthSplitLayout
      topRightSlot={topRightSlot}
      formMaxWidth={formMaxWidth}
    >
      {registrationSuccess ? (
        <RegistrationSuccess
          email={registeredEmail}
          setIsSignIn={setIsSignIn}
          setRegistrationSuccess={setRegistrationSuccess}
        />
      ) : isSignIn ? (
        <SignIn setIsSignIn={setIsSignIn} />
      ) : (
        <CreateAccount
          setIsSignIn={setIsSignIn}
          setRegistrationSuccess={setRegistrationSuccess}
          setRegisteredEmail={setRegisteredEmail}
        />
      )}
    </AuthSplitLayout>
  );
};

export default Auth;
