import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography
} from '@mui/material';

import { Settings } from '@mui/icons-material';
import { useState } from 'react';

const RolesSection = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [availablePermissions] = useState<string[]>([
    // MOCK: substitua por dados do backend
    'user.read',
    'user.delete',
    'user.edit',
    'role.read',
    'role.edit',
    'role.delete',
    'admin'
  ]);

  // TODO: requisição deve vir aqui (listar roles, criar, editar, excluir)

  return (
    <Card>
      <CardHeader
        title={<Typography variant='h6'>Roles e Permissões</Typography>}
        subheader='Gerencie as roles e suas permissões'
        action={
          <Button
            startIcon={<Settings />}
            onClick={() => setOpenCreate(true)}
            sx={{ textTransform: 'none' }}
          >
            Nova Role
          </Button>
        }
      />
      <CardContent>
        {/* TODO: listagem de roles com chips de permissões */}
        <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 2, color: 'text.secondary' }}>
          Lista de roles vai aqui
        </Box>
      </CardContent>

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Criar Nova Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label='Nome da Role'
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
            <Box>
              <Typography
                variant='subtitle2'
                sx={{ mb: 1, color: 'text.secondary' }}
              >
                Permissões
              </Typography>
              {Object.entries(
                availablePermissions.reduce<Record<string, string[]>>((acc, perm) => {
                  const [prefix, action] = perm.includes('.') ? perm.split('.') : ['GERAL', perm];
                  const group = prefix.toUpperCase();
                  if (!acc[group]) acc[group] = [];
                  acc[group].push(action);
                  return acc;
                }, {})
              ).map(([group, actions]) => (
                <Box
                  key={group}
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    variant='caption'
                    sx={{ fontWeight: 600, color: 'text.secondary' }}
                  >
                    {group}:
                  </Typography>
                  <FormGroup row>
                    {actions.map((action) => {
                      const fullKey = group === 'GERAL' ? action : `${group.toLowerCase()}.${action}`;
                      return (
                        <FormControlLabel
                          key={fullKey}
                          control={
                            <Checkbox
                              checked={permissions.includes(fullKey)}
                              onChange={(e) => {
                                if (e.target.checked) setPermissions([...permissions, fullKey]);
                                else setPermissions(permissions.filter((p) => p !== fullKey));
                              }}
                            />
                          }
                          label={action}
                        />
                      );
                    })}
                  </FormGroup>
                </Box>
              ))}
            </Box>
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
            sx={{ textTransform: 'none' }}
          >
            Criar Role
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export { RolesSection };
