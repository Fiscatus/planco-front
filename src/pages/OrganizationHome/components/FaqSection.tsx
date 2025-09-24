import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography } from '@mui/material';
import { type RefObject, useMemo } from 'react';

type Props = {
  sectionRef?: RefObject<HTMLDivElement>;
};

const FaqSection = ({ sectionRef }: Props) => {
  const faqs = useMemo(
    () => [
      {
        q: 'Como personalizar o fluxo?',
        a: 'Acesse Configurações do Fluxo para editar etapas, responsáveis e regras.'
      },
      {
        q: 'Onde vejo minhas pendências?',
        a: 'Abra Notificações ou o módulo Minhas Pendências no topo do painel.'
      },
      {
        q: 'Como gerar relatórios?',
        a: 'No módulo Relatórios, selecione um template e ajuste os filtros desejados.'
      },
      {
        q: 'Posso convidar membros da equipe?',
        a: 'Sim. Vá em Usuários > Convidar e defina o papel e permissões.'
      },
      {
        q: 'Como configurar alertas e lembretes?',
        a: 'Em Configurações > Notificações, escolha canais e periodicidade.'
      },
      {
        q: 'Onde encontro os tutoriais?',
        a: 'Acesse a seção Tutoriais & Recursos para vídeos e guias rápidos.'
      }
    ],
    []
  );

  return (
    <Box
      ref={sectionRef}
      component='section'
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 4, md: 6 },
        width: '100%',
        bgcolor: '#fff'
      }}
    >
      <Container maxWidth={false}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant='h6'
            fontWeight={600}
            color='text.primary'
            sx={{ mb: 2 }}
          >
            Perguntas Frequentes
          </Typography>

          {(() => {
            const columns = [faqs.slice(0, 2), faqs.slice(2, 4), faqs.slice(4, 6)];
            return (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: { xs: 2, md: 2.5 }
                }}
              >
                {columns.map((group, colIdx) => (
                  <Box
                    key={colIdx.toString()}
                    sx={{
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'rgba(229,231,235,1)',
                      bgcolor: '#fff',
                      boxShadow: 1
                    }}
                  >
                    {group.map((faq, idx) => (
                      <Accordion
                        key={idx.toString()}
                        disableGutters
                        sx={{
                          boxShadow: 'none',
                          borderTop: idx === 0 ? 'none' : '1px solid rgba(243,244,246,1)'
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ px: 2, py: 1.5 }}
                        >
                          <Typography sx={{ fontWeight: 600, color: '#111827' }}>{faq.q}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2, pb: 2 }}>
                          <Typography sx={{ color: '#4b5563' }}>{faq.a}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                ))}
              </Box>
            );
          })()}
        </Box>
      </Container>
    </Box>
  );
};

export { FaqSection };
