import {
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  SwapVert as SwapVertIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
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
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import type { Process } from '@/globals/types';

interface ProcessTableProps {
  processes: Process[];
  onProcessClick?: (process: Process) => void;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Em Andamento':
      return { bg: 'secondary.light', color: 'primary.dark', fontWeight: 700 };
    case 'Pendente':
      return { bg: 'warning.light', color: 'warning.dark', fontWeight: 700 };
    case 'Atrasado':
    case 'Em Atraso':
      return { bg: 'error.light', color: 'error.main', fontWeight: 700 };
    case 'Concluído':
      return { bg: 'success.light', color: 'success.dark', fontWeight: 700 };
    case 'Cancelado':
      return { bg: 'grey.100', color: 'text.secondary', fontWeight: 600 };
    default:
      return { bg: 'grey.100', color: 'text.secondary', fontWeight: 600 };
  }
};

const getActionButton = (process: Process, onProcessClick?: (process: Process) => void) => {
  const status = process.status || '';

  if (status === 'Em Andamento') {
    return (
      <Button
        size='small'
        startIcon={<EditIcon />}
        onClick={() => onProcessClick?.(process)}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          px: 1.5,
          py: 0.5,
          backgroundColor: 'primary.main',
          color: 'common.white',
          '&:hover': {
            backgroundColor: 'primary.dark'
          }
        }}
      >
        Assinatura
      </Button>
    );
  }

  if (status === 'Pendente') {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button
          size='small'
          startIcon={<WarningIcon />}
          onClick={() => onProcessClick?.(process)}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            px: 1.5,
            py: 0.5,
            backgroundColor: 'error.main',
            color: 'common.white',
            '&:hover': {
              backgroundColor: 'error.dark'
            }
          }}
        >
          Corrigir
        </Button>
        <Button
          size='small'
          startIcon={<VisibilityIcon />}
          onClick={() => onProcessClick?.(process)}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            px: 1.5,
            py: 0.5,
            backgroundColor: 'secondary.main',
            color: 'common.white',
            '&:hover': {
              backgroundColor: 'secondary.dark'
            }
          }}
        >
          Analisar
        </Button>
      </Box>
    );
  }

  return (
    <Chip
      icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: 'success.dark' }} />}
      label='Sem pendência'
      size='small'
      onClick={() => onProcessClick?.(process)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '6px 12px',
        borderRadius: '16px',
        whiteSpace: 'nowrap',
        backgroundColor: 'background.paper',
        color: 'success.dark',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) => `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
        height: '28px',
        minWidth: 'fit-content',
        maxWidth: '100%',
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'grey.300',
          boxShadow: (theme) => `0 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
          transform: 'translateY(-1px)',
          backgroundColor: 'success.light'
        },
        '& .MuiChip-icon': {
          marginLeft: '8px',
          marginRight: '-4px',
          color: 'success.dark'
        }
      }}
    />
  );
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
            backgroundColor: 'primary.main',
            flexShrink: 0
          }}
        />
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            fontSize: { xs: '16px', sm: '18px', md: '20px' },
            color: 'text.primary'
          }}
        >
          {sortedProcesses.length === 1 ? '1 Processo' : `${sortedProcesses.length} Processos`}
        </Typography>
      </Box>

      <TableContainer
        sx={{
          borderRadius: { xs: '12px', sm: '16px' },
          border: '1px solid divider',
          boxShadow: (theme) => `0 1px 3px ${alpha(theme.palette.common.black, 0.06)}`,
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 220px)', md: 'calc(100vh - 240px)' },
          backgroundColor: 'background.paper',
          mb: { xs: 2, sm: 3 },
          width: '100%',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'grey.50',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'grey.300',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'text.disabled'
            }
          },
          '&::-webkit-scrollbar-corner': {
            backgroundColor: 'grey.50'
          }
        }}
      >
        <Table
          sx={{
            minWidth: { xs: 800, sm: 1000, md: 1200 },
            tableLayout: 'auto'
          }}
        >
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'grey.50'
            }}
          >
            <TableRow
              sx={{
                background: 'linear-gradient(to bottom, grey.50 0%, grey.100 100%)',
                '& th': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'text.primary',
                  borderBottom: '1px solid divider',
                  py: 2,
                  px: { xs: 1.5, md: 2.5 },
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap',
                  backgroundColor: 'grey.50'
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
                          backgroundColor: 'text.primary',
                          color: 'common.white',
                          border: 'none',
                          fontSize: '12px',
                          padding: '6px 12px',
                          borderRadius: '8px'
                        }
                      },
                      arrow: {
                        sx: {
                          color: 'text.primary'
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
                            color: 'primary.main',
                            transform: 'scale(1.1)'
                          }
                        },
                        '&:focus': {
                          outline: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                          outlineOffset: '2px'
                        }
                      }}
                    >
                      <SwapVertIcon
                        className='sort-icon'
                        sx={{
                          fontSize: '14px',
                          color: 'text.disabled',
                          transition: 'transform 200ms ease, color 200ms ease'
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ minWidth: { xs: 200, sm: 300, md: 400, lg: 500 } }}>Objeto</TableCell>
              <TableCell>Etapa Atual</TableCell>
              <TableCell>Prazo Final da Etapa</TableCell>
              <TableCell sx={{ minWidth: { xs: 140, sm: 160 } }}>Situação</TableCell>
              <TableCell>Pendências</TableCell>
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
                        background: 'linear-gradient(180deg, grey.50 0%, divider 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 600,
                          fontSize: '20px',
                          color: 'text.primary',
                          mb: 1
                        }}
                      >
                        Nenhum processo encontrado
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.disabled',
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
              sortedProcesses.map((process, index) => {
                const statusColor = getStatusColor(process.status);
                const deadline = process.dueDate || null;

                return (
                  <TableRow
                    key={process._id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? 'background.paper' : 'grey.50',
                      borderBottom: '1px solid divider',
                      borderTop: index === 0 ? '1px solid divider' : 'none',
                      '&:hover': {
                        backgroundColor: 'secondary.light',
                        boxShadow: (theme) => `0 2px 6px ${alpha(theme.palette.common.black, 0.06)}`,
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
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          lineHeight: 1.5,
                          display: 'inline-block',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: 'primary.dark',
                            textDecoration: 'underline',
                            transform: 'translateX(2px)'
                          },
                          '&:focus': {
                            outline: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
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
                              backgroundColor: 'text.primary',
                              color: 'common.white',
                              border: 'none',
                              fontSize: '12px',
                              maxWidth: '600px',
                              padding: '8px 12px',
                              borderRadius: '8px'
                            }
                          },
                          arrow: {
                            sx: {
                              color: 'text.primary'
                            }
                          }
                        }}
                      >
                        <Typography
                          component='span'
                          sx={{
                            color: 'text.primary',
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
                              color: 'primary.dark'
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
                            backgroundColor: 'background.paper',
                            color: 'grey.800',
                            border: '1px solid divider',
                            boxShadow: (theme) => `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
                            height: '28px',
                            minWidth: 'fit-content',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderColor: 'grey.300',
                              boxShadow: (theme) => `0 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
                              transform: 'translateY(-1px)'
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {deadline ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          <Typography
                            variant='body2'
                            sx={{ color: 'text.primary' }}
                          >
                            {dayjs(deadline).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography
                          variant='body2'
                          sx={{ color: 'text.disabled' }}
                        >
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 140, sm: 160 }, overflow: 'visible' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          justifyContent: 'flex-start',
                          flexWrap: 'nowrap'
                        }}
                      >
                        <Chip
                          label={process.status || 'N/A'}
                          size='small'
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: statusColor.fontWeight || 600,
                            padding: '6px 12px',
                            borderRadius: '16px',
                            whiteSpace: 'nowrap',
                            backgroundColor: 'background.paper',
                            color: statusColor.color,
                            border: '1px solid divider',
                            boxShadow: (theme) => `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
                            height: '28px',
                            minWidth: 'fit-content',
                            maxWidth: '100%',
                            overflow: 'visible',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderColor: 'grey.300',
                              boxShadow: (theme) => `0 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
                              transform: 'translateY(-1px)'
                            }
                          }}
                        />
                        {process.status === 'Em Atraso' && (
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.12),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              filter: (theme) => `drop-shadow(0 2px 3px ${alpha(theme.palette.error.main, 0.25)})`,
                              animation: 'pulseAlert 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                              flexShrink: 0,
                              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.18),
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
                            <WarningIcon sx={{ fontSize: 18, color: 'error.main' }} />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 0.5, alignItems: 'center' }}>
                        {getActionButton(process, onProcessClick)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 0.5, alignItems: 'center' }}>
                        <Tooltip
                          title='Ver anexos'
                          arrow
                          placement='top'
                          slotProps={{
                            tooltip: {
                              sx: {
                                backgroundColor: 'text.primary',
                                color: 'common.white',
                                border: 'none',
                                fontSize: '12px',
                                padding: '6px 12px',
                                borderRadius: '8px'
                              }
                            },
                            arrow: {
                              sx: {
                                color: 'text.primary'
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
                              color: 'text.disabled',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'action.selected',
                                color: 'primary.main',
                                transform: 'scale(1.05)'
                              },
                              '&:active': {
                                transform: 'scale(0.95)'
                              },
                              '&:focus': {
                                outline: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
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
                                backgroundColor: 'text.primary',
                                color: 'common.white',
                                border: 'none',
                                fontSize: '12px',
                                padding: '6px 12px',
                                borderRadius: '8px'
                              }
                            },
                            arrow: {
                              sx: {
                                color: 'text.primary'
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
                              color: 'text.disabled',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'action.selected',
                                color: 'primary.main',
                                transform: 'scale(1.05)'
                              },
                              '&:active': {
                                transform: 'scale(0.95)'
                              },
                              '&:focus': {
                                outline: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
