import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, FileText, Sparkles, Shield, Clock } from 'lucide-react';
import { submitPedidoProposta } from '../services/proposalService';

interface ProposalFormSectionProps {
  darkMode: boolean;
}

export const ProposalFormSection: React.FC<ProposalFormSectionProps> = ({ darkMode }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [pedido, setPedido] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Reset feedback
    setErrorMessage(null);
    setSuccessMessage(null);

    // Frontend validation
    const nomeTrim = nome.trim();
    const emailTrim = email.trim();
    const pedidoTrim = pedido.trim();

    if (!nomeTrim) {
      setErrorMessage('Por favor introduza o seu nome.');
      return;
    }
    if (nomeTrim.length < 2 || nomeTrim.length > 100) {
      setErrorMessage('O nome deve ter entre 2 e 100 caracteres.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrim || !emailRegex.test(emailTrim)) {
      setErrorMessage('Por favor introduza um endereço de email válido.');
      return;
    }

    if (!pedidoTrim) {
      setErrorMessage('Por favor descreva o seu pedido de proposta.');
      return;
    }
    if (pedidoTrim.length < 10) {
      setErrorMessage('O pedido deve conter pelo menos 10 caracteres para podermos analisar os itens.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await submitPedidoProposta({
        nome: nomeTrim,
        email: emailTrim,
        pedido: pedidoTrim,
      });

      // Strict message per Section 3: "O seu pedido foi recebido com sucesso."
      setSuccessMessage(response.message || 'O seu pedido foi recebido com sucesso.');
      setNome('');
      setEmail('');
      setPedido('');
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Ocorreu um erro ao enviar o seu pedido. Por favor tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="pedido-proposta"
      className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors duration-300 ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/80 border-slate-200'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Processamento Inteligente</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Pedido de proposta
          </h2>
          <p
            className={`max-w-2xl mx-auto text-sm sm:text-base leading-relaxed ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Indique os produtos, licenças de jogos ou serviços de publicação e consultoria que
            pretende. A nossa inteligência artificial interpreta os detalhes do pedido e calcula a
            proposta comercial com os preços do catálogo oficial.
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`p-6 sm:p-10 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
            darkMode
              ? 'bg-slate-950/90 border-slate-800 shadow-cyan-950/20'
              : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}
        >
          {/* Success Banner */}
          {successMessage && (
            <div className="mb-8 p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-start gap-3.5 animate-in fade-in duration-300">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-emerald-300">{successMessage}</h4>
                <p className="text-xs text-emerald-400/90 mt-1 leading-relaxed">
                  Os detalhes foram registados no sistema. O nosso catálogo e o motor de
                  inteligência artificial analisam os itens indicados e geram a respetiva proposta
                  comercial.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Aviso: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Campo 1: Nome */}
              <div>
                <label
                  htmlFor="proposta-nome"
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Nome <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  id="proposta-nome"
                  name="nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ex: David Coelho"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    darkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Campo 2: Email */}
              <div>
                <label
                  htmlFor="proposta-email"
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Email <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="email"
                  id="proposta-email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ex: contacto@empresa.pt"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    darkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Campo 3: Pedido */}
            <div>
              <label
                htmlFor="proposta-pedido"
                className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Pedido <span className="text-cyan-400">*</span>
              </label>
              <textarea
                id="proposta-pedido"
                name="pedido"
                required
                rows={5}
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                disabled={isLoading}
                placeholder="Ex: Gostaria de adquirir 5 licenças do EA SPORTS FC 27 para a nossa equipa e contratar o pacote de consultoria de integração cross-play da Epic Online Services para o nosso próximo lançamento..."
                className={`w-full px-4 py-3 rounded-xl border text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <p
                className={`text-[11px] mt-1.5 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Pode especificar quantidades e os títulos ou serviços que pretende do catálogo.
              </p>
            </div>

            {/* Privacy brief note per Section 3 */}
            <div
              className={`p-3.5 rounded-xl border text-[11px] leading-relaxed flex items-center gap-2.5 ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Os seus dados serão utilizados exclusivamente para analisar o pedido e calcular a
                respetiva proposta comercial. Não é necessário criar conta de cliente para pedir
                proposta.
              </span>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Interpretação e cálculo imediato por IA</span>
              </div>

              <button
                type="submit"
                id="submit-proposta-btn"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>A processar pedido...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Pedir proposta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
