import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with required Google Calendar scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.setCustomParameters({
  prompt: 'consent',
});

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface CalendarEventInput {
  title: string;
  description: string;
  startTime: string; // ISO 8601 string
  endTime: string;   // ISO 8601 string
  attendeeEmail?: string;
  attendeeName?: string;
  meetingType: string;
}

export interface CalendarEventResult {
  id: string;
  htmlLink: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

/**
 * Initialize auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User logged in via Firebase session, but access token is stored only during popup flow
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Google Sign In via Firebase popup with Calendar scope
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro na autenticação Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Create an event directly in the user's primary Google Calendar via REST API
 */
export const createGoogleCalendarEvent = async (
  token: string, 
  event: CalendarEventInput
): Promise<CalendarEventResult> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const body = {
    summary: event.title,
    description: `${event.description}\n\nAgendado via Landing Page Epic Games Store.\nTipo: ${event.meetingType}\nParticipante: ${event.attendeeName || 'Não especificado'} (${event.attendeeEmail || 'Sem email'})`,
    start: {
      dateTime: event.startTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: event.endTime,
      timeZone: timeZone,
    },
    attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : [],
    reminders: {
      useDefault: true,
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Erro ${response.status} ao criar evento no Google Calendar.`;
    throw new Error(message);
  }

  const data = await response.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
    summary: data.summary,
    start: data.start,
    end: data.end,
  };
};

/**
 * Generate a direct Google Calendar Web URL (fallback when not authenticated via popup)
 */
export const generateGoogleCalendarWebUrl = (event: CalendarEventInput): string => {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const dates = `${formatTime(event.startTime)}/${formatTime(event.endTime)}`;
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nAgendado via Landing Page Epic Games Store.\nTipo: ${event.meetingType}\nParticipante: ${event.attendeeName || ''} (${event.attendeeEmail || ''})`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
};
