import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import type { CatalogoItem, Pedido, Proposta } from '../src/types/proposalTypes';

// Initial 5 demo catalog items matching the Epic Games Store LP
export const INITIAL_DEMO_CATALOG: CatalogoItem[] = [
  {
    id: 'ea-fc-27-licenca',
    nome: 'Licença Digital EA SPORTS FC™ 27 (Ultimate Pre-Purchase)',
    descricao: 'Chave digital comercial para equipas e estações de jogo, incluindo acesso antecipado de 7 dias e pontos FC.',
    unidade: 'unidade',
    precoUnitario: 8999, // 89,99 €
    moeda: 'EUR',
    ativo: true,
    condicoes: 'Preço de demonstração (fictício). Ativação individual de chave digital na Epic Games Store.',
    isDemonstracao: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 're-requiem-licenca',
    nome: 'Licença Digital Resident Evil Requiem + Pack Cosmético',
    descricao: 'Chave digital para PC com suporte a saves na nuvem e item cosmético exclusivo cross-game no Fortnite.',
    unidade: 'unidade',
    precoUnitario: 4899, // 48,99 €
    moeda: 'EUR',
    ativo: true,
    condicoes: 'Preço de demonstração (fictício). Compatível com Windows 10/11 de 64 bits.',
    isDemonstracao: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'epic-publishing-88-12',
    nome: 'Taxa de Submissão e Publicação de Jogo (Divisão 88/12)',
    descricao: 'Processo de verificação técnica, curadoria de loja e publicação com partilha de receitas de 88% para o criador.',
    unidade: 'pacote',
    precoUnitario: 10000, // 100,00 €
    moeda: 'EUR',
    ativo: true,
    condicoes: 'Preço de demonstração (fictício). Reembolsável após o título atingir 1.000 € em receita líquida.',
    isDemonstracao: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'consultoria-crossplay-cloud',
    nome: 'Consultoria Técnica de Integração EOS (Cross-Play & Cloud Saves)',
    descricao: 'Sessões de consultoria técnica com especialistas para integração de SDK EOS, matchmaking e sincronização de saves.',
    unidade: 'hora',
    precoUnitario: 7500, // 75,00 €/hora
    moeda: 'EUR',
    ativo: true,
    condicoes: 'Preço de demonstração (fictício). Agendamento flexível com engenheiros seniores.',
    isDemonstracao: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'destaque-promocional-loja',
    nome: 'Pacote de Destaque Promocional e Banner de Lançamento na Loja',
    descricao: 'Colocação do título no carrossel de topo (Spotlight) da loja durante 7 dias com contagem decrescente e promoção sazonal.',
    unidade: 'pacote',
    precoUnitario: 45000, // 450,00 €
    moeda: 'EUR',
    ativo: true,
    condicoes: 'Preço de demonstração (fictício). Requer envio de materiais gráficos com 10 dias de antecedência.',
    isDemonstracao: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to prevent long gRPC retry hangs when Cloud Firestore API is pending user activation
function withTimeout<T>(promise: Promise<T>, ms = 1000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de comunicação com Cloud Firestore')), ms)
    ),
  ]);
}

// Persistent file-backed local replica to ensure zero downtime and immediate testing
const LOCAL_STORE_FILE = path.join(process.cwd(), 'data', 'firestore-data.json');

interface LocalStoreData {
  catalogo: Record<string, CatalogoItem>;
  pedidos: Record<string, Pedido>;
  propostas: Record<string, Proposta>;
}

function loadLocalStore(): LocalStoreData {
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Não foi possível ler store local, a inicializar novo:', err);
  }
  const initial: LocalStoreData = {
    catalogo: {},
    pedidos: {},
    propostas: {},
  };
  for (const item of INITIAL_DEMO_CATALOG) {
    initial.catalogo[item.id] = item;
  }
  saveLocalStore(initial);
  return initial;
}

