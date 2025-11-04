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
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import type { Process } from '@/globals/types';

interface ProcessTableProps {
  processes: Process[];
  onProcessClick?: (process: Process) => void;
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'Alta':
      return { bg: '#FDE8EC', color: '#B81E34', fontWeight: 700 };
    case 'Média':
      return { bg: '#FFF5D6', color: '#B38800', fontWeight: 600 };
    case 'Baixa':
      return { bg: '#E7F3FF', color: '#1877F2', fontWeight: 600 };
    default:
      return { bg: '#F3F4F6', color: '#6B7280', fontWeight: 600 };
  }
};

const getModalityColor = (modality?: string) => {
  switch (modality) {
    case 'Pregão Eletrônico':
      return { bg: '#E7F3FF', color: '#105BBE' };
    case 'Pregão Presencial':
      return { bg: '#E8F5FE', color: '#1877F2' };
    case 'Dispensa de Licitação':
      return { bg: '#E6F4EA', color: '#1F7A37' };
    case 'Concorrência':
      return { bg: '#EEE8FD', color: '#5A3DBE' };
    case 'Inexigibilidade':
    case 'Inexigibilidade de Licitação':
      return { bg: '#FFF5D6', color: '#B38800' };
    case 'Concurso':
      return { bg: '#E8F5FE', color: '#105BBE' };
    case 'Leilão':
      return { bg: '#E8F5FE', color: '#105BBE' };
    case 'Diálogo Competitivo':
      return { bg: '#E7F3FF', color: '#105BBE' };
    case 'Pregão':
    case 'Dispensa':
    case 'Tomada de Preços':
      return { bg: '#E6F4EA', color: '#1F7A37' };
    default:
      return { bg: '#F0F2F5', color: '#3A3B3C' };
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Em Andamento':
      return { bg: '#E7F3FF', color: '#105BBE', fontWeight: 700 };
    case 'Pendente':
      return { bg: '#FFF5D6', color: '#B38800', fontWeight: 700 };
    case 'Em Atraso':
      return { bg: '#FDE8EC', color: '#B81E34', fontWeight: 700 };
    case 'Concluído':
      return { bg: '#E6F4EA', color: '#1F7A37', fontWeight: 700 };
    case 'Cancelado':
      return { bg: '#F0F2F5', color: '#616161', fontWeight: 600 };
    default:
      return { bg: '#F3F4F6', color: '#6B7280', fontWeight: 600 };
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
          gap: 1.25,
          mb: 2
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 24,
            borderRadius: '6px',
            backgroundColor: '#1877F2'
          }}
        />
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            fontSize: '20px',
            color: '#212121'
          }}
        >
          {processes.length === 1 ? '1 Processo' : `${processes.length} Processos`}
        </Typography>
      </Box>

      <TableContainer
        sx={{
          borderRadius: '16px',
          border: '1px solid #E4E6EB',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF'
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(to bottom, #F7F9FC 0%, #F3F6FA 100%)',
                '& th': {
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  color: '#212121',
                  borderBottom: '1px solid #E4E6EB',
                  py: 1.75,
                  px: { xs: 1.5, md: 2.5 }
                }
              }}
            >
              <TableCell>Processo Nº</TableCell>
              <TableCell>Objeto</TableCell>
              <TableCell>Etapa Atual</TableCell>
              <TableCell>Modalidade</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell align='right'>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 4
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      padding: '64px 16px'
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(180deg, #F7F9FB 0%, #E4E6EB 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 40, color: '#9CA3AF' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 600,
                          fontSize: '20px',
                          color: '#212121',
                          mb: 1
                        }}
                      >
                        Nenhum processo encontrado
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#8A8D91',
                          maxWidth: '448px'
                        }}
                      >
                        Tente ajustar os filtros ou criar um novo processo
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              processes.map((process, index) => (
                <TableRow
                  key={process._id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                    borderBottom: '1px solid #E4E6EB',
                    borderTop: index === 0 ? '1px solid #E4E6EB' : 'none',
                    '&:hover': {
                      backgroundColor: '#E7F3FF',
                      boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                      cursor: 'pointer'
                    },
                    transition: 'all 200ms ease-in-out',
                    '& td': {
                      py: 1.75,
                      px: { xs: 1.5, md: 2.5 }
                    }
                  }}
                >
                  <TableCell>
                    <Typography
                      component='span'
                      onClick={() => handleProcessClick(process)}
                      sx={{
                        color: '#1877F2',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        lineHeight: 1.5,
                        '&:hover': {
                          color: '#105BBE',
                          textDecoration: 'underline'
                        },
                        '&:focus': {
                          outline: '2px solid rgba(24, 119, 242, 0.25)',
                          outlineOffset: '4px',
                          borderRadius: '4px'
                        }
                      }}
                    >
                      {process.processNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title={process.object} 
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: '#212121',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            maxWidth: '400px'
                          }
                        }
                      }}
                    >
                      <Typography
                        component='span'
                        sx={{
                          color: '#212121',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          maxWidth: { xs: 200, md: 400 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'help',
                          display: 'block'
                        }}
                      >
                        {process.object}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={process.currentStage || 'N/A'}
                      size='small'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#FFFFFF',
                        color: '#3A3B3C',
                        border: '1px solid #E4E6EB',
                        boxShadow: 'none'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={process.modality || 'N/A'}
                      size='small'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                        boxShadow: 'none',
                        ...getModalityColor(process.modality)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={process.priority || 'N/A'}
                      size='small'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        whiteSpace: 'nowrap',
                        boxShadow: 'none',
                        ...getPriorityColor(process.priority)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        label={process.status || 'N/A'}
                        size='small'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          whiteSpace: 'nowrap',
                          boxShadow: 'none',
                          ...getStatusColor(process.status)
                        }}
                      />
                      {(process.status === 'Em Atraso' || process.status === 'Atrasado') && (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(184, 30, 52, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 1px 2px rgba(184, 30, 52, 0.2))',
                            animation: 'pulseAlert 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            '@keyframes pulseAlert': {
                              '0%, 100%': {
                                opacity: 1,
                                transform: 'scale(1)'
                              },
                              '50%': {
                                opacity: 0.7,
                                transform: 'scale(1.05)'
                              }
                            }
                          }}
                        >
                          <ErrorOutlineIcon sx={{ fontSize: 16, color: '#B81E34', strokeWidth: 2.5 }} />
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align='right'>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip
                        title='Ver anexos'
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: '#212121',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '12px'
                            }
                          }
                        }}
                      >
                        <IconButton
                          size='small'
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '999px',
                            backgroundColor: 'transparent',
                            color: '#8A8D91',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(24, 119, 242, 0.08)',
                              color: '#1877F2'
                            },
                            '&:focus': {
                              outline: '2px solid rgba(24, 119, 242, 0.25)',
                              outlineOffset: '2px'
                            },
                            '& svg': {
                              fontSize: 16
                            }
                          }}
                        >
                          <AttachFileIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title='Visualizar'
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: '#212121',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '12px'
                            }
                          }
                        }}
                      >
                        <IconButton
                          size='small'
                          onClick={() => handleProcessClick(process)}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '999px',
                            backgroundColor: 'transparent',
                            color: '#8A8D91',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(24, 119, 242, 0.08)',
                              color: '#1877F2'
                            },
                            '&:focus': {
                              outline: '2px solid rgba(24, 119, 242, 0.25)',
                              outlineOffset: '2px'
                            },
                            '& svg': {
                              fontSize: 16
                            }
                          }}
                        >
                          <VisibilityIcon />
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

