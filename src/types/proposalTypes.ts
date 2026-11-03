export type UnidadeVenda = 'unidade' | 'hora' | 'pacote';

export interface CatalogoItem {
  id: string;
  nome: string;
  descricao: string;
  unidade: UnidadeVenda;
  precoUnitario: number; // em cêntimos de euro (ex: 8999 = 89,99 €)
  moeda: 'EUR';
  ativo: boolean;
  condicoes?: string;
  isDemonstracao?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EstadoPedido = 
  | 'Recebido' 
  | 'Em análise' 
  | 'Necessita de revisão' 
  | 'Proposta criada' 
  | 'Erro';

export type EstadoNotificacao = 
  | 'Por enviar' 
  | 'Aceite pelo serviço' 
  | 'Falhou' 
  | 'Não configurado';

export interface ItemInterpretadoIA {
  catalogoId: string;
  quantidade: number | null;
  evidencia: string;
}

export interface InterpretacaoIA {
  resumo: string;
  itens: ItemInterpretadoIA[];
  prazoPedido: string | null;
  informacaoEmFalta: string[];
  necessitaRevisao: boolean;
  motivoRevisao: string | null;
}

export interface Pedido {
  id: string;
  nome: string;
  email: string;
  pedidoOriginal: string;
  status: EstadoPedido;
  createdAt: string;
  updatedAt: string;
  interpretacaoIA?: InterpretacaoIA;
  informacaoEmFalta?: string[];
  motivoRevisao?: string | null;
  propostaId?: string | null;
  erroProcessamento?: string | null;
}

export interface ItemProposta {
  catalogoId: string;
  nome: string;
  descricao: string;
  unidade: UnidadeVenda;
  quantidade: number;
  precoUnitario: number; // cêntimos
  subtotal: number; // cêntimos
  condicoes?: string;
}

export interface Proposta {
  id: string;
  numeroProposta: string; // Ex: PROP-2026-001
  pedidoId: string;
  clienteNome?: string;
  resumoAmbito: string;
  itens: ItemProposta[];
  total: number; // em cêntimos (sem IVA)
  condicoes: string;
  token: string;
  link: string;
  estadoNotificacao: EstadoNotificacao;
  notificacaoResendId?: string | null;
  notificacaoTentativaEm?: string | null;
  notificacaoErro?: string | null;
  isDemonstracao: boolean;
  createdAt: string;
  validade: string; // ISO date
}

export interface PublicProposalData {
  numeroProposta: string;
  clienteNome?: string;
  createdAt: string;
  validade: string;
  resumoAmbito: string;
  itens: ItemProposta[];
  total: number; // em cêntimos
  condicoes: string;
  isDemonstracao: boolean;
}
