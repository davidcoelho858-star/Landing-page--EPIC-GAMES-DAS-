import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon, 
  Mail, 
  FileText, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { 
  googleSignIn, 
  initAuth, 
  logoutGoogle, 
  createGoogleCalendarEvent, 
  generateGoogleCalendarWebUrl, 
  getCachedAccessToken,
  CalendarEventResult
} from '../services/googleAuth';
import { User } from 'firebase/auth';

interface MeetingSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  initialTopic?: string;
}

const MEETING_TYPES = [
  {
    id: 'store_demo',
    title: 'Demo da Loja & Onboarding',
    duration: 30,
    description: 'Apresentação detalhada da loja, resgate de jogos semanais, catálogo e 5% Epic Rewards.',
  },
  {
    id: 'publishing_partnership',
    title: 'Parceria de Publicação (Split 88/12)',
    duration: 45,
    description: 'Reunião comercial para estúdios e desenvolvedores interessados na publicação no ecossistema Epic.',
  },
  {
    id: 'rewards_consultation',
    title: 'Consultoria de Recompensas & Suporte',
    duration: 30,
    description: 'Dúvidas sobre offer stacking (Fortnite/Rocket League), reembolsos e faturamento.',
  },
];

export const MeetingSchedulerModal: React.FC<MeetingSchedulerModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  initialTopic,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Form states
  const [selectedType, setSelectedType] = useState(MEETING_TYPES[0]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Status & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<CalendarEventResult | null>(null);

  // Available dates (next 7 days excluding weekends)
  const [availableDates, setAvailableDates] = useState<{ dateString: string; label: string }[]>([]);

  useEffect(() => {
    // Generate dates
    const dates: { dateString: string; label: string }[] = [];
    const today = new Date();
    let daysAdded = 0;
    let currentOffset = 1;

    while (daysAdded < 6) {
      const d = new Date(today);
      d.setDate(today.getDate() + currentOffset);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Monday-Friday
        const iso = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
        dates.push({ dateString: iso, label });
        daysAdded++;
      }
      currentOffset++;
    }

    setAvailableDates(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].dateString);
    }

    if (initialTopic) {
      setNotes(initialTopic);
    }
  }, [initialTopic, selectedDate]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);
        if (user.displayName && !userName) setUserName(user.displayName);
        if (user.email && !userEmail) setUserEmail(user.email);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      setCurrentUser(result.user);
      setAccessToken(result.accessToken);
      if (result.user.displayName) setUserName(result.user.displayName);
      if (result.user.email) setUserEmail(result.user.email);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao autenticar com o Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedDate || !selectedTime) {
      setErrorMsg('Por favor selecione a data e o horário da reunião.');
      return;
    }

    if (!userEmail) {
      setErrorMsg('Por favor forneça seu e-mail para confirmação da reunião.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate start and end ISO timestamps
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + selectedType.duration * 60 * 1000);

      const eventPayload = {
        title: `Epic Games Store: ${selectedType.title} - ${userName || 'Participante'}`,
        description: notes || `Reunião agendada com a equipe da Epic Games Store. Tópico: ${selectedType.title}.`,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendeeEmail: userEmail,
        attendeeName: userName,
        meetingType: selectedType.title,
      };

      const token = accessToken || getCachedAccessToken();

      if (token) {
        // Authenticated direct insertion via Google Calendar API
        const result = await createGoogleCalendarEvent(token, eventPayload);
        setCreatedEvent(result);
      } else {
        // Not signed in with token: generate direct web URL
        const webUrl = generateGoogleCalendarWebUrl(eventPayload);
        setCreatedEvent({
          id: 'manual-web',
          htmlLink: webUrl,
          summary: eventPayload.title,
          start: { dateTime: eventPayload.startTime },
          end: { dateTime: eventPayload.endTime },
        });
      }
    } catch (err: any) {
      console.error('Erro ao agendar reunião:', err);
      // If error was token expiration or scope missing, fall back to direct web link
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + selectedType.duration * 60 * 1000);
      const fallbackUrl = generateGoogleCalendarWebUrl({
        title: `Epic Games Store: ${selectedType.title} - ${userName || 'Participante'}`,
        description: notes || selectedType.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendeeEmail: userEmail,
        attendeeName: userName,
        meetingType: selectedType.title,
      });

      setCreatedEvent({
        id: 'fallback-web',
        htmlLink: fallbackUrl,
        summary: `Epic Games Store: ${selectedType.title}`,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedEvent(null);
    onClose();
  };

  const availableTimes = ['09:30', '11:00', '14:00', '15:30', '17:00'];

  return (
    <div 
      id="meeting-scheduler-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="meeting-scheduler-card"
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl relative transition-all ${
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

        {/* State 1: Success Confirmation Screen */}
        {createdEvent ? (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CalendarCheck className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black tracking-tight">
              Reunião Agendada com Sucesso!
            </h3>

            <p className={`text-sm max-w-md mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              O seu compromisso foi registrado para <strong>{new Date(createdEvent.start.dateTime).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</strong>.
            </p>

            <div className={`p-4 rounded-2xl border text-left text-xs max-w-md mx-auto space-y-2 ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-400">Assunto:</span>
                <span className="font-bold text-cyan-400">{createdEvent.summary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Participante:</span>
                <span className="font-semibold">{userName || 'Convidado'} ({userEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duração:</span>
                <span className="font-semibold">{selectedType.duration} minutos</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a
                href={createdEvent.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>Abrir no Google Calendar</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Booking Form */
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Agendar Reunião / Demonstração
                </h3>
                <span className="text-xs text-cyan-500 font-bold uppercase tracking-wider">
                  Integração com Google Calendar
                </span>
              </div>
            </div>

            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Escolha o formato da reunião, selecione a data e conecte com o <strong>Google Calendar</strong> para adicionar o compromisso diretamente à sua agenda.
            </p>

            {/* Google Calendar Connection Status / Sign-in Banner */}
            <div className={`mt-5 p-4 rounded-2xl border transition-all ${
              currentUser
                ? darkMode ? 'bg-blue-950/30 border-blue-500/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                : darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shadow-sm shrink-0">
                    {/* Google G Icon */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>Google Calendar:</span>
                      {currentUser ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Não conectado</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentUser 
                        ? `Conectado como ${currentUser.displayName || currentUser.email}`
                        : 'Conecte para sincronizar o evento automaticamente no seu calendário.'}
                    </div>
                  </div>
                </div>

                <div>
                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => logoutGoogle()}
                      className="text-[11px] font-semibold text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Desconectar
                    </button>
                  ) : (
                    /* Google Sign in Button */
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-300 shadow-sm transition-all flex items-center gap-2"
                    >
                      <span>{isSigningIn ? 'Conectando...' : 'Conectar Google'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmBooking} className="mt-6 space-y-5">
              {/* 1. Meeting Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Selecione o Tipo de Reunião:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {MEETING_TYPES.map((type) => {
                    const isSelected = selectedType.id === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedType(type)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 ring-1 ring-cyan-500'
                            : darkMode
                              ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{type.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {type.duration}m
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. Escolha o Dia:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {availableDates.map((item) => (
                      <button
                        key={item.dateString}
                        type="button"
                        onClick={() => setSelectedDate(item.dateString)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                          selectedDate === item.dateString
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                            : darkMode
                              ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Horário Disponível:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                          selectedTime === time
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : darkMode
                              ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Attendee Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Seu Nome:</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: David Coelho"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      darkMode 
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Seu E-mail (Google Calendar):</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@gmail.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      darkMode 
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Observações ou Dúvidas Prévias (Opcional):</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Conte-nos brevemente o que você gostaria de discutir..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Adicionando ao Google Calendar...' 
                      : currentUser 
                        ? 'Confirmar & Sincronizar no Google Calendar' 
                        : 'Agendar Reunião'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Sincronização oficial de eventos via Google Calendar API</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
