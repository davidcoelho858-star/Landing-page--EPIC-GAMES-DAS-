export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isAction?: boolean;
  actionType?: 'schedule_meeting' | 'view_deals' | 'free_vault' | 'api_key';
}

const STORAGE_KEY_GEMINI = 'egs_custom_gemini_api_key';

export const getStoredApiKey = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY_GEMINI) || '';
  } catch {
    return '';
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI);
    }
  } catch (e) {
    console.error('Falha ao salvar chave no localStorage:', e);
  }
};

export const checkServerApiHealth = async (): Promise<{ status: string; hasServerApiKey: boolean }> => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'error', hasServerApiKey: false };
    return await res.json();
  } catch {
    return { status: 'offline', hasServerApiKey: false };
  }
};

export const formatErrorMessage = (rawError: any): string => {
  const str = typeof rawError === 'string' ? rawError : (rawError?.message || JSON.stringify(rawError));
  
  // Try parsing embedded JSON error strings like '{"error":{"code":503,...}}'
  try {
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
          return 'Os servidores da Google estão com alta demanda temporária neste modelo. Por favor, tente novamente em instantes.';
        }
        if (parsed.error.code === 429) {
          return 'Limite de requisições temporário atingido. Por favor, aguarde alguns segundos e tente novamente.';
        }
        return parsed.error.message;
      }
    }
  } catch {
    // ignore json parse error
  }

  if (str.includes('503') || str.includes('high demand') || str.includes('UNAVAILABLE')) {
    return 'Os servidores da Google estão com alta demanda temporária neste modelo. Por favor, tente novamente em instantes.';
  }
  if (str.includes('429') || str.includes('RESOURCE_EXHAUSTED')) {
    return 'Limite de requisições por minuto atingido. Aguarde um instante e tente novamente.';
  }
  if (str.includes('API key not valid') || str.includes('401') || str.includes('403')) {
    return 'A chave de API do Gemini não é válida ou não tem permissões suficientes. Verifique a chave configurada no ícone de chave.';
  }

  return str;
};

export const sendChatMessage = async (
  messages: { role: string; content: string }[],
  customApiKey?: string
): Promise<{ reply: string; source: string }> => {
  const activeKey = customApiKey?.trim() || getStoredApiKey();

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      userApiKey: activeKey,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const rawMsg = data.error || 'Erro ao enviar mensagem para o assistente.';
    throw new Error(formatErrorMessage(rawMsg));
  }

  return data;
};
