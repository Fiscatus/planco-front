export type Processo = {
    _id: string;
    nome: string;
    descricao: string;
    status: 'ativo' | 'inativo';
}
