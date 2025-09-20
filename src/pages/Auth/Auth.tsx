import { Box, Button, Container, FormControl, Grid, InputBase } from '@mui/material';
import { useState } from 'react';
import CreateAccount from './components/CreateAccount';
import SignIn from './components/SignIn';

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
          sx={{
            bgcolor: 'red'
          }}
        >
          {isSignIn ? <SignIn setIsSignIn={setIsSignIn} /> : <CreateAccount setIsSignIn={setIsSignIn} />}
        </Grid>
        <Grid
          size={{ xs: 8, sm: 8, md: 4, lg: 4, xl: 4 }}
          sx={{
            bgcolor: 'blue',
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
              backgroundPosition: 'center'
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Auth;
