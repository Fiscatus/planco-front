import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { type RefObject, useMemo } from 'react';

// ATENÇÃO: Não usar <Container> aqui. Este componente é embutido na OrganizationHome.

type Props = {
  sectionRef?: RefObject<HTMLDivElement>;
  embedded?: boolean;
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
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        width: '100%'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant='h4'
          fontWeight={700}
          sx={{
            color: '#212121',
            mb: 1,
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          Perguntas Frequentes
        </Typography>
        <Typography
          sx={{
            color: '#616161',
            maxWidth: '32rem',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Encontre respostas rápidas para as dúvidas mais comuns sobre o sistema.
        </Typography>
      </Box>

          <Box
            sx={{
              maxWidth: '64rem',
              mx: 'auto'
            }}
          >
          {faqs.map((faq, idx) => (
            <Accordion
              key={idx.toString()}
              sx={{
                mb: 1,
                borderRadius: 2,
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'rgba(229, 231, 235, 1)',
                '&:before': {
                  display: 'none'
                },
                '&.Mui-expanded': {
                  margin: '0 0 4px 0'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 3,
                  py: 2,
                  '& .MuiAccordionSummary-content': {
                    margin: 0
                  }
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#212121',
                    fontSize: '1.125rem'
                  }}
                >
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography
                  sx={{
                    color: '#616161',
                    lineHeight: 1.6
                  }}
                >
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
