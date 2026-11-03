import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  Key, 
  Bot, 
  User, 
  ChevronDown, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { sendChatMessage, ChatMessage, getStoredApiKey } from '../services/chatService';

interface ChatbotWidgetProps {
  darkMode: boolean;
  onOpenScheduler: (topic?: string) => void;
  onOpenApiKeyModal: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: 'Olá! 👋 Sou o Concierge IA da Epic Games Store.\n\nEstou aqui para te ajudar a encontrar as melhores ofertas (até 75% OFF), tirar dúvidas sobre o Vault de jogos 100% gratuitos, e **agendar demonstrações ou reuniões comerciais diretamente no seu Google Calendar**!\n\nComo posso te ajudar hoje?',
    timestamp: Date.now(),
  },
];

const SUGGESTIONS = [
  { label: '📅 Agendar Demonstração', action: 'schedule', prompt: 'Gostaria de agendar uma reunião de demonstração da loja.' },
  { label: '🔥 Melhores Ofertas de Hoje', action: 'deals', prompt: 'Quais são os maiores descontos e destaques ativos hoje?' },
  { label: '🎁 Como funciona o Jogo Grátis?', action: 'free', prompt: 'Os jogos semanais gratuitos são realmente grátis para sempre?' },
  { label: '🤝 Parceria de Publicação 88/12', action: 'partnership', prompt: 'Quero saber mais sobre como publicar jogos com a divisão 88/12.' },
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  darkMode,
  onOpenScheduler,
  onOpenApiKeyModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // Check if the user is asking to schedule a meeting
    const lower = text.toLowerCase();
    const isMeetingIntent = lower.includes('agendar') || 
                           lower.includes('reuni') || 
                           lower.includes('demo') || 
                           lower.includes('marcar') || 
                           lower.includes('call') || 
                           lower.includes('calendário') ||
                           lower.includes('calendar');

    try {
      const response = await sendChatMessage(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        getStoredApiKey()
      );

      const reply = (response?.reply || '').trim() || 'Olá! Como posso ajudar com as ofertas da Epic Games ou com o agendamento de reuniões no Google Calendar?';

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        isAction: isMeetingIntent,
        actionType: isMeetingIntent ? 'schedule_meeting' : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Erro no chatbot:', err);
      // Fallback friendly message explaining error or offering schedule
      const errMsg = (err?.message || '').trim() || 'Não foi possível consultar a IA neste instante.';
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: isMeetingIntent
          ? 'Com certeza! Você pode agendar sua reunião ou demonstração agora mesmo com sincronização direta no Google Calendar através do botão abaixo:'
          : `${errMsg}\n\nVocê pode tentar enviar novamente em alguns segundos, conferir a sua chave Gemini no ícone de chave acima, ou agendar uma reunião diretamente pelo botão abaixo:`,
        timestamp: Date.now(),
        isAction: true,
        actionType: isMeetingIntent ? 'schedule_meeting' : 'api_key',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: typeof SUGGESTIONS[0]) => {
    if (suggestion.action === 'schedule') {
      onOpenScheduler(suggestion.prompt);
    } else {
      handleSendMessage(suggestion.prompt);
    }
  };

  return (
    <div id="chatbot-widget-container" className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="chatbot-trigger-button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir assistente inteligente e agendador"
          className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-slate-950 font-black shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-slate-950 text-cyan-400 flex items-center justify-center shadow-inner">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <div className="text-xs font-black tracking-tight leading-none text-slate-950">
              Assistente IA & Reuniões
            </div>
            <div className="text-[10px] font-semibold text-slate-800 opacity-90 leading-tight mt-0.5">
              Gemini + Google Calendar
            </div>
          </div>
          {/* Notification ping */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          id="chatbot-window"
          className={`w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 transition-colors ${
            darkMode 
              ? 'bg-slate-900 border-slate-700 text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between transition-colors ${
            darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                  <span>Epic Concierge IA</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </h4>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Gemini 3.8 Flash</span>
                  <span>•</span>
                  <span>Google Calendar</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* API Key Modal Button */}
              <button
                onClick={onOpenApiKeyModal}
                title="Configurar chave de API Gemini"
                className={`p-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-cyan-400' 
                    : 'border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-cyan-600'
                }`}
              >
                <Key className="w-4 h-4" />
              </button>

              {/* Direct Schedule Meeting Button */}
              <button
                onClick={() => onOpenScheduler()}
                title="Agendar Reunião no Google Calendar"
                className={`p-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-emerald-400' 
                    : 'border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-emerald-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' 
                    : 'border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className={`px-4 py-2 border-b flex gap-1.5 overflow-x-auto no-scrollbar text-[11px] ${
            darkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                  item.action === 'schedule'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : darkMode
                      ? 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-none shadow-md shadow-blue-500/15'
                      : darkMode
                        ? 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none'
                        : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}>
                    <div className="whitespace-pre-line">
                      {msg.content || 'Mensagem sem texto.'}
                    </div>

                    {/* Interactive Action Card inside Message */}
                    {msg.isAction && msg.actionType === 'schedule_meeting' && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <button
                          onClick={() => onOpenScheduler()}
                          className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Abrir Agendador de Reunião</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {msg.isAction && msg.actionType === 'api_key' && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <button
                          onClick={onOpenApiKeyModal}
                          className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Configurar Chave Gemini</span>
                        </button>
                      </div>
                    )}

                    <div className={`text-[10px] mt-1.5 ${isUser ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className={`p-3 rounded-2xl rounded-bl-none text-xs flex items-center gap-2 ${
                  darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Consultando inteligência artificial...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className={`p-3 border-t transition-colors ${
            darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="chatbot-input-field"
                placeholder="Pergunte sobre ofertas, jogos grátis ou agendamento..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className={`flex-1 px-3.5 py-2.5 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Enviar mensagem"
                className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <button
                onClick={() => onOpenScheduler()}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
              >
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>Agendar no Google Calendar</span>
              </button>
              <button
                onClick={onOpenApiKeyModal}
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <Key className="w-3 h-3 text-cyan-400" />
                <span>Chave Gemini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
