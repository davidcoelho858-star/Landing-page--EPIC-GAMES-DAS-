import crypto from 'crypto';
import type {
  CatalogoItem,
  InterpretacaoIA,
  ItemProposta,
  Pedido,
  Proposta,
} from '../src/types/proposalTypes';

export function calcularPropostaAPartirDeInterpretacao(
  pedido: Pedido,
  interpretacao: InterpretacaoIA,
  catalogo: CatalogoItem[],
  appBaseUrl?: string
): Proposta | null {
  // If the interpretation flagged for review or has missing quantities, do NOT create auto-proposal
  if (interpretacao.necessitaRevisao || !interpretacao.itens || interpretacao.itens.length === 0) {
    return null;
  }

  const catalogMap = new Map(catalogo.map((c) => [c.id, c]));
  const itensProposta: ItemProposta[] = [];
  let totalCents = 0;

  for (const itemIA of interpretacao.itens) {
    const cat = catalogMap.get(itemIA.catalogoId);
    if (!cat || !cat.ativo) {
      return null; // Item invalid or inactive
    }

    const qtd = Number(itemIA.quantidade);
    if (!qtd || isNaN(qtd) || qtd <= 0) {
      return null; // Undefined or invalid quantity
    }

    // subtotal = quantidade * precoUnitario (em cêntimos)
    const subtotal = Math.round(qtd * cat.precoUnitario);
    totalCents += subtotal;

    itensProposta.push({
      catalogoId: cat.id,
      nome: cat.nome,
      descricao: cat.descricao,
      unidade: cat.unidade,
      quantidade: qtd,
      precoUnitario: cat.precoUnitario,
      subtotal,
      condicoes: cat.condicoes,
    });
  }

  if (itensProposta.length === 0) return null;

  const token = crypto.randomBytes(24).toString('hex');
  const now = new Date();
  const validade = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days demo validity
  const propId = `prop_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const numeroProposta = `PROP-2026-${String(Math.floor(100 + Math.random() * 900))}`;

  const baseUrl = (appBaseUrl || process.env.APP_BASE_URL || '').replace(/\/$/, '');
  const relativeLink = `/proposta/${token}`;
  const absoluteLink = baseUrl ? `${baseUrl}${relativeLink}` : relativeLink;

  const proposta: Proposta = {
    id: propId,
    numeroProposta,
    pedidoId: pedido.id,
    clienteNome: pedido.nome,
    resumoAmbito: interpretacao.resumo || 'Fornecimento de produtos e serviços digitais Epic Games Store.',
    itens: itensProposta,
    total: totalCents,
    condicoes:
      'Valores apresentados em EUR, sem IVA incluído. Proposta válida por 15 dias para efeitos de demonstração comercial.',
    token,
    link: absoluteLink,
    estadoNotificacao: 'Por enviar',
    isDemonstracao: true,
    createdAt: now.toISOString(),
    validade: validade.toISOString(),
  };

  return proposta;
}

export function recalcularPropostaManual(
  pedido: Pedido,
  itensManuais: { catalogoId: string; quantidade: number }[],
  catalogo: CatalogoItem[],
  resumoAmbito: string,
  appBaseUrl?: string
): Proposta {
  const catalogMap = new Map(catalogo.map((c) => [c.id, c]));
  const itensProposta: ItemProposta[] = [];
  let totalCents = 0;

  for (const item of itensManuais) {
    const cat = catalogMap.get(item.catalogoId);
    if (!cat) continue;
    const qtd = Math.max(1, Math.round(item.quantidade || 1));
    const subtotal = Math.round(qtd * cat.precoUnitario);
    totalCents += subtotal;

    itensProposta.push({
      catalogoId: cat.id,
      nome: cat.nome,
      descricao: cat.descricao,
      unidade: cat.unidade,
      quantidade: qtd,
      precoUnitario: cat.precoUnitario,
      subtotal,
      condicoes: cat.condicoes,
    });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const now = new Date();
  const validade = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const propId = `prop_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const numeroProposta = `PROP-2026-${String(Math.floor(100 + Math.random() * 900))}`;

  const baseUrl = (appBaseUrl || process.env.APP_BASE_URL || '').replace(/\/$/, '');
  const relativeLink = `/proposta/${token}`;
  const absoluteLink = baseUrl ? `${baseUrl}${relativeLink}` : relativeLink;

  return {
    id: propId,
    numeroProposta,
    pedidoId: pedido.id,
    clienteNome: pedido.nome,
    resumoAmbito: resumoAmbito || 'Proposta comercial personalizada Epic Games Store.',
    itens: itensProposta,
    total: totalCents,
    condicoes:
      'Valores apresentados em EUR, sem IVA incluído. Proposta válida por 15 dias para efeitos de demonstração comercial.',
    token,
    link: absoluteLink,
    estadoNotificacao: 'Por enviar',
    isDemonstracao: true,
    createdAt: now.toISOString(),
    validade: validade.toISOString(),
  };
}
