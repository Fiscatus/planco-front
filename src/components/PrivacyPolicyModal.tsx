import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
};

const PrivacyPolicyModal = ({ open, onClose }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Política de Privacidade
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Sua privacidade é importante para nós. Esta política explica como tratamos suas informações pessoais.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>
            1. Informações que Coletamos
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Coletamos informações que você nos fornece diretamente, como nome, sobrenome, endereço de e-mail e senha quando você cria uma conta.
          </Typography>

          <Typography variant="h6" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>
            2. Como Usamos suas Informações
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações e comunicar com você.
          </Typography>

          <Typography variant="h6" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>
            3. Compartilhamento de Informações
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto conforme descrito nesta política.
          </Typography>

          <Typography variant="h6" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>
            4. Segurança
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </Typography>

          <Typography variant="h6" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>
            5. Seus Direitos
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Você tem o direito de acessar, atualizar ou excluir suas informações pessoais. Entre em contato conosco para exercer esses direitos.
          </Typography>

          <Typography variant="h6" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>
            6. Alterações nesta Política
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Podemos atualizar esta política de privacidade periodicamente. Notificaremos sobre mudanças significativas por e-mail ou através de nossos serviços.
          </Typography>

          <Typography variant="h6" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>
            7. Contato
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco através dos canais disponíveis em nossa plataforma.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              onClick={onClose}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(224 71% 59%))',
                '&:hover': {
                  background: 'linear-gradient(135deg, hsl(262 83% 50%), hsl(224 71% 50%))'
                }
              }}
            >
              Fechar
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export { PrivacyPolicyModal };
