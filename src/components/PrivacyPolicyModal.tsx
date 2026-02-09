import { Close as CloseIcon, Security as SecurityIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, IconButton, Typography, useTheme } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
};

const PrivacyPolicyModal = ({ open, onClose }: Props) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '85vh',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header com gradiente */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Ícone de fechar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Conteúdo do header */}
        <Box sx={{ p: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <SecurityIcon sx={{ fontSize: '2rem', color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant='h4'
                component='h2'
                fontWeight={700}
                sx={{
                  color: 'white',
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                Política de Privacidade
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
                }}
              >
                Protegendo seus dados com transparência
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4, maxHeight: '60vh', overflow: 'auto' }}>
          {/* Introdução */}
          <Box
            sx={{
              backgroundColor: 'grey.50',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                fontSize: '1rem',
                lineHeight: 1.6,
                textAlign: 'center'
              }}
            >
              Sua privacidade é importante para nós. Esta política explica como tratamos suas informações pessoais.
            </Typography>
          </Box>

          {/* Seções */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Seção 1 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  1
                </Box>
                Informações que Coletamos
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Coletamos informações que você nos fornece diretamente, como nome, sobrenome, endereço de e-mail e senha
                quando você cria uma conta.
              </Typography>
            </Box>

            {/* Seção 2 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  2
                </Box>
                Como Usamos suas Informações
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações e
                comunicar com você.
              </Typography>
            </Box>

            {/* Seção 3 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  3
                </Box>
                Compartilhamento de Informações
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto conforme
                descrito nesta política.
              </Typography>
            </Box>

            {/* Seção 4 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  4
                </Box>
                Segurança
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não
                autorizado, alteração, divulgação ou destruição.
              </Typography>
            </Box>

            {/* Seção 5 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  5
                </Box>
                Seus Direitos
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Você tem o direito de acessar, atualizar ou excluir suas informações pessoais. Entre em contato conosco
                para exercer esses direitos.
              </Typography>
            </Box>

            {/* Seção 6 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  6
                </Box>
                Alterações nesta Política
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Podemos atualizar esta política de privacidade periodicamente. Notificaremos sobre mudanças
                significativas por e-mail ou através de nossos serviços.
              </Typography>
            </Box>

            {/* Seção 7 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  7
                </Box>
                Contato
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco através dos canais
                disponíveis em nossa plataforma.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer com botão */}
        <Box
          sx={{
            p: 3,
            backgroundColor: 'grey.50',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button
            onClick={onClose}
            variant='contained'
            sx={{
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'primary.main',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              '&:hover': {
                backgroundColor: 'primary.dark'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Entendi
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export { PrivacyPolicyModal };
