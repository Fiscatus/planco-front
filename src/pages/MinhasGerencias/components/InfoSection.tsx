import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Typography
} from '@mui/material';

import type { Department } from '@/globals/types';
import {
  Edit as EditIcon
} from '@mui/icons-material';

interface InfoSectionProps {
  gerencia: Department | null;
  canEdit?: boolean;
  onEdit?: () => void;
}

export const InfoSection = ({ gerencia, canEdit = true, onEdit }: InfoSectionProps) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
        height: 'fit-content'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Box sx={{ mb: 1 }}>
              {gerencia?.department_acronym && (
                <Chip
                  size='small'
                  label={gerencia.department_acronym}
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 1,
                    mb: 1
                  }}
                />
              )}
              <Typography
                variant='h4'
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {gerencia ? gerencia.department_name : 'Minha Gerência'}
              </Typography>
            </Box>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              Informações da sua gerência
            </Typography>
          </Box>
          {canEdit && gerencia && (
            <Button
              variant='outlined'
              size='small'
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{
                textTransform: 'none',
                borderRadius: 6,
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              Editar
            </Button>
          )}
        </Box>

        {gerencia ? (
          <Grid
            container
            spacing={3}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant='body2'
                fontWeight={500}
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                E-mail do departamento
              </Typography>
              <Typography variant='body2'>
                {gerencia.deparment_email || 'Não informado'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant='body2'
                fontWeight={500}
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                Responsável gerência
              </Typography>
              <Typography variant='body2'>{gerencia.email_owner}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant='body2'
                fontWeight={500}
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                Telefone
              </Typography>
              <Typography variant='body2'>
                {gerencia.department_phone || 'Não informado'}
              </Typography>
            </Grid>
            {gerencia.description && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant='body2'
                  fontWeight={500}
                  color='text.secondary'
                  sx={{ mb: 0.5 }}
                >
                  Descrição
                </Typography>
                <Typography variant='body2'>{gerencia.description}</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <Alert severity='info'>Carregando informações da gerência...</Alert>
        )}
      </Box>
    </Card>
  );
};
