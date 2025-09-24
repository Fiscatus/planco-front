import { Box, Card, CardContent, CardHeader, MenuItem, Select, TextField, Typography } from '@mui/material';

import Grid from '@mui/material/Grid';
import { useState } from 'react';

const UserSection = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [gerencia, setGerencia] = useState<string>('todas');

  // TODO: requisição deve vir aqui (listar usuários, filtros, etc.)

  return (
    <Card>
      <CardHeader
        title={<Typography variant='h6'>Usuários da Organização</Typography>}
        subheader='Gerencie os usuários e suas permissões'
      />
      <CardContent>
        <Grid
          container
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Grid
            item
            xs={12}
            md={6}
          >
            <TextField
              fullWidth
              placeholder='Buscar por nome, email ou gerência'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
          >
            <Select
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <MenuItem value='todos'>Todos</MenuItem>
              <MenuItem value='ativos'>Ativos</MenuItem>
              <MenuItem value='inativos'>Inativos</MenuItem>
            </Select>
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
          >
            <Select
              fullWidth
              value={gerencia}
              onChange={(e) => setGerencia(e.target.value)}
            >
              <MenuItem value='todas'>Todas as Gerências</MenuItem>
              {/* TODO: preencher opções via API */}
            </Select>
          </Grid>
        </Grid>

        {/* TODO: tabela de usuários (MUI DataGrid ou Table) */}
        <Box
          sx={{
            border: '1px solid #e5e7eb',
            borderRadius: 1,
            p: 2,
            color: 'text.secondary'
          }}
        >
          Tabela de usuários vai aqui
        </Box>
      </CardContent>
    </Card>
  );
};

export { UserSection };
