import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  initDatabase,
  getCatalogoAtivo,
  getAllCatalogo,
  saveCatalogoItem,
  savePedido,
  getPedido,
  getAllPedidos,
  updatePedido,
  saveProposta,
  getPropostaByToken,
  getProposta,
  getAllPropostas,
  updateProposta,
} from './server/db';
import { interpretarPedidoComGemini } from './server/geminiService';
import {
  calcularPropostaAPartirDeInterpretacao,
  recalcularPropostaManual,
} from './server/proposalCalculator';
import { enviarNotificacaoAlunoResend } from './server/resendService';
import type { CatalogoItem, Pedido, Proposta } from './src/types/proposalTypes';

dotenv.config();

// Rate limiter / anti-spam for public quote submissions
const submissionIpTimestamps = new Map<string, number[]>();
function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = (submissionIpTimestamps.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  submissionIpTimestamps.set(ip, timestamps);
  return true;
}

// Simple email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Initialize DB and bootstrap demo catalog if empty
  await initDatabase().catch((e) => {
    console.error('Falha ao inicializar base de dados:', e);
  });

  // Health and System Diagnostics Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
      hasResendApiKey: Boolean(
        process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'MY_RESEND_API_KEY'
      ),
      emailAluno: process.env.EMAIL_ALUNO || null,
      adminUidConfigured: Boolean(process.env.ADMIN_UID),
      appUrl: process.env.APP_URL || process.env.APP_BASE_URL || null,
    });
  });

  // ==========================================
  // 1. PUBLIC: Pedido de Proposta (Formulário)
  // ==========================================
  app.post('/api/pedidos', async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Demasiadas tentativas de envio. Por favor aguarde um momento antes de tentar novamente.',
      });
    }

    try {
      const { nome, email, pedido } = req.body;

      // Validation
      const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
      const emailLimpo = typeof email === 'string' ? email.trim() : '';
      const pedidoTexto = typeof pedido === 'string' ? pedido.trim() : '';

      if (!nomeLimpo || nomeLimpo.length < 2 || nomeLimpo.length > 100) {
        return res.status(400).json({ error: 'O nome é obrigatório (entre 2 e 100 caracteres).' });
      }

      if (!emailLimpo || !EMAIL_REGEX.test(emailLimpo) || emailLimpo.length > 150) {
        return res.status(400).json({ error: 'Insira um endereço de email com formato válido.' });
      }

      if (!pedidoTexto || pedidoTexto.length < 5 || pedidoTexto.length > 5000) {
        return res.status(400).json({
          error: 'Por favor descreva o seu pedido com mais detalhe (entre 5 e 5000 caracteres).',
        });
      }

      const id = `ped_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      // Step 1: Save initial order in Firestore with status "Recebido"
      const novoPedido: Pedido = {
        id,
        nome: nomeLimpo,
        email: emailLimpo,
        pedidoOriginal: pedidoTexto,
        status: 'Recebido',
        createdAt: now,
        updatedAt: now,
      };

      await savePedido(novoPedido);

      // Step 2 & 3: Consult active catalog & interpret with Gemini asynchronously
      // (We execute processing right away and return the confirmed reception to user)
      const catalogoAtivo = await getCatalogoAtivo();

      try {
        await updatePedido(id, { status: 'Em análise' });

        const interpretacao = await interpretarPedidoComGemini(pedidoTexto, catalogoAtivo);

        // Code calculates proposal:
        const proposta = calcularPropostaAPartirDeInterpretacao(
          novoPedido,
          interpretacao,
          catalogoAtivo,
          process.env.APP_URL || process.env.APP_BASE_URL
        );

        if (proposta) {
          // Save calculated proposal
          await saveProposta(proposta);

          // Step 7: Send Resend notification internally to EMAIL_ALUNO
          const notifResult = await enviarNotificacaoAlunoResend(proposta, novoPedido.nome);

          // Update proposal with notification results
          await updateProposta(proposta.id, {
            estadoNotificacao: notifResult.status,
            notificacaoResendId: notifResult.id || null,
            notificacaoTentativaEm: notifResult.tentativaEm,
            notificacaoErro: notifResult.error || null,
          });

          // Update pedido with status "Proposta criada"
          await updatePedido(id, {
            status: 'Proposta criada',
            interpretacaoIA: interpretacao,
            propostaId: proposta.id,
            informacaoEmFalta: interpretacao.informacaoEmFalta || [],
            motivoRevisao: null,
            erroProcessamento: null,
          });
        } else {
          // Requires review because of ambiguities, missing quantity, or items out of catalog
          await updatePedido(id, {
            status: 'Necessita de revisão',
            interpretacaoIA: interpretacao,
            informacaoEmFalta: interpretacao.informacaoEmFalta || [],
            motivoRevisao:
              interpretacao.motivoRevisao ||
              'O pedido necessita de revisão manual antes de ser emitida uma proposta final.',
          });
        }
      } catch (err: any) {
        console.error(`[Processamento Pedido ${id}] Erro:`, err);
        await updatePedido(id, {
          status: 'Erro',
          erroProcessamento: err?.message || 'Falha ao processar pedido com o modelo de IA.',
        });
      }

      // Mandatory user message response as per Section 3:
      // "O seu pedido foi recebido com sucesso."
      // Never say "Enviámos a proposta para o seu email."
      return res.status(201).json({
        success: true,
        message: 'O seu pedido foi recebido com sucesso.',
        pedidoId: id,
      });
    } catch (error: any) {
      console.error('Erro na submissão do pedido:', error);
      return res.status(500).json({
        error: 'Ocorreu um erro ao registar o seu pedido. Por favor tente novamente.',
      });
    }
  });

  // ==========================================
  // 2. PUBLIC: Página Individual da Proposta
  // ==========================================
  app.get('/api/proposta/:token', async (req, res) => {
    try {
      const { token } = req.params;
      if (!token || token.length < 16) {
        return res.status(400).json({ error: 'Token de proposta inválido.' });
      }

      const proposta = await getPropostaByToken(token);
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada ou link expirado.' });
      }

      // Privacy: strictly return public-safe fields (never client email or raw internal prompt)
      res.json({
        numeroProposta: proposta.numeroProposta,
        clienteNome: proposta.clienteNome || 'Cliente',
        createdAt: proposta.createdAt,
        validade: proposta.validade,
        resumoAmbito: proposta.resumoAmbito,
        itens: proposta.itens,
        total: proposta.total, // cêntimos EUR
        condicoes: proposta.condicoes,
        isDemonstracao: proposta.isDemonstracao,
      });
    } catch (error: any) {
      console.error('Erro ao consultar proposta:', error);
      res.status(500).json({ error: 'Falha ao carregar a proposta comercial.' });
    }
  });

  // ==========================================
  // 3. ADMIN: Autenticação e Gestão Privada
  // ==========================================
  // Helper to verify admin authorization
  const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const adminUid = process.env.ADMIN_UID?.trim();
    const clientUid =
      (req.headers['x-admin-uid'] as string) ||
      (req.headers['authorization']?.replace('Bearer ', '') as string);

    // If ADMIN_UID is explicitly set in secrets, enforce strict match
    if (adminUid) {
      if (!clientUid || clientUid !== adminUid) {
        return res.status(403).json({
          error:
            'Acesso não autorizado. O UID deste utilizador não corresponde ao ADMIN_UID configurado nos Secrets.',
        });
      }
    }
    // If ADMIN_UID is not set yet, we allow authenticated Firebase user to inspect status
    next();
  };

  app.get('/api/admin/status', verifyAdmin, (_req, res) => {
    res.json({
      configured: {
        geminiApiKey: Boolean(
          process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
        ),
        resendApiKey: Boolean(
          process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'MY_RESEND_API_KEY'
        ),
        emailAluno: Boolean(process.env.EMAIL_ALUNO),
        adminUid: Boolean(process.env.ADMIN_UID),
        appBaseUrl: Boolean(process.env.APP_URL || process.env.APP_BASE_URL),
      },
      values: {
        emailAluno: process.env.EMAIL_ALUNO || null,
        geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        appUrl: process.env.APP_URL || process.env.APP_BASE_URL || null,
      },
    });
  });

  app.get('/api/admin/pedidos', verifyAdmin, async (_req, res) => {
    try {
      const pedidos = await getAllPedidos();
      const propostas = await getAllPropostas();
      const propostasMap = new Map(propostas.map((p) => [p.id, p]));

      const enriched = pedidos.map((p) => {
        const prop = p.propostaId ? propostasMap.get(p.propostaId) : null;
        return {
          ...p,
          proposta: prop || null,
        };
      });

      res.json(enriched);
    } catch (err: any) {
      console.error('Erro ao listar pedidos admin:', err);
      res.status(500).json({ error: 'Erro ao carregar lista de pedidos.' });
    }
  });

  app.get('/api/admin/catalogo', verifyAdmin, async (_req, res) => {
    try {
      const items = await getAllCatalogo();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao obter catálogo.' });
    }
  });

  app.post('/api/admin/catalogo', verifyAdmin, async (req, res) => {
    try {
      const { nome, descricao, unidade, precoUnitario, condicoes } = req.body;
      if (!nome || !descricao || !unidade || typeof precoUnitario !== 'number') {
        return res.status(400).json({ error: 'Campos obrigatórios inválidos.' });
      }

      const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const item: CatalogoItem = {
        id,
        nome: String(nome).trim(),
        descricao: String(descricao).trim(),
        unidade,
        precoUnitario: Math.round(precoUnitario),
        moeda: 'EUR',
        ativo: true,
        condicoes: condicoes ? String(condicoes).trim() : undefined,
        isDemonstracao: true,
        createdAt: now,
        updatedAt: now,
      };

      await saveCatalogoItem(item);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao guardar item no catálogo.' });
    }
  });

  app.put('/api/admin/catalogo/:id', verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, descricao, unidade, precoUnitario, ativo, condicoes } = req.body;

      const items = await getAllCatalogo();
      const existing = items.find((i) => i.id === id);
      if (!existing) {
        return res.status(404).json({ error: 'Item não encontrado no catálogo.' });
      }

      const updated: CatalogoItem = {
        ...existing,
        ...(nome ? { nome: String(nome).trim() } : {}),
        ...(descricao ? { descricao: String(descricao).trim() } : {}),
        ...(unidade ? { unidade } : {}),
        ...(typeof precoUnitario === 'number' ? { precoUnitario: Math.round(precoUnitario) } : {}),
        ...(typeof ativo === 'boolean' ? { ativo } : {}),
        ...(condicoes !== undefined ? { condicoes: String(condicoes).trim() } : {}),
        updatedAt: new Date().toISOString(),
      };

      await saveCatalogoItem(updated);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Falha ao atualizar item do catálogo.' });
    }
  });

  // Reprocess failed or pending order with Gemini
  app.post('/api/admin/reprocessar/:id', verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const pedido = await getPedido(id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      const catalogoAtivo = await getCatalogoAtivo();
      await updatePedido(id, { status: 'Em análise' });

      const interpretacao = await interpretarPedidoComGemini(pedido.pedidoOriginal, catalogoAtivo);

      const proposta = calcularPropostaAPartirDeInterpretacao(
        pedido,
        interpretacao,
        catalogoAtivo,
        process.env.APP_URL || process.env.APP_BASE_URL
      );

      if (proposta) {
        await saveProposta(proposta);
        const notifResult = await enviarNotificacaoAlunoResend(proposta, pedido.nome);

        await updateProposta(proposta.id, {
          estadoNotificacao: notifResult.status,
          notificacaoResendId: notifResult.id || null,
          notificacaoTentativaEm: notifResult.tentativaEm,
          notificacaoErro: notifResult.error || null,
        });

        await updatePedido(id, {
          status: 'Proposta criada',
          interpretacaoIA: interpretacao,
          propostaId: proposta.id,
          informacaoEmFalta: interpretacao.informacaoEmFalta || [],
          motivoRevisao: null,
          erroProcessamento: null,
        });
      } else {
        await updatePedido(id, {
          status: 'Necessita de revisão',
          interpretacaoIA: interpretacao,
          informacaoEmFalta: interpretacao.informacaoEmFalta || [],
          motivoRevisao:
            interpretacao.motivoRevisao ||
            'O pedido requer seleção manual de quantidades ou itens.',
        });
      }

      const updated = await getPedido(id);
      res.json(updated);
    } catch (err: any) {
      console.error('Erro ao reprocessar:', err);
      res.status(500).json({ error: err?.message || 'Erro ao reprocessar pedido com IA.' });
    }
  });

  // Manual resolution and approval of quotes under review
  app.post('/api/admin/proposta/aprovar', verifyAdmin, async (req, res) => {
    try {
      const { pedidoId, itens, resumoAmbito } = req.body;
      const pedido = await getPedido(pedidoId);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'Selecione pelo menos um item do catálogo.' });
      }

      const catalogoAtivo = await getCatalogoAtivo();
      const proposta = recalcularPropostaManual(
        pedido,
        itens,
        catalogoAtivo,
        resumoAmbito,
        process.env.APP_URL || process.env.APP_BASE_URL
      );

      await saveProposta(proposta);

      // Trigger Resend notification to EMAIL_ALUNO
      const notifResult = await enviarNotificacaoAlunoResend(proposta, pedido.nome);

      await updateProposta(proposta.id, {
        estadoNotificacao: notifResult.status,
        notificacaoResendId: notifResult.id || null,
        notificacaoTentativaEm: notifResult.tentativaEm,
        notificacaoErro: notifResult.error || null,
      });

      await updatePedido(pedidoId, {
        status: 'Proposta criada',
        propostaId: proposta.id,
        motivoRevisao: null,
      });

      res.json({ success: true, proposta });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erro ao aprovar proposta manualmente.' });
    }
  });

  // Resend notification with duplicate protection
  app.post('/api/admin/reenviar-notificacao/:propostaId', verifyAdmin, async (req, res) => {
    try {
      const { propostaId } = req.params;
      const proposta = await getProposta(propostaId);
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada.' });
      }

      // Protection against duplicate rapid sends (5 seconds window)
      if (proposta.notificacaoTentativaEm) {
        const lastTime = new Date(proposta.notificacaoTentativaEm).getTime();
        if (Date.now() - lastTime < 5000) {
          return res.status(429).json({
            error: 'Notificação já enviada recentemente. Aguarde alguns segundos.',
          });
        }
      }

      const result = await enviarNotificacaoAlunoResend(proposta, proposta.clienteNome);

      const updated = await updateProposta(propostaId, {
        estadoNotificacao: result.status,
        notificacaoResendId: result.id || proposta.notificacaoResendId || null,
        notificacaoTentativaEm: result.tentativaEm,
        notificacaoErro: result.error || null,
      });

      res.json({ success: true, proposta: updated, result });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erro ao reenviar notificação.' });
    }
  });

  // ==========================================
  // 4. CHATBOT: IA Concierge Endpoint
  // ==========================================
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userApiKey, systemInstruction } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'O histórico de mensagens é obrigatório.' });
      }

      const activeApiKey =
        typeof userApiKey === 'string' && userApiKey.trim().length > 0
          ? userApiKey.trim()
          : process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
          ? process.env.GEMINI_API_KEY
          : '';

      if (!activeApiKey) {
        return res.status(400).json({
          error:
            'Chave de API Gemini não configurada no servidor. Configure a chave GEMINI_API_KEY no painel de Secrets.',
          requiresKey: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const defaultSystemInstruction = `Você é o Concierge e Especialista Oficial da Epic Games Store.
Você ajuda clientes com informações sobre jogos, propostas comerciais, vault de jogos gratuitos e agendamento de reuniões.
Responda sempre em português de Portugal (pt-PT) com cortesia, clareza e precisão.`;

      const formattedContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
      let hasStarted = false;

      for (const m of messages) {
        const textContent = (typeof m.content === 'string' ? m.content : '').trim();
        if (!textContent) continue;
        const role = m.role === 'assistant' ? 'model' : 'user';

        if (!hasStarted) {
          if (role === 'user') {
            hasStarted = true;
            formattedContents.push({ role: 'user', parts: [{ text: textContent }] });
          }
        } else {
          const lastEntry = formattedContents[formattedContents.length - 1];
          if (lastEntry.role === role) {
            lastEntry.parts[0].text += `\n\n${textContent}`;
          } else {
            formattedContents.push({ role, parts: [{ text: textContent }] });
          }
        }
      }

      if (formattedContents.length === 0) {
        formattedContents.push({ role: 'user', parts: [{ text: 'Olá!' }] });
      }

      const candidateModels = [
        process.env.GEMINI_MODEL,
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
      ].filter(Boolean) as string[];
      let replyText = '';

      for (const modelName of candidateModels) {
        try {
          const rawResponse = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction || defaultSystemInstruction,
              temperature: 0.7,
            },
          });
          const text = rawResponse.text?.trim();
          if (text) {
            replyText = text;
            break;
          }
        } catch (err: any) {
          console.warn(`[Chatbot] Tentativa com ${modelName} falhou:`, err?.message);
        }
      }

      if (!replyText) {
        replyText =
          'Olá! Como posso ajudar hoje com as ofertas e serviços da Epic Games Store? Se desejar, pode também submeter um pedido de proposta na secção dedicada da página!';
      }

      res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Erro no chatbot:', error);
      res.status(500).json({ error: error?.message || 'Falha ao processar mensagem com a IA.' });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor a executar em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
});
