export type OrgEndereco = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
};

export type Org = {
  _id: string;
  name: string;
  sigla?: string;
  cnpj?: string;
  esfera?: 'Federal' | 'Estadual' | 'Municipal' | 'Privado' | 'Outro';
  emailContato?: string;
  telefone?: string;
  endereco?: OrgEndereco;
  logoKey?: string;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateOrgDto = Omit<Org, '_id' | 'logoKey' | 'logoUrl' | 'createdAt' | 'updatedAt'>;
