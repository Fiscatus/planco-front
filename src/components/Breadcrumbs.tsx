import { Box, Link, Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();

  const path = location.pathname
    .replace('faqs', 'frequently asked questions')
    .split('/')
    .filter((route) => route !== '');
  const routes = [
    { href: '/', label: 'Home' },
    ...path.map((path, index, array) => ({
      href: `/${array.slice(0, index + 1).join('/')}`,
      label: path.charAt(0).toUpperCase() + path.slice(1).replaceAll('-', ' ')
    }))
  ];

  return (
    <Box
      sx={{
        paddingBottom: 3
      }}
    >
      <MuiBreadcrumbs aria-label='breadcrumb'>
        {routes.map(({ href, label }, index, array) =>
          index !== array.length - 1 ? (
            <Link
              component={RouterLink}
              key={label.replace(/\s/g, '-')}
              underline='hover'
              color='inherit'
              to={href}
              sx={{ fontSize: 14 }}
            >
              {label}
            </Link>
          ) : (
            <Typography
              key={label.replace(/\s/g, '-')}
              sx={{
                color: 'text.primary',
                fontSize: 14
              }}
            >
              {label}
            </Typography>
          )
        )}
      </MuiBreadcrumbs>
    </Box>
  );
};

export { Breadcrumbs };
