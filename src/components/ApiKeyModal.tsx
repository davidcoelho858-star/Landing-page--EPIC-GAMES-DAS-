import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Server,
  Save,
  Trash2
} from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, checkServerApiHealth, sendChatMessage } from '../services/chatService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [hasServerKey, setHasServerKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setTestResult(null);
      checkServerApiHealth().then((res) => {
        setHasServerKey(res.hasServerApiKey);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    if (onKeyUpdated) onKeyUpdated(Boolean(apiKey.trim() || hasServerKey));
    setTestResult({
      success: true,
      message: apiKey.trim() ? 'Chave personalizada salva com sucesso!' : 'Chave personalizada removida. Usando chave do servidor se disponível.',
    });
  };

  const handleClear = () => {
    setApiKey('');
    setStoredApiKey('');
    if (onKeyUpdated) onKeyUpdated(hasServerKey);
    setTestResult({
      success: true,
      message: 'Chave removida.',
    });
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await sendChatMessage(
        [{ role: 'user', content: 'Olá! Responda apenas com: "Conexão com Gemini estabelecida com sucesso."' }],
        apiKey.trim() || undefined
      );
      setTestResult({
        success: true,
        message: response.reply,
      });
      if (onKeyUpdated) onKeyUpdated(true);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao testar chave de API.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div 
      id="api-key-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="api-key-modal-card"
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl relative transition-all ${
          darkMode 
            ? 'bg-slate-900 border-slate-700 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors ${
            darkMode 
              ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' 
              : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">
              Configuração da Chave de API
            </h3>
            <span className="text-xs text-cyan-500 font-bold uppercase tracking-wider">
              Gemini 3.8 Flash • Chatbot IA
            </span>
          </div>
        </div>

        <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          O chatbot inteligente utiliza o modelo <strong>Gemini 3.8 Flash</strong> para responder dúvidas e auxiliar no agendamento de reuniões. Você pode utilizar a chave configurada no servidor ou fornecer sua própria chave pessoal.
        </p>

        {/* Server Status Indicator */}
        <div className={`mt-4 p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
          hasServerKey 
            ? darkMode ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>
              Chave do Servidor (GEMINI_API_KEY):{' '}
              <strong>{hasServerKey ? 'Ativa no backend' : 'Não detectada'}</strong>
            </span>
          </div>
          {hasServerKey && (
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
              Pronto
            </span>
          )}
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-3">
          <label htmlFor="custom-api-key-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Chave de API Personalizada (Opcional):
          </label>
          <div className="relative">
            <input
              type="password"
              id="custom-api-key-input"
              placeholder="Cole sua chave AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={`w-full px-4 py-3 text-xs sm:text-sm font-mono rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                darkMode 
                  ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>A chave é enviada diretamente nas requisições do chat.</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Obter chave no Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2 ${
            testResult.success
              ? darkMode ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : darkMode ? 'bg-red-950/40 border-red-500/40 text-red-300' : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            )}
            <div className="flex-1 min-w-0 break-words leading-relaxed font-medium">
              {testResult.message}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Chave</span>
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-3 py-2.5 rounded-xl font-semibold text-xs border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>

          <button
            onClick={handleTestKey}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
