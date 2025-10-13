import { Box, Button, Dialog, DialogContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';

type Props = {
  open: boolean;
  onClose: () => void;
};

const TermsOfUseModal = ({ open, onClose }: Props) => {
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
          background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)',
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
              <DescriptionIcon sx={{ fontSize: '2rem', color: 'white' }} />
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
                Termos de Uso
              </Typography>
              <Typography
                variant='body1'
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
                }}
              >
                Condições para uso da plataforma Planco
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
              backgroundColor: '#F8F9FA',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              border: '1px solid #E9ECEF'
            }}
          >
            <Typography
              variant='body1'
              sx={{ 
                color: '#495057',
                fontSize: '1rem',
                lineHeight: 1.6,
                textAlign: 'center'
              }}
            >
              Bem-vindo à Planco! Estes termos de uso regem o uso da nossa plataforma de licitações públicas.
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
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
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
                Aceitação dos Termos
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Ao acessar e usar a plataforma Planco, você concorda em cumprir e estar vinculado a estes termos de uso.
                Se você não concordar com qualquer parte destes termos, não deve usar nossa plataforma.
              </Typography>
            </Box>

            {/* Seção 2 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
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
                Descrição do Serviço
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                A Planco é uma plataforma inteligente que conecta todas as fases da licitação pública, oferecendo
                ferramentas para gestão, acompanhamento e otimização de processos licitatórios.
              </Typography>
            </Box>

            {/* Seção 3 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
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
                Conta de Usuário
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Para usar nossa plataforma, você deve criar uma conta fornecendo informações precisas e atualizadas.
                Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que
                ocorrem em sua conta.
              </Typography>
            </Box>

            {/* Seção 4 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
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
                Uso Aceitável
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Você concorda em usar a plataforma apenas para fins legais e de acordo com estes termos. É proibido
                usar a plataforma para atividades ilegais, fraudulentas ou que violem os direitos de terceiros.
              </Typography>
            </Box>

            {/* Seção 5 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
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
                Propriedade Intelectual
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Todo o conteúdo da plataforma, incluindo textos, gráficos, logotipos, ícones e software, é propriedade
                da Planco e está protegido por leis de direitos autorais e outras leis de propriedade intelectual.
              </Typography>
            </Box>

            {/* Seção 6 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
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
                Limitação de Responsabilidade
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                A Planco não será responsável por danos diretos, indiretos, incidentais ou consequenciais resultantes
                do uso ou incapacidade de usar a plataforma, incluindo perda de dados ou lucros.
              </Typography>
            </Box>

            {/* Seção 7 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
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
                Modificações dos Termos
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor
                imediatamente após a publicação. O uso continuado da plataforma constitui aceitação dos novos termos.
              </Typography>
            </Box>

            {/* Seção 8 */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #E9ECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography
                variant='h6'
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#1877F2',
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
                    backgroundColor: '#1877F2',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  8
                </Box>
                Contato
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#495057',
                  lineHeight: 1.6,
                  fontSize: '0.875rem'
                }}
              >
                Se você tiver dúvidas sobre estes termos de uso, entre em contato conosco através dos canais
                disponíveis em nossa plataforma.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer com botão */}
        <Box
          sx={{
            p: 3,
            backgroundColor: '#F8F9FA',
            borderTop: '1px solid #E9ECEF',
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
              backgroundColor: '#1877F2',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              '&:hover': {
                backgroundColor: '#166FE5'
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

export { TermsOfUseModal };
