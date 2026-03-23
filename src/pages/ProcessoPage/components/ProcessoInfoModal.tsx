import { Box, Dialog } from '@mui/material';

type Infos = {
  objeto: string;
  numeroProcesso: string;
  gerenciaResponsavel: string;
  dataCriacao: string;
  etapaAtual: string;
  gerenciaEnvolvidas: string[];
  modalidade: string;
  criadoPor: string;
  prazoFinal: string;
  situacao: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  infos: Infos;
};

const ProcessoInfoModal = ({ isOpen, onClose, infos }: Props) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
    >
      <Box sx={{ p: 3 }}>
        <h2>Informações do Processo</h2>
        <p>
          <strong>Objeto:</strong> {infos.objeto}
        </p>
        <p>
          <strong>Número do Processo:</strong> {infos.numeroProcesso}
        </p>
        <p>
          <strong>Gerência Responsável:</strong> {infos.gerenciaResponsavel}
        </p>
        <p>
          <strong>Data de Criação:</strong> {infos.dataCriacao}
        </p>
        <p>
          <strong>Etapa Atual:</strong> {infos.etapaAtual}
        </p>
        <p>
          <strong>Gerências Envolvidas:</strong> {infos.gerenciaEnvolvidas.join(', ')}
        </p>
        <p>
          <strong>Modalidade:</strong> {infos.modalidade}
        </p>
        <p>
          <strong>Criado Por:</strong> {infos.criadoPor}
        </p>
        <p>
          <strong>Prazo Final:</strong> {infos.prazoFinal}
        </p>
        <p>
          <strong>Situação:</strong> {infos.situacao}
        </p>
      </Box>
    </Dialog>
  );
};

export { ProcessoInfoModal };
