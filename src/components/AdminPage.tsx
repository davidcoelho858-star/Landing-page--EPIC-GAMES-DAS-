import React, { useEffect, useState } from 'react';
import {
  Shield,
  LogIn,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Edit,
  Plus,
  ArrowLeft,
  Mail,
  FileText,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Info,
} from 'lucide-react';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  User,
} from '../services/firebaseClient';
import {
  fetchAdminPedidos,
  fetchAdminCatalogo,
  saveAdminCatalogoItem,
  reprocessarPedido,
  aprovarPropostaManual,
  reenviarNotificacao,
  fetchAdminStatus,
} from '../services/proposalService';
import type {
  CatalogoItem,
  EstadoPedido,
  Pedido,
  Proposta,
} from '../types/proposalTypes';

export const AdminPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'pedidos' | 'catalogo' | 'status'>('pedidos');
  const [pedidos, setPedidos] = useState<(Pedido & { proposta?: Proposta | null })[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status Filter
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Selected Order for Detail Modal
  const [selectedPedido, setSelectedPedido] = useState<(Pedido & { proposta?: Proposta | null }) | null>(null);

  // Manual Review Form State
  const [manualItems, setManualItems] = useState<{ catalogoId: string; quantidade: number }[]>([]);
  const [manualResumo, setManualResumo] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Catalog Item Edit Modal
  const [editingItem, setEditingItem] = useState<Partial<CatalogoItem> | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Copied UID toast
  const [copiedUid, setCopiedUid] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        loadData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (userUid?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [peds, cats, st] = await Promise.all([
        fetchAdminPedidos(userUid),
        fetchAdminCatalogo(userUid),
        fetchAdminStatus(userUid),
      ]);
      setPedidos(peds);
      setCatalogo(cats);
      setSystemStatus(st);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao carregar dados administrativos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setErrorMsg(null);
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(`Erro de autenticação Google: ${err?.message}`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setSelectedPedido(null);
    setEditingItem(null);
  };

  const handleCopyUid = () => {
    if (currentUser?.uid) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  // Re-run AI processing
  const handleReprocessar = async (pedidoId: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await reprocessarPedido(pedidoId, currentUser.uid);
      setSuccessMsg('Pedido reprocessado com sucesso!');
      await loadData(currentUser.uid);
      setSelectedPedido(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao reprocessar pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open order detail modal
  const handleOpenDetail = (p: Pedido & { proposta?: Proposta | null }) => {
    setSelectedPedido(p);
    setManualResumo(p.interpretacaoIA?.resumo || p.pedidoOriginal.slice(0, 100));
    // Pre-populate manual items from AI interpretation if available
    if (p.interpretacaoIA?.itens && p.interpretacaoIA.itens.length > 0) {
      setManualItems(
        p.interpretacaoIA.itens.map((i) => ({
          catalogoId: i.catalogoId,
          quantidade: i.quantidade && i.quantidade > 0 ? i.quantidade : 1,
        }))
      );
    } else {
      setManualItems(catalogo.length > 0 ? [{ catalogoId: catalogo[0].id, quantidade: 1 }] : []);
    }
  };

  // Approve manual proposal
  const handleAprovarProposta = async () => {
    if (!selectedPedido || !currentUser) return;
    setIsApproving(true);
    setErrorMsg(null);
    try {
      await aprovarPropostaManual(
        {
          pedidoId: selectedPedido.id,
          itens: manualItems,
          resumoAmbito: manualResumo,
        },
        currentUser.uid
      );
      setSuccessMsg('Proposta aprovada e gerada com sucesso! Notificação enviada ao aluno.');
      await loadData(currentUser.uid);
      setSelectedPedido(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao aprovar proposta.');
    } finally {
      setIsApproving(false);
    }
  };

  // Re-send notification
  const handleReenviarNotificacao = async (propostaId: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await reenviarNotificacao(propostaId, currentUser.uid);
      setSuccessMsg('Notificação reenviada com sucesso para o email do aluno!');
      await loadData(currentUser.uid);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao reenviar notificação.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save catalog item
  const handleSaveCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !currentUser) return;
    setIsSavingItem(true);
    setErrorMsg(null);
    try {
      await saveAdminCatalogoItem(editingItem, currentUser.uid);
      setSuccessMsg('Item do catálogo guardado com sucesso!');
      setEditingItem(null);
      await loadData(currentUser.uid);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao guardar item do catálogo.');
    } finally {
      setIsSavingItem(false);
    }
  };

  const filteredPedidos = pedidos.filter((p) => {
    if (filterStatus === 'Todos') return true;
    return p.status === filterStatus;
  });

  const formatEuro = (cents?: number) => {
    if (typeof cents !== 'number') return '—';
    return (cents / 100).toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const statusBadge = (st: EstadoPedido) => {
    switch (st) {
      case 'Proposta criada':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Necessita de revisão':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Em análise':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'Erro':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const notifBadge = (st?: string) => {
    switch (st) {
      case 'Aceite pelo serviço':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Falhou':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Não configurado':
        return 'bg-slate-500/20 text-slate-400 border-slate-600/40';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Loja</span>
          </a>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 font-black text-xs">
              EP
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                <span>Administração de Propostas</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Área do Aluno
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200">
                  {currentUser.displayName || currentUser.email}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
                  <span>UID: {currentUser.uid.slice(0, 10)}...</span>
                  <button
                    onClick={handleCopyUid}
                    title="Copiar UID para configurar ADMIN_UID"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Terminar sessão"
                className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Google</span>
            </button>
          )}
        </div>
      </header>

      {/* Classroom Mode Notice (Mandatory per Section 8 & 9) */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-8 py-2.5 text-xs text-cyan-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Modo de aula:</strong> as notificações são enviadas apenas para o email do
            aluno ({systemStatus?.values?.emailAluno || 'EMAIL_ALUNO'}). Os clientes não recebem
            emails.
          </span>
        </div>

        {currentUser && (
          <button
            onClick={() => loadData(currentUser.uid)}
            disabled={isLoading}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        )}
      </div>

      {copiedUid && (
        <div className="fixed top-16 right-6 z-50 p-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-xl animate-in fade-in">
          UID copiado para a área de transferência!
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feedback Banners */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* If Not Signed In */}
        {!currentUser && !authLoading && (
          <div className="max-w-md mx-auto text-center py-20 px-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Autenticação de Administrador</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Inicie sessão com a sua conta Google através do Firebase Authentication para aceder à
              gestão de pedidos, cálculo de propostas e catálogo de produtos.
            </p>
            <button
              onClick={handleLogin}
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar com conta Google</span>
            </button>
          </div>
        )}

        {/* If Signed In */}
        {currentUser && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 gap-6 text-sm font-bold">
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'pedidos'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Pedidos e Propostas ({pedidos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('catalogo')}
                className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'catalogo'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Catálogo e Preços ({catalogo.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'status'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Estado e Configurações</span>
              </button>
            </div>

            {/* TAB 1: Pedidos */}
            {activeTab === 'pedidos' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {[
                      'Todos',
                      'Recebido',
                      'Em análise',
                      'Necessita de revisão',
                      'Proposta criada',
                      'Erro',
                    ].map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                          filterStatus === st
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-500">
                    A exibir {filteredPedidos.length} pedido(s)
                  </span>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4 font-bold">Data</th>
                          <th className="py-3 px-4 font-bold">Cliente / Email</th>
                          <th className="py-3 px-4 font-bold">Resumo do Pedido</th>
                          <th className="py-3 px-4 font-bold text-center">Estado do Pedido</th>
                          <th className="py-3 px-4 font-bold text-right">Valor da Proposta</th>
                          <th className="py-3 px-4 font-bold text-center">Notificação ao Aluno</th>
                          <th className="py-3 px-4 font-bold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredPedidos.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-500">
                              Nenhum pedido encontrado neste estado.
                            </td>
                          </tr>
                        ) : (
                          filteredPedidos.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                              {/* Data */}
                              <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                                {new Date(p.createdAt).toLocaleDateString('pt-PT', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>

                              {/* Cliente / Email */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-bold text-white">{p.nome}</div>
                                <div className="text-[11px] text-slate-400">{p.email}</div>
                              </td>

                              {/* Resumo */}
                              <td className="py-3.5 px-4 max-w-xs">
                                <p className="truncate text-slate-300">
                                  {p.interpretacaoIA?.resumo || p.pedidoOriginal}
                                </p>
                              </td>

                              {/* Estado do Pedido */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusBadge(
                                    p.status
                                  )}`}
                                >
                                  {p.status}
                                </span>
                              </td>

                              {/* Valor */}
                              <td className="py-3.5 px-4 text-right font-bold text-white whitespace-nowrap">
                                {p.proposta ? formatEuro(p.proposta.total) : '—'}
                              </td>

                              {/* Notificação ao Aluno */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                {p.proposta ? (
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${notifBadge(
                                      p.proposta.estadoNotificacao
                                    )}`}
                                  >
                                    {p.proposta.estadoNotificacao}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>

                              {/* Ações */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenDetail(p)}
                                    className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Ver Detalhe</span>
                                  </button>

                                  {p.proposta?.token && (
                                    <a
                                      href={`/proposta/${p.proposta.token}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                                      title="Abrir página pública da proposta"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Catálogo */}
            {activeTab === 'catalogo' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    O catálogo é a Knowledge Base comercial da loja e a fonte única de verdade para
                    os preços. As alterações não afetam propostas já emitidas.
                  </p>
                  <button
                    onClick={() =>
                      setEditingItem({
                        nome: '',
                        descricao: '',
                        unidade: 'unidade',
                        precoUnitario: 1000,
                        ativo: true,
                        condicoes: '',
                      })
                    }
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalogo.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        cat.ativo
                          ? 'bg-slate-900 border-slate-800'
                          : 'bg-slate-950/60 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-sm text-white">{cat.nome}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            cat.ativo
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {cat.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                        {cat.descricao}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Preço</span>
                          <span className="font-bold text-cyan-400 text-base">
                            {formatEuro(cat.precoUnitario)}
                          </span>
                          <span className="text-slate-500 text-[11px] ml-1">/{cat.unidade}</span>
                        </div>

                        <button
                          onClick={() => setEditingItem(cat)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Status & Diagnósticos */}
            {activeTab === 'status' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Configuração de Variáveis e Secrets</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-white">GEMINI_API_KEY</div>
                        <div className="text-[11px] text-slate-400">Interpretação por IA</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          systemStatus?.configured?.geminiApiKey
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {systemStatus?.configured?.geminiApiKey ? 'Configurado' : 'Em Falta'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-white">RESEND_API_KEY</div>
                        <div className="text-[11px] text-slate-400">Notificações internas ao aluno</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          systemStatus?.configured?.resendApiKey
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {systemStatus?.configured?.resendApiKey ? 'Configurado' : 'Pendente no Secrets'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-white">EMAIL_ALUNO</div>
                        <div className="text-[11px] text-slate-400">
                          {systemStatus?.values?.emailAluno || 'Email associado à conta Resend'}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          systemStatus?.configured?.emailAluno
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {systemStatus?.configured?.emailAluno ? 'Configurado' : 'Pendente no Secrets'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-white">ADMIN_UID</div>
                        <div className="text-[11px] text-slate-400">Restrição de segurança RBAC</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          systemStatus?.configured?.adminUid
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {systemStatus?.configured?.adminUid ? 'Configurado' : 'Opcional / Pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Instruções de Configuração para o Aluno</span>
                  </h3>

                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>
                      <strong>Conta Resend:</strong> Crie conta em{' '}
                      <a
                        href="https://resend.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline"
                      >
                        resend.com
                      </a>{' '}
                      com o mesmo email que usa como <code className="text-white">EMAIL_ALUNO</code>.
                    </li>
                    <li>
                      <strong>API Key Resend:</strong> Crie uma API key no Resend e guarde-a nos
                      Secrets como <code className="text-white">RESEND_API_KEY</code>.
                    </li>
                    <li>
                      <strong>UID de Administrador:</strong> Copie o seu UID{' '}
                      <code className="text-cyan-400">({currentUser.uid})</code> e defina nos
                      Secrets como <code className="text-white">ADMIN_UID</code>.
                    </li>
                    <li>
                      <strong>Cloud Firestore:</strong> Confirme a ativação da API Firestore na
                      Google Cloud Console para persistência na cloud.
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Detalhes do Pedido & Resolução Manual */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Detalhe do Pedido • {selectedPedido.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedPedido.nome}</h3>
                <div className="text-xs text-slate-400">{selectedPedido.email}</div>
              </div>
              <button
                onClick={() => setSelectedPedido(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Texto original */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Texto Original do Pedido
              </h4>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedPedido.pedidoOriginal}
              </div>
            </div>

            {/* Interpretação IA */}
            {selectedPedido.interpretacaoIA && (
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Interpretação Estruturada por Inteligência Artificial</span>
                </div>

                <div className="text-xs text-slate-200">
                  <strong>Resumo:</strong> {selectedPedido.interpretacaoIA.resumo}
                </div>

                {selectedPedido.interpretacaoIA.motivoRevisao && (
                  <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    <strong>Motivo de Revisão:</strong>{' '}
                    {selectedPedido.interpretacaoIA.motivoRevisao}
                  </div>
                )}

                {selectedPedido.interpretacaoIA.informacaoEmFalta &&
                  selectedPedido.interpretacaoIA.informacaoEmFalta.length > 0 && (
                    <div className="text-xs text-slate-300">
                      <strong>Informação em Falta:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
                        {selectedPedido.interpretacaoIA.informacaoEmFalta.map((info, idx) => (
                          <li key={idx}>{info}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Proposta Emitida (se existir) */}
            {selectedPedido.proposta && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Proposta Emitida • {selectedPedido.proposta.numeroProposta}
                  </span>
                  <span className="text-lg font-black text-white">
                    {formatEuro(selectedPedido.proposta.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>
                    Estado Notificação: <strong>{selectedPedido.proposta.estadoNotificacao}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReenviarNotificacao(selectedPedido.proposta!.id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3 text-cyan-400" />
                      <span>Reenviar Notificação</span>
                    </button>
                    <a
                      href={`/proposta/${selectedPedido.proposta.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver Proposta</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Resolução Manual / Ajuste de Itens (se necessitar de revisão ou reprocessamento) */}
            {selectedPedido.status === 'Necessita de revisão' && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span>Resolução Manual de Proposta</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Resumo do Âmbito da Proposta
                    </label>
                    <input
                      type="text"
                      value={manualResumo}
                      onChange={(e) => setManualResumo(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">
                      Itens do Catálogo
                    </label>
                    {manualItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <select
                          value={item.catalogoId}
                          onChange={(e) => {
                            const next = [...manualItems];
                            next[idx].catalogoId = e.target.value;
                            setManualItems(next);
                          }}
                          className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                        >
                          {catalogo.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nome} ({formatEuro(c.precoUnitario)}/{c.unidade})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={(e) => {
                            const next = [...manualItems];
                            next[idx].quantidade = Number(e.target.value) || 1;
                            setManualItems(next);
                          }}
                          className="w-20 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white text-center"
                        />
                        <button
                          type="button"
                          onClick={() => setManualItems(manualItems.filter((_, i) => i !== idx))}
                          className="p-2 text-rose-400 hover:bg-slate-800 rounded-lg text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setManualItems([
                          ...manualItems,
                          { catalogoId: catalogo[0]?.id || '', quantidade: 1 },
                        ])
                      }
                      className="text-xs text-cyan-400 hover:underline font-semibold"
                    >
                      + Adicionar outro item
                    </button>
                  </div>

                  <button
                    onClick={handleAprovarProposta}
                    disabled={isApproving || manualItems.length === 0}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isApproving ? (
                      <span>A calcular e aprovar...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprovar e Emitir Proposta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Reprocess Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => handleReprocessar(selectedPedido.id)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Repetir Interpretação IA</span>
              </button>

              <button
                onClick={() => setSelectedPedido(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar / Editar Item de Catálogo */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveCatalogItem}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingItem.id ? 'Editar Item do Catálogo' : 'Novo Item do Catálogo'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Produto/Serviço</label>
              <input
                type="text"
                required
                value={editingItem.nome || ''}
                onChange={(e) => setEditingItem({ ...editingItem, nome: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Descrição</label>
              <textarea
                required
                rows={3}
                value={editingItem.descricao || ''}
                onChange={(e) => setEditingItem({ ...editingItem, descricao: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Unidade</label>
                <select
                  value={editingItem.unidade || 'unidade'}
                  onChange={(e) => setEditingItem({ ...editingItem, unidade: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="unidade">Unidade</option>
                  <option value="hora">Hora</option>
                  <option value="pacote">Pacote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Preço em cêntimos EUR</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editingItem.precoUnitario || 0}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, precoUnitario: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Ex: 8999 = 89,99 €
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Condições / Limitações</label>
              <input
                type="text"
                value={editingItem.condicoes || ''}
                onChange={(e) => setEditingItem({ ...editingItem, condicoes: e.target.value })}
                placeholder="Ex: Preço de demonstração. Ativação digital."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="item-ativo-check"
                checked={editingItem.ativo !== false}
                onChange={(e) => setEditingItem({ ...editingItem, ativo: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500"
              />
              <label htmlFor="item-ativo-check" className="text-xs font-medium text-slate-300">
                Item ativo no catálogo para interpretação por IA
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingItem}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-all"
              >
                {isSavingItem ? 'A guardar...' : 'Guardar Item'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
