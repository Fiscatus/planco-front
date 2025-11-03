import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { type RefObject, useMemo } from 'react';

type Props = {
  sectionRef?: RefObject<HTMLDivElement>;
  embedded?: boolean;
};

const sharedAccordionStyles = {
  borderRadius: '24px !important', // Pílula - forçar mesmo valor para todos
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  bgcolor: '#FFFFFF',
  border: '1px solid #F1F5F9',
  margin: 0,
  overflow: 'hidden', // Garantir que o conteúdo não quebre as bordas
  '&:before': {
    display: 'none'
  },
  // Forçar bordas arredondadas em todos os estados e posições
  '&:first-of-type': {
    borderRadius: '24px !important'
  },
  '&:last-of-type': {
    borderRadius: '24px !important'
  },
  '&.Mui-expanded': {
    margin: 0,
    borderRadius: '24px !important', // Manter mesmo raio quando expandido
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '&:first-of-type': {
      borderRadius: '24px !important'
    },
    '&:last-of-type': {
      borderRadius: '24px !important'
    },
    '& .MuiAccordionSummary-root': {
      borderRadius: '24px 24px 0 0 !important' // Borda superior arredondada quando expandido
    },
    '& .MuiAccordionDetails-root': {
      borderRadius: '0 0 24px 24px !important' // Borda inferior arredondada quando expandido
    }
  },
  '&:hover': {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderColor: '#E2E8F0',
    borderRadius: '24px !important'
  },
  '& .MuiAccordionSummary-root': {
    borderRadius: '24px !important' // Garantir bordas arredondadas no summary
  },
  '& .MuiAccordionDetails-root': {
    borderRadius: '0 0 24px 24px !important' // Garantir bordas arredondadas no details
  },
  transition: 'all 0.25s ease-in-out'
};

const sharedSummaryStyles = {
  px: 4,
  py: 2.5,
  minHeight: 64,
  height: 64,
  borderRadius: '24px !important', // Garantir bordas arredondadas
  '& .MuiAccordionSummary-content': {
    margin: 0,
    alignItems: 'center'
  },
  '&.Mui-expanded': {
    minHeight: 64,
    height: 64,
    borderRadius: '24px 24px 0 0 !important' // Borda superior arredondada quando expandido
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    transition: 'transform 0.25s ease',
    color: '#64748B',
    fontSize: '1.5rem'
  },
  '&.Mui-expanded .MuiAccordionSummary-expandIconWrapper': {
    transform: 'rotate(180deg)',
    color: '#1877F2'
  },
  '&:hover': {
    bgcolor: '#F8FAFC'
  },
  '@media (max-width: 767px)': {
    px: 2.5, // 20px para mobile
    py: 2, // 16px para mobile
    minHeight: 56, // 56px para mobile
    height: 56,
    '&.Mui-expanded': {
      minHeight: 56,
      height: 56,
      borderRadius: '24px 24px 0 0 !important' // Manter bordas arredondadas no mobile
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      fontSize: '1.25rem' // 20px para mobile
    }
  }
};

const sharedDetailsStyles = {
  px: 4,
  pb: 4,
  pt: 0,
  borderRadius: '0 0 24px 24px !important', // Borda inferior arredondada
  '@media (max-width: 767px)': {
    px: 2.5, // 20px para mobile
    pb: 3, // 24px para mobile
    borderRadius: '0 0 24px 24px !important' // Manter bordas arredondadas no mobile
  }
};

const sharedTitleStyles = {
  fontWeight: 600,
  color: '#1E293B',
  fontSize: '1.125rem',
  lineHeight: 1.5,
  letterSpacing: '-0.01em',
  '@media (max-width: 767px)': {
    fontSize: '1rem' // 16px para mobile
  }
};

const sharedAnswerStyles = {
  color: '#64748B',
  lineHeight: 1.6,
  fontSize: '1rem',
  fontWeight: 400,
  '@media (max-width: 767px)': {
    fontSize: '0.9375rem' // 15px para mobile
  }
};

const FaqSection = ({ sectionRef, embedded = true }: Props) => {
  const faqs = useMemo(
    () => [
      {
        q: 'Como personalizar o fluxo?',
        a: 'Você pode personalizar os fluxos de trabalho na seção \'Configurações do Fluxo\', onde é possível criar, editar e remover etapas conforme a necessidade da sua instituição.'
      },
      {
        q: 'Como gerar relatórios?',
        a: 'Acesse o módulo \'Relatórios\' para visualizar dashboards interativos e gerar relatórios personalizados. Filtre por período, tipo de contrato e outras variáveis para obter os dados que precisa.'
      },
      {
        q: 'Como configurar alertas e lembretes?',
        a: 'Alertas e lembretes podem ser configurados no seu perfil de usuário. Defina notificações por e-mail ou no sistema para prazos importantes e atualizações de processos.'
      },
      {
        q: 'Onde vejo minhas pendências?',
        a: 'Suas pendências e tarefas atribuídas a você são listadas no painel inicial e também podem ser acessadas através do ícone de notificações no topo da página.'
      }
    ],
    []
  );

  return (
    <Box
      ref={sectionRef}
      component='section'
      sx={{
        py: { xs: 4, md: 6 },
        width: '100%'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant='h4'
          fontWeight={700}
          sx={{
            color: '#1E293B',
            mb: 2,
            fontSize: { xs: '1.75rem', md: '2rem' },
            letterSpacing: '-0.025em',
            '@media (max-width: 767px)': {
              fontSize: '1.5rem', // 24px para mobile
              mb: 1.5 // 12px para mobile
            }
          }}
        >
          Perguntas Frequentes
        </Typography>
        <Typography
          sx={{
            color: '#64748B',
            maxWidth: '28rem',
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.125rem' },
            fontWeight: 400,
            '@media (max-width: 767px)': {
              fontSize: '0.9375rem', // 15px para mobile
              maxWidth: '100%',
              px: 2 // 16px para mobile
            }
          }}
        >
          Tire suas dúvidas de forma rápida com as perguntas mais frequentes do sistema.
        </Typography>
      </Box>

          <Box
            sx={{
              maxWidth: '52rem', // ~832px - mais compacto
              mx: 'auto', // Centralizar acordions
              display: 'flex',
              flexDirection: 'column',
              gap: 2 // Gap consistente entre todos os itens
            }}
          >
          {faqs.map((faq, idx) => (
            <Accordion
              key={idx.toString()}
              sx={sharedAccordionStyles}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={sharedSummaryStyles}
              >
                <Typography sx={sharedTitleStyles}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={sharedDetailsStyles}>
                <Typography sx={sharedAnswerStyles}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          </Box>
    </Box>
  );
};

export { FaqSection };
