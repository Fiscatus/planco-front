import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';

import { PersonAdd } from '@mui/icons-material';
import { useState } from 'react';

const InvitesSection = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<{ _id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ _id: string; email: string; name?: string }[]>([]);
  const [gerenciaId, setGerenciaId] = useState('');
  const [gerencias, setGerencias] = useState<{ _id: string; name: string }[]>([]);

  // TODO: requisição deve vir aqui (listar convites, criar convites, copiar link)
  // TODO: carregar roles disponíveis e setar via setRoles
  // TODO: carregar usuários existentes e setar via setUsers (apenas emails válidos)
  // TODO: carregar gerências disponíveis e setar via setGerencias

  return (
    <Card>
      <CardHeader
        title={<Typography variant='h6'>Convites</Typography>}
        subheader='Gerencie os convites para novos usuários'
        action={
          <Button
            startIcon={<PersonAdd />}
            onClick={() => setOpenCreate(true)}
            sx={{ textTransform: 'none' }}
          >
            Novo Convite
          </Button>
        }
      />
      <CardContent>
        {/* TODO: tabela de convites */}
        <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 2, color: 'text.secondary' }}>
          Tabela de convites vai aqui
        </Box>
      </CardContent>

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Criar Novo Convite</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Select
              value={roleId}
              onChange={(e) => setRoleId(String(e.target.value))}
              displayEmpty
              fullWidth
            >
              <MenuItem value=''>
                <em>Selecione uma role</em>
              </MenuItem>
              {roles.map((r) => (
                <MenuItem
                  key={r._id}
                  value={r._id}
                >
                  {r.name}
                </MenuItem>
              ))}
            </Select>
            <Autocomplete
              options={users.map((u) => u.email)}
              value={email}
              onChange={(_e, v) => setEmail(v || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Email (obrigatório)'
                  required
                  error={!email}
                  helperText={!email ? 'Selecione um email existente' : ''}
                />
              )}
            />
            {/* Seleção de gerência (opcional) */}
            <Select
              value={gerenciaId}
              onChange={(e) => setGerenciaId(String(e.target.value))}
              displayEmpty
              fullWidth
            >
              <MenuItem value=''>
                <em>Selecione uma gerência (opcional)</em>
              </MenuItem>
              {gerencias.map((g) => (
                <MenuItem
                  key={g._id}
                  value={g._id}
                >
                  {g.name}
                </MenuItem>
              ))}
            </Select>
            {/* TODO: validar email no backend antes de criar convite */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={() => setOpenCreate(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => setOpenCreate(false)}
            disabled={!roleId || !email}
            sx={{ textTransform: 'none' }}
          >
            Criar Convite
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export { InvitesSection };
