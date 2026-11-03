import { Resend } from 'resend';
import type { Proposta } from '../src/types/proposalTypes';

export interface ResendNotificationResult {
  status: 'Aceite pelo serviço' | 'Falhou' | 'Não configurado';
  id?: string;
  error?: string;
  tentativaEm: string;
}

export async function enviarNotificacaoAlunoResend(
  proposta: Proposta,
  pedidoNome?: string
): Promise<ResendNotificationResult> {
  const tentativaEm = new Date().toISOString();
  const apiKey = process.env.RESEND_API_KEY;
  const emailAluno = process.env.EMAIL_ALUNO?.trim();

  // If credentials or recipient are not configured
  if (!apiKey || apiKey === 'MY_RESEND_API_KEY' || !emailAluno) {
    const missing = [];
    if (!apiKey || apiKey === 'MY_RESEND_API_KEY') missing.push('RESEND_API_KEY');
    if (!emailAluno) missing.push('EMAIL_ALUNO');

    return {
      status: 'Não configurado',
      error: `Variáveis em falta no ambiente: ${missing.join(', ')}. Configure no painel de Secrets para receber notificações.`,
      tentativaEm,
    };
  }

  try {
    const resend = new Resend(apiKey);

    const valorFormatado = (proposta.total / 100).toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
    .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background-color: rgba(6,182,212,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }
    h2 { color: #ffffff; font-size: 20px; margin-top: 16px; margin-bottom: 8px; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
    .info-box { background-color: #0f172a; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #334155; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; margin-top: 12px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; pt-16px; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Epic Games Store • Notificação Interna</span>
    <h2>Nova proposta gerada</h2>
    <p>Foi criada uma nova proposta comercial no sistema através da interpretação inteligente com Gemini.</p>
    
    <div class="info-box">
      <p style="margin: 4px 0;"><strong>Referência da Proposta:</strong> ${proposta.numeroProposta}</p>
      <p style="margin: 4px 0;"><strong>Valor Total (sem IVA):</strong> ${valorFormatado}</p>
      <p style="margin: 4px 0;"><strong>Âmbito:</strong> ${proposta.resumoAmbito}</p>
      <p style="margin: 4px 0;"><strong>Itens:</strong> ${proposta.itens.length} produto(s)/serviço(s)</p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${proposta.link}" class="btn" target="_blank">Consultar proposta comercial</a>
    </div>

    <p style="font-size: 12px; word-break: break-all; color: #94a3b8;">
      Link direto:<br/>
      <a href="${proposta.link}" style="color: #38bdf8;">${proposta.link}</a>
    </p>

    <div class="footer">
      <strong>Modo de aula:</strong> Esta notificação é enviada exclusivamente para o email do aluno (${emailAluno}). Os clientes finais que preenchem o formulário não recebem emails.
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: emailAluno,
      subject: 'Nova proposta gerada — Epic Games Store',
      html: htmlContent,
      text: `Nova proposta gerada — Epic Games Store\n\nReferência: ${proposta.numeroProposta}\nValor (sem IVA): ${valorFormatado}\nÂmbito: ${proposta.resumoAmbito}\n\nConsulte a proposta no link:\n${proposta.link}\n\n(Modo de aula: Notificação interna enviada para o aluno).`,
    });

    if (result.error) {
      console.warn('[Resend] Erro retornado pela API Resend:', result.error);
      return {
        status: 'Falhou',
        error: result.error.message || 'Erro ao enviar email através do Resend',
        tentativaEm,
      };
    }

    return {
      status: 'Aceite pelo serviço',
      id: result.data?.id,
      tentativaEm,
    };
  } catch (err: any) {
    console.error('[Resend] Exceção ao invocar Resend:', err);
    return {
      status: 'Falhou',
      error: err?.message || 'Falha de comunicação com o serviço Resend',
      tentativaEm,
    };
  }
}
