import { Box, Button, Container, FormControl, Grid, InputBase } from '@mui/material';

import CreateAccount from './components/CreateAccount';
import SignIn from './components/SignIn';
import { useState } from 'react';

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100vh'
      }}
    >
      <Grid
        container
        columns={8}
        sx={{
          margin: '0 auto',
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <Grid
          size={{ xs: 8, sm: 8, md: 4, lg: 4, xl: 4 }}
        >
          {isSignIn ? <SignIn setIsSignIn={setIsSignIn} /> : <CreateAccount setIsSignIn={setIsSignIn} />}
        </Grid>
        <Grid
          size={{ xs: 8, sm: 8, md: 4, lg: 4, xl: 4 }}
          sx={{
            width: '100%',
            height: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, hsl(262 83% 65%), hsl(224 71% 65%))',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Auth;
