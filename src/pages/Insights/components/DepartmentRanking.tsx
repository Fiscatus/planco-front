import { OpenInNewOutlined, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { DepartmentSummary } from '@/globals/types/Insights';
import { useDebounce } from '@/hooks';
import { useDepartmentTable } from '@/hooks/useDepartmentTable';

type Props = {
  onSelect: (dept: DepartmentSummary) => void;
};

export const DepartmentRanking = ({ onSelect }: Props) => {
  const [localSearch, setLocalSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebounce(localSearch, 400);
  const isFirstRender = useRef(true);

  // Reseta para página 1 quando a busca muda, mas não na montagem
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useDepartmentTable({
    search: debouncedSearch || undefined,
    page,
    limit
  });

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
      <CardHeader
        title={<Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Ranking de Gerências</Typography>}
        subheader={
          <Typography variant='body2' color='text.secondary'>
            {total} gerência{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
          </Typography>
        }
        action={
          <Box sx={{ position: 'relative', mt: 0.5 }}>
            <SearchIcon sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary', fontSize: 20, zIndex: 1 }} />
            <TextField
              size='small'
              placeholder='Buscar gerência...'
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              sx={{
                width: 220,
                '& .MuiOutlinedInput-root': {
                  pl: 4.5,
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  height: 40,
                  '& fieldset': { borderColor: 'divider', borderWidth: 1.5 },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                }
              }}
            />
          </Box>
        }
        sx={{ '& .MuiCardHeader-action': { alignSelf: 'center', mt: 0 } }}
      />
      <CardContent sx={{ pt: 0 }}>
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Table size='medium' stickyHeader>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: '#f8fafc', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', borderBottom: '2px solid #e5e7eb' } }}>
                <TableCell>Gerência</TableCell>
                <TableCell>Sigla</TableCell>
                <TableCell align='center'>Total</TableCell>
                <TableCell align='center'>Em Andamento</TableCell>
                <TableCell align='center'>Concluídos</TableCell>
                <TableCell align='center'>Em Atraso</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton variant='text' /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 5, backgroundColor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body1' color='text.secondary' fontWeight={500}>Nenhuma gerência encontrada</Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>Tente ajustar o filtro de busca</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((dept) => (
                  <TableRow
                    key={dept.departmentId}
                    onClick={() => onSelect(dept)}
                    sx={{
                      cursor: 'pointer',
                      opacity: isFetching ? 0.6 : 1,
                      transition: 'opacity 0.15s',
                      '& .MuiTableCell-root': { borderBottom: '1px solid #f1f5f9', py: 1.5 },
                      '&:hover': { backgroundColor: '#EBF3FF' }
                    }}
                  >
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>{dept.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='caption' sx={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', px: 1, py: 0.25, borderRadius: 1, color: 'text.secondary' }}>
                        {dept.acronym}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2' fontWeight={500}>{dept.total}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2'>{dept.inProgress}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2' sx={{ color: 'success.main' }}>{dept.concluded}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2' sx={{ color: dept.overdue > 0 ? 'error.main' : 'text.primary', fontWeight: dept.overdue > 0 ? 700 : 400 }}>
                        {dept.overdue}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Ver detalhes'>
                        <IconButton size='small' onClick={(e) => { e.stopPropagation(); onSelect(dept); }} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', backgroundColor: '#E7F3FF' } }}>
                          <OpenInNewOutlined fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, px: 1 }}>
          <Typography variant='body2' sx={{ color: '#6b7280', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isFetching && <CircularProgress size={12} />}
            {total > 0 ? `${from}–${to} de ${total}` : '0 de 0'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              sx={{ minWidth: 130, height: 32, fontSize: '0.875rem' }}
            >
              {[5, 10, 20, 50].map((l) => (
                <MenuItem key={l} value={l} sx={{ '&:hover': { backgroundColor: '#f8fafc' }, '&.Mui-selected': { backgroundColor: '#f1f5f9' } }}>
                  {l} por página
                </MenuItem>
              ))}
            </Select>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              variant='outlined'
              shape='rounded'
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
