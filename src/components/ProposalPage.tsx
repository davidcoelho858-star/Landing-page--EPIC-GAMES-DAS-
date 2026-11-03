import React, { useEffect, useState } from 'react';
import {
  FileText,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Mail,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { fetchPropostaPublica } from '../services/proposalService';
import type { PublicProposalData } from '../types/proposalTypes';

interface ProposalPageProps {
  token: string;
}

export const ProposalPage: React.FC<ProposalPageProps> = ({ token }) => {
  const [proposta, setProposta] = useState<PublicProposalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent search engines from indexing quote pages
    let metaRobots = document.querySelector("meta[name='robots']");
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPropostaPublica(token);
        setProposta(data);
      } catch (err: any) {
        setError(err?.message || 'Proposta não encontrada ou link expirado.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  const formatEuro = (cents: number) => {
    return (cents / 100).toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à loja</span>
        </a>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-black tracking-tight text-white uppercase">
            Epic Games Store • Propostas
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-400">A carregar os detalhes da proposta comercial...</p>
          </div>
        )}

        {error && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Proposta Indisponível</h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all"
            >
              Regressar à página inicial
            </a>
          </div>
        )}

        {proposta && !isLoading && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Proposta Comercial Formal</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {proposta.numeroProposta}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Emitida para:{' '}
                    <strong className="text-slate-200">{proposta.clienteNome || 'Cliente'}</strong>
                  </p>
                </div>

                <div className="text-right text-xs space-y-1">
                  <div className="text-slate-400">
                    Data de emissão: <span className="text-white font-medium">{formatDate(proposta.createdAt)}</span>
                  </div>
                  <div className="text-slate-400">
                    Válida até: <span className="text-cyan-400 font-bold">{formatDate(proposta.validade)}</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">Validade comercial: 15 dias</div>
                </div>
              </div>

              {/* Scope Summary */}
              <div className="mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Resumo do Âmbito
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {proposta.resumoAmbito}
                </p>
              </div>

              {/* Demo Badge */}
              {proposta.isDemonstracao && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Exercício de Demonstração:</strong> Esta proposta foi calculada
                    automaticamente pelo backend através do catálogo de teste do exercício de
                    aprendizagem.
                  </span>
                </div>
              )}
            </div>

            {/* Line Items Table Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
              <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Discriminação de Produtos e Serviços</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-bold">Item / Descrição</th>
                      <th className="pb-3 font-bold text-center">Unidade</th>
                      <th className="pb-3 font-bold text-center">Qtd.</th>
                      <th className="pb-3 font-bold text-right">Preço Unit.</th>
                      <th className="pb-3 font-bold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {proposta.itens.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="font-bold text-white text-sm">{item.nome}</div>
                          <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                            {item.descricao}
                          </div>
                          {item.condicoes && (
                            <div className="text-[10px] text-cyan-400/80 mt-1 italic">
                              Condição: {item.condicoes}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-2 text-center text-slate-300 capitalize">
                          {item.unidade}
                        </td>
                        <td className="py-4 px-2 text-center font-bold text-white">
                          {item.quantidade}
                        </td>
                        <td className="py-4 px-2 text-right text-slate-300">
                          {formatEuro(item.precoUnitario)}
                        </td>
                        <td className="py-4 pl-2 text-right font-bold text-white text-sm">
                          {formatEuro(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total sem IVA Highlight */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-slate-300">Condições de Pagamento: </span>
                  Valores em EUR, sem IVA incluído. Não são misturados pagamentos únicos com
                  mensalidades.
                </div>

                <div className="text-right bg-slate-950/80 px-6 py-4 rounded-2xl border border-slate-800 min-w-[240px]">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total sem IVA
                  </div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 mt-1">
                    {formatEuro(proposta.total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-400 space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Condições e Validade
              </h4>
              <p>{proposta.condicoes}</p>
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Epic Games Store — Departamento Comercial & Parcerias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>support@epicgames.com</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