function saveLocalStore(data: LocalStoreData) {
  try {
    const dir = path.dirname(LOCAL_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao guardar ficheiro local:', err);
  }
}

// Initialize Firebase App
let firestoreDb: any = null;
let firestoreAvailable = false;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = initializeApp(config);
    firestoreDb = getFirestore(app);
    firestoreAvailable = true;
    console.log('[Firebase] Inicializado com sucesso para o projeto:', config.projectId);
  }
} catch (e: any) {
  console.warn('[Firebase] Não foi possível inicializar SDK:', e?.message);
}

// Bootstrap Catalog
export async function initDatabase(): Promise<void> {
  const store = loadLocalStore();
  if (Object.keys(store.catalogo).length === 0) {
    for (const item of INITIAL_DEMO_CATALOG) {
      store.catalogo[item.id] = item;
    }
    saveLocalStore(store);
  }

  // Attempt Firestore sync in background with a quick timeout so it never blocks startup
  if (firestoreAvailable && firestoreDb) {
    withTimeout(
      (async () => {
        const catRef = collection(firestoreDb, 'catalogo');
        const snap = await getDocs(catRef);
        if (snap.empty) {
          console.log('[Firestore] A sincronizar catálogo de demonstração no Cloud Firestore...');
          for (const item of INITIAL_DEMO_CATALOG) {
            await setDoc(doc(firestoreDb, 'catalogo', item.id), item);
          }
          console.log('[Firestore] Catálogo inicial gravado com sucesso no Cloud Firestore!');
        }
      })(),
      1200
    ).catch((err: any) => {
      if (err?.message?.includes('Cloud Firestore API has not been used') || err?.message?.includes('PERMISSION_DENIED')) {
        firestoreAvailable = false;
        console.info(
          '[Firestore] Cloud Firestore API pendente de ativação na consola Google: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=gen-lang-client-0341614817'
        );
      }
    });
  }
}

// Catalog operations
export async function getCatalogoAtivo(): Promise<CatalogoItem[]> {
  if (firestoreAvailable && firestoreDb) {
    try {
      const snap = await withTimeout(getDocs(collection(firestoreDb, 'catalogo')), 800);
      if (!snap.empty) {
        const list: CatalogoItem[] = [];
        snap.forEach((d) => {
          const data = d.data() as CatalogoItem;
          if (data.ativo !== false) list.push(data);
        });
        if (list.length > 0) return list;
      }
    } catch {
      // Fallback to local store
    }
  }
  const store = loadLocalStore();
  return Object.values(store.catalogo).filter((i) => i.ativo);
}

export async function getAllCatalogo(): Promise<CatalogoItem[]> {
  if (firestoreAvailable && firestoreDb) {
    try {
      const snap = await withTimeout(getDocs(collection(firestoreDb, 'catalogo')), 800);
      if (!snap.empty) {
        const list: CatalogoItem[] = [];
        snap.forEach((d) => list.push(d.data() as CatalogoItem));
        return list;
      }
    } catch {
      // Fallback
    }
  }
  const store = loadLocalStore();
  return Object.values(store.catalogo);
}

export async function saveCatalogoItem(item: CatalogoItem): Promise<void> {
  const store = loadLocalStore();
  store.catalogo[item.id] = item;
  saveLocalStore(store);

  if (firestoreAvailable && firestoreDb) {
    withTimeout(setDoc(doc(firestoreDb, 'catalogo', item.id), item), 1500).catch((err) => {
      console.warn('[Firestore] Aviso ao gravar item no Firestore:', err?.message);
    });
  }
}

// Pedidos operations
export async function savePedido(pedido: Pedido): Promise<void> {
  const store = loadLocalStore();
  store.pedidos[pedido.id] = pedido;
  saveLocalStore(store);

  if (firestoreAvailable && firestoreDb) {
    withTimeout(setDoc(doc(firestoreDb, 'pedidos', pedido.id), pedido), 1500).catch((err: any) => {
      console.warn('[Firestore] Aviso ao persistir pedido no Firestore:', err?.message);
    });
  }
}

