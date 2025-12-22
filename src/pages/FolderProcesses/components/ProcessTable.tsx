import {
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  SwapVert as SwapVertIcon,
  Visibility as VisibilityIcon,
  WarningOutlined as WarningIcon
} from '@mui/icons-material';
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
import { useMemo, useState } from 'react';
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleProcessClick = (process: Process) => {
    if (onProcessClick) {
      onProcessClick(process);
    }
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedProcesses = useMemo(() => {
    if (!processes || processes.length === 0) return processes;

    return [...processes].sort((a, b) => {
      const aValue = a.processNumber || '';
      const bValue = b.processNumber || '';

      // Separar número e ano (formato: "001/2025")
      const parseProcessNumber = (processNumber: string) => {
        const parts = processNumber.split('/');
        if (parts.length === 2) {
          const number = parseInt(parts[0], 10) || 0;
          const year = parseInt(parts[1], 10) || 0;
          return { number, year, original: processNumber };
        }
        return { number: 0, year: 0, original: processNumber };
      };

      const aParsed = parseProcessNumber(aValue);
      const bParsed = parseProcessNumber(bValue);

      // Primeiro ordenar por ano, depois por número
      if (sortOrder === 'asc') {
        if (aParsed.year !== bParsed.year) {
          return aParsed.year - bParsed.year;
        }
        if (aParsed.number !== bParsed.number) {
          return aParsed.number - bParsed.number;
        }
        return aParsed.original.localeCompare(bParsed.original);
      } else {
        if (aParsed.year !== bParsed.year) {
          return bParsed.year - aParsed.year;
        }
        if (aParsed.number !== bParsed.number) {
          return bParsed.number - aParsed.number;
        }
        return bParsed.original.localeCompare(aParsed.original);
      }
    });
  }, [processes, sortOrder]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.25 },
          mb: { xs: 1.5, sm: 2 }
        }}
      >
        <Box
          sx={{
            width: { xs: 4, sm: 6 },
            height: { xs: 20, sm: 24 },
            borderRadius: '6px',
            backgroundColor: '#1877F2',
            flexShrink: 0
          }}
        />
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            fontSize: { xs: '16px', sm: '18px', md: '20px' },
            color: '#212121'
          }}
        >
          {sortedProcesses.length === 1 ? '1 Processo' : `${sortedProcesses.length} Processos`}
        </Typography>
      </Box>

      <TableContainer
        sx={{
          borderRadius: { xs: '12px', sm: '16px' },
          border: '1px solid #E4E6EB',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF',
          mb: { xs: 2, sm: 3 },
          '&::-webkit-scrollbar': {
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F7F9FB',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D1D5DB',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#9CA3AF'
            }
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(to bottom, #F7F9FC 0%, #F3F6FA 100%)',
                '& th': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#212121',
                  borderBottom: '1px solid #E4E6EB',
                  py: 2,
                  px: { xs: 1.5, md: 2.5 },
                  verticalAlign: 'middle'
                }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography
                    component='span'
                    sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    Processo
                  </Typography>
                  <Tooltip
                    title={sortOrder === 'asc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
                    arrow
                    placement='top'
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: '#212121',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          padding: '6px 12px',
                          borderRadius: '8px'
                        }
                      },
                      arrow: {
                        sx: {
                          color: '#212121'
                        }
                      }
                    }}
                  >
                    <IconButton
                      size='small'
                      onClick={handleSortToggle}
                      sx={{
                        p: 0.5,
                        borderRadius: '8px',
                        flexShrink: 0,
                        transition: 'all 200ms ease',
                        '&:hover': {
                          '& .sort-icon': {
                            color: '#1877F2',
                            transform: 'scale(1.1)'
                          }
                        },
                        '&:focus': {
                          outline: '2px solid rgba(24, 119, 242, 0.25)',
                          outlineOffset: '2px'
                        }
                      }}
                    >
                      <SwapVertIcon
                        className='sort-icon'
                        sx={{
                          fontSize: '14px',
                          color: '#8A8D91',
                          transition: 'transform 200ms ease, color 200ms ease'
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ minWidth: { xs: 200, sm: 300, md: 400, lg: 500 } }}>Objeto</TableCell>
              <TableCell>Etapa Atual</TableCell>
              <TableCell>Modalidade</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell>Visualizar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProcesses.length === 0 ? (
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
              sortedProcesses.map((process, index) => (
                <TableRow
                  key={process._id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                    borderBottom: '1px solid #E4E6EB',
                    borderTop: index === 0 ? '1px solid #E4E6EB' : 'none',
                    '&:hover': {
                      backgroundColor: '#E7F3FF',
                      boxShadow: '0 2px 6px rgba(16, 24, 40, 0.06)',
                      cursor: 'pointer',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 200ms ease-in-out',
                    '& td': {
                      py: 2,
                      px: { xs: 1.5, md: 2.5 },
                      verticalAlign: 'middle'
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
                        fontSize: '1rem',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        lineHeight: 1.5,
                        display: 'inline-block',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: '#105BBE',
                          textDecoration: 'underline',
                          transform: 'translateX(2px)'
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
                  <TableCell sx={{ minWidth: { xs: 200, sm: 300, md: 400, lg: 500 } }}>
                    <Tooltip
                      title={process.object}
                      arrow
                      placement='top'
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: '#212121',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            maxWidth: '600px',
                            padding: '8px 12px',
                            borderRadius: '8px'
                          }
                        },
                        arrow: {
                          sx: {
                            color: '#212121'
                          }
                        }
                      }}
                    >
                      <Typography
                        component='span'
                        sx={{
                          color: '#212121',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                          maxWidth: { xs: 300, sm: 500, md: 600, lg: 700 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'help',
                          display: 'block',
                          transition: 'color 0.2s ease',
                          '&:hover': {
                            color: '#105BBE'
                          }
                        }}
                      >
                        {process.object}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Chip
                        label={process.currentStage || 'N/A'}
                        size='small'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#FFFFFF',
                          color: '#3A3B3C',
                          border: '1px solid #E4E6EB',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          height: '28px',
                          minWidth: 'fit-content',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: '#D1D5DB',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Chip
                        label={process.modality || 'N/A'}
                        size='small'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#FFFFFF',
                          color: '#3A3B3C',
                          border: '1px solid #E4E6EB',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          height: '28px',
                          minWidth: 'fit-content',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: '#D1D5DB',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Chip
                        label={process.priority || 'N/A'}
                        size='small'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: getPriorityColor(process.priority).fontWeight || 600,
                          padding: '6px 12px',
                          borderRadius: '16px',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#FFFFFF',
                          color: getPriorityColor(process.priority).color,
                          border: '1px solid #E4E6EB',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          height: '28px',
                          minWidth: 'fit-content',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: '#D1D5DB',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
                      <Chip
                        label={process.status || 'N/A'}
                        size='small'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: getStatusColor(process.status).fontWeight || 600,
                          padding: '6px 12px',
                          borderRadius: '16px',
                          whiteSpace: 'nowrap',
                          backgroundColor: '#FFFFFF',
                          color: getStatusColor(process.status).color,
                          border: '1px solid #E4E6EB',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          height: '28px',
                          minWidth: 'fit-content',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: '#D1D5DB',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      />
                      {['Em Atraso', 'Atrasado'].includes(process.status || '') && (
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(184, 30, 52, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 2px 3px rgba(184, 30, 52, 0.25))',
                            animation: 'pulseAlert 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            flexShrink: 0,
                            border: '1px solid rgba(184, 30, 52, 0.2)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(184, 30, 52, 0.18)',
                              transform: 'scale(1.05)'
                            },
                            '@keyframes pulseAlert': {
                              '0%, 100%': {
                                opacity: 1,
                                transform: 'scale(1)'
                              },
                              '50%': {
                                opacity: 0.8,
                                transform: 'scale(1.08)'
                              }
                            }
                          }}
                        >
                          <WarningIcon sx={{ fontSize: 18, color: '#B81E34' }} />
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 0.5, alignItems: 'center' }}>
                      <Tooltip
                        title='Ver anexos'
                        arrow
                        placement='top'
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: '#212121',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '12px',
                              padding: '6px 12px',
                              borderRadius: '8px'
                            }
                          },
                          arrow: {
                            sx: {
                              color: '#212121'
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
                              color: '#1877F2',
                              transform: 'scale(1.05)'
                            },
                            '&:active': {
                              transform: 'scale(0.95)'
                            },
                            '&:focus': {
                              outline: '2px solid rgba(24, 119, 242, 0.25)',
                              outlineOffset: '2px'
                            },
                            '& svg': {
                              fontSize: 20
                            }
                          }}
                        >
                          <AttachFileIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title='Visualizar'
                        arrow
                        placement='top'
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: '#212121',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '12px',
                              padding: '6px 12px',
                              borderRadius: '8px'
                            }
                          },
                          arrow: {
                            sx: {
                              color: '#212121'
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
                              color: '#1877F2',
                              transform: 'scale(1.05)'
                            },
                            '&:active': {
                              transform: 'scale(0.95)'
                            },
                            '&:focus': {
                              outline: '2px solid rgba(24, 119, 242, 0.25)',
                              outlineOffset: '2px'
                            },
                            '& svg': {
                              fontSize: 20
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
