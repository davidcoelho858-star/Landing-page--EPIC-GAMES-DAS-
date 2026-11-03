import type {
  CatalogoItem,
  Pedido,
  Proposta,
  PublicProposalData,
} from '../types/proposalTypes';

export async function submitPedidoProposta(payload: {
  nome: string;
  email: string;
  pedido: string;
}): Promise<{ success: boolean; message: string; pedidoId?: string }> {
  const res = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao submeter pedido de proposta.');
  }

  return data;
}

export async function fetchPropostaPublica(token: string): Promise<PublicProposalData> {
  const res = await fetch(`/api/proposta/${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Proposta não encontrada.');
  }
  return data;
}

export async function fetchAdminPedidos(userUid?: string): Promise<(Pedido & { proposta?: Proposta | null })[]> {
  const res = await fetch('/api/admin/pedidos', {
    headers: userUid ? { 'x-admin-uid': userUid } : {},
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao carregar lista de pedidos.');
  }
  return data;
}

export async function fetchAdminCatalogo(userUid?: string): Promise<CatalogoItem[]> {
  const res = await fetch('/api/admin/catalogo', {
    headers: userUid ? { 'x-admin-uid': userUid } : {},
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao carregar catálogo.');
  }
  return data;
}

export async function saveAdminCatalogoItem(
  item: Partial<CatalogoItem>,
  userUid?: string
): Promise<CatalogoItem> {
  const isEdit = Boolean(item.id);
  const url = isEdit ? `/api/admin/catalogo/${item.id}` : '/api/admin/catalogo';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(userUid ? { 'x-admin-uid': userUid } : {}),
    },
    body: JSON.stringify(item),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao guardar item no catálogo.');
  }
  return data;
}

export async function reprocessarPedido(id: string, userUid?: string): Promise<Pedido> {
  const res = await fetch(`/api/admin/reprocessar/${id}`, {
    method: 'POST',
    headers: userUid ? { 'x-admin-uid': userUid } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao reprocessar pedido.');
  }
  return data;
}

export async function aprovarPropostaManual(
  payload: { pedidoId: string; itens: { catalogoId: string; quantidade: number }[]; resumoAmbito: string },
  userUid?: string
): Promise<{ success: boolean; proposta: Proposta }> {
  const res = await fetch('/api/admin/proposta/aprovar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userUid ? { 'x-admin-uid': userUid } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao aprovar proposta.');
  }
  return data;
}

export async function reenviarNotificacao(propostaId: string, userUid?: string): Promise<any> {
  const res = await fetch(`/api/admin/reenviar-notificacao/${propostaId}`, {
    method: 'POST',
    headers: userUid ? { 'x-admin-uid': userUid } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao reenviar notificação.');
  }
  return data;
}

export async function fetchAdminStatus(userUid?: string): Promise<any> {
  const res = await fetch('/api/admin/status', {
    headers: userUid ? { 'x-admin-uid': userUid } : {},
  });
  return res.json().catch(() => ({}));
}