export async function getPedido(id: string): Promise<Pedido | null> {
  if (firestoreAvailable && firestoreDb) {
    try {
      const snap = await withTimeout(getDoc(doc(firestoreDb, 'pedidos', id)), 800);
      if (snap.exists()) return snap.data() as Pedido;
    } catch {
      // Fallback
    }
  }
  const store = loadLocalStore();
  return store.pedidos[id] || null;
}

export async function getAllPedidos(): Promise<Pedido[]> {
  if (firestoreAvailable && firestoreDb) {
    try {
      const snap = await withTimeout(getDocs(collection(firestoreDb, 'pedidos')), 800);
      if (!snap.empty) {
        const list: Pedido[] = [];
        snap.forEach((d) => list.push(d.data() as Pedido));
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch {
      // Fallback
    }
  }
  const store = loadLocalStore();
  return Object.values(store.pedidos).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updatePedido(id: string, updates: Partial<Pedido>): Promise<Pedido | null> {
  const store = loadLocalStore();
  if (!store.pedidos[id]) return null;

  const updated: Pedido = {
    ...store.pedidos[id],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  store.pedidos[id] = updated;
  saveLocalStore(store);

  if (firestoreAvailable && firestoreDb) {
    withTimeout(updateDoc(doc(firestoreDb, 'pedidos', id), updates as any), 1500).catch((err) => {
      console.warn('[Firestore] Aviso ao atualizar pedido no Firestore:', err?.message);
    });
  }

  return updated;
}

// Propostas operations
export async function saveProposta(proposta: Proposta): Promise<void> {
  const store = loadLocalStore();
  store.propostas[proposta.id] = proposta;
  saveLocalStore(store);

  if (firestoreAvailable && firestoreDb) {
    withTimeout(setDoc(doc(firestoreDb, 'propostas', proposta.id), proposta), 1500).catch((err: any) => {
      console.warn('[Firestore] Aviso ao persistir proposta no Firestore:', err?.message);
    });
  }
}

export async function getPropostaByToken(token: string): Promise<Proposta | null> {
  const store = loadLocalStore();
  const localMatch = Object.values(store.propostas).find((p) => p.token === token);
  if (localMatch) return localMatch;

  if (firestoreAvailable && firestoreDb) {
    try {
      const snap = await withTimeout(getDocs(collection(firestoreDb, 'propostas')), 800);
      for (const d of snap.docs) {
        const p = d.data() as Proposta;
        if (p.token === token) return p;
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

export async function getProposta(id: string): Promise<Proposta | null> {
  const store = loadLocalStore();
  if (store.propostas[id]) return store.propostas[id];

  if (firestoreAvailable && firestoreDb) {
    try {
      const snap = await withTimeout(getDoc(doc(firestoreDb, 'propostas', id)), 800);
      if (snap.exists()) return snap.data() as Proposta;
    } catch {
      // Fallback
    }
  }

  return null;
}

export async function getAllPropostas(): Promise<Proposta[]> {
  if (firestoreAvailable && firestoreDb) {
    try {
      const snap = await withTimeout(getDocs(collection(firestoreDb, 'propostas')), 800);
      if (!snap.empty) {
        const list: Proposta[] = [];
        snap.forEach((d) => list.push(d.data() as Proposta));
        return list;
      }
    } catch {
      // Fallback
    }
  }
  const store = loadLocalStore();
  return Object.values(store.propostas);
}

export async function updateProposta(id: string, updates: Partial<Proposta>): Promise<Proposta | null> {
  const store = loadLocalStore();
  if (!store.propostas[id]) return null;

  const updated: Proposta = {
    ...store.propostas[id],
    ...updates,
  };
  store.propostas[id] = updated;
  saveLocalStore(store);

  if (firestoreAvailable && firestoreDb) {
    withTimeout(updateDoc(doc(firestoreDb, 'propostas', id), updates as any), 1500).catch((err) => {
      console.warn('[Firestore] Aviso ao atualizar proposta no Firestore:', err?.message);
    });
  }

  return updated;
}
