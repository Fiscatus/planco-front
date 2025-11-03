import {
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import type { Process } from '@/globals/types';

interface ProcessTableProps {
  processes: Process[];
  onProcessClick?: (process: Process) => void;
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'Alta':
      return { bg: '#FEE2E2', color: '#DC2626' };
    case 'Média':
      return { bg: '#FEF3C7', color: '#D97706' };
    case 'Baixa':
      return { bg: '#DBEAFE', color: '#2563EB' };
    default:
      return { bg: '#F3F4F6', color: '#6B7280' };
  }
};

const getModalityColor = (modality?: string) => {
  switch (modality) {
    case 'Concorrência':
      return { bg: '#F3E8FF', color: '#7C3AED' };
    case 'Dispensa':
      return { bg: '#D1FAE5', color: '#059669' };
    default:
      return { bg: '#F3F4F6', color: '#6B7280' };
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Em Andamento':
      return { bg: '#DBEAFE', color: '#2563EB' };
    case 'Em Atraso':
      return { bg: '#FEE2E2', color: '#DC2626' };
    case 'Concluído':
      return { bg: '#D1FAE5', color: '#059669' };
    default:
      return { bg: '#F3F4F6', color: '#6B7280' };
  }
};

export const ProcessTable = ({ processes, onProcessClick }: ProcessTableProps) => {
  const handleProcessClick = (process: Process) => {
    if (onProcessClick) {
      onProcessClick(process);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
          px: { xs: 0, md: 1 }
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 28,
            borderRadius: 1,
            backgroundColor: '#1877F2'
          }}
        />
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#0f172a'
          }}
        >
          {processes.length === 1 ? '1 Processo' : `${processes.length} Processos`}
        </Typography>
      </Box>

      <TableContainer
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          overflowX: 'auto'
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#f8fafc',
                '& th': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#475569',
                  borderBottom: '2px solid #e2e8f0',
                  py: 2
                }
              }}
            >
              <TableCell>Processo Nº</TableCell>
              <TableCell>Objeto</TableCell>
              <TableCell>Etapa Atual</TableCell>
              <TableCell>Modalidade</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell align='center'>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  sx={{
                    textAlign: 'center',
                    py: 6,
                    color: '#64748b'
                  }}
                >
                  Nenhum processo encontrado
                </TableCell>
              </TableRow>
            ) : (
              processes.map((process) => (
                <TableRow
                  key={process._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer'
                    },
                    '& td': {
                      py: 2.5,
                      borderBottom: '1px solid #f1f5f9'
                    }
                  }}
                >
                  <TableCell>
                    <Typography
                      onClick={() => handleProcessClick(process)}
                      sx={{
                        color: '#1877F2',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {process.processNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: '#0f172a',
                        fontSize: '0.875rem',
                        maxWidth: 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={process.object}
                    >
                      {process.object}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={process.currentStage || 'N/A'}
                      size='small'
                      sx={{
                        height: 28,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        borderRadius: 2
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={process.modality || 'N/A'}
                      size='small'
                      sx={{
                        height: 28,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderRadius: 2,
                        ...getModalityColor(process.modality)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={process.priority || 'N/A'}
                      size='small'
                      sx={{
                        height: 28,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderRadius: 2,
                        ...getPriorityColor(process.priority)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={process.status || 'N/A'}
                      size='small'
                      sx={{
                        height: 28,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderRadius: 2,
                        ...getStatusColor(process.status)
                      }}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title='Ver anexos'>
                        <IconButton
                          size='small'
                          sx={{
                            color: '#64748b',
                            '&:hover': {
                              backgroundColor: '#f1f5f9',
                              color: '#1877F2'
                            }
                          }}
                        >
                          <AttachFileIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Visualizar'>
                        <IconButton
                          size='small'
                          onClick={() => handleProcessClick(process)}
                          sx={{
                            color: '#64748b',
                            '&:hover': {
                              backgroundColor: '#f1f5f9',
                              color: '#1877F2'
                            }
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

