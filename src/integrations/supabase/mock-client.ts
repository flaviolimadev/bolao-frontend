// Supabase mock: fornece a mesma API usada no app, mas com dados locais em memória.
// Objetivo: permitir páginas estáticas com "mockdados" sem qualquer backend.

type UUID = string;

function genId(prefix: string = 'id'): UUID {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

const nowIso = () => new Date().toISOString();

const db = {
  editions: [
    {
      id: 'ed-1',
      edition_number: 1,
      draw_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      individual_card_price: 2500,
      bolao_quota_price: 1000,
      quotas_per_group: 10,
      cards_per_group: 100,
      is_active: true,
      status: 'active',
      prize_image_url: null,
      sales_paused: false,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ] as any[],
  customers: [
    { id: 'c-1', name: 'João Silva', cpf: '123.456.789-09', phone: '(84) 98888-0001', email: 'joao@example.com', created_at: nowIso(), updated_at: nowIso() },
    { id: 'c-2', name: 'Maria Souza', cpf: '987.654.321-00', phone: '(84) 97777-0002', email: 'maria@example.com', created_at: nowIso(), updated_at: nowIso() },
  ] as any[],
  promotoras: [
    { id: 'p-1', name: 'Promotora Ana', phone: '(84) 96666-1111', cpf: null, photo_url: '', is_active: true, total_sales: 12, commission_total: 3500, automatic_link_id: 'ana-auto', manual_link_id: 'ana-manual', created_at: nowIso(), updated_at: nowIso() },
  ] as any[],
  revendedores: [
    { id: 'r-1', name: 'Revendedor Carlos', phone: '(84) 95555-2222', cpf: null, is_active: true, total_sales: 20, commission_total: 5000, ranking_position: 3, automatic_link_id: 'carlos-auto', created_at: nowIso(), updated_at: nowIso() },
  ] as any[],
  sales: [] as any[],
  bolao_groups: [] as any[],
  bolao_quotas: [] as any[],
  card_uploads: [] as any[],
  system_settings: [
    { setting_key: 'company_info', setting_value: { name: 'Sistema de Vendas', email: 'contato@sistema.dev', phone: '(84) 90000-0000', address: 'Rua 1, 100', logo_url: '' }, is_active: true, updated_at: nowIso() },
    { setting_key: 'commission_rates', setting_value: { promotora: 0.1, revendedor: 0.05, gerente: 0.02, bonus_mensal: 0.01 }, is_active: true, updated_at: nowIso() },
    { setting_key: 'notifications', setting_value: { email_vendas: true, whatsapp_vendas: true, email_relatorios: false, notif_comissoes: true, alertas_pagamento: true }, is_active: true, updated_at: nowIso() },
    { setting_key: 'whatsapp_config', setting_value: { api_key: 'mock', mensagem_cartela: 'Sua cartela chegou!', mensagem_bolao: 'Sua cota chegou!', mensagem_comissao: 'Comissão disponível!', auto_envio: false }, is_active: true, updated_at: nowIso() },
  ] as any[],
} as const as any;

// Vendas iniciais com joins básicos que a UI espera
(() => {
  const edition = db.editions[0];
  const c1 = db.customers[0];
  const c2 = db.customers[1];
  const promotora = db.promotoras[0];
  const revendedor = db.revendedores[0];

  const sale1 = {
    id: 's-1', customer_id: c1.id, edition_id: edition.id,
    sale_type: 'individual_card', sale_origin: 'direct', amount: edition.individual_card_price,
    quotas_quantity: 1, payment_status: 'paid', created_at: nowIso(), updated_at: nowIso(),
    customer: c1, edition, promotora: null, revendedor: null, card_sent: true, whatsapp_sent: true,
  };
  const sale2 = {
    id: 's-2', customer_id: c2.id, edition_id: edition.id,
    sale_type: 'bolao_quota', sale_origin: 'promotora', amount: edition.bolao_quota_price,
    quotas_quantity: 1, payment_status: 'pending', created_at: nowIso(), updated_at: nowIso(),
    customer: c2, edition, promotora, revendedor: null, card_sent: false, whatsapp_sent: false,
  };
  const sale3 = {
    id: 's-3', customer_id: c1.id, edition_id: edition.id,
    sale_type: 'individual_card', sale_origin: 'revendedor', amount: edition.individual_card_price,
    quotas_quantity: 1, payment_status: 'paid', created_at: nowIso(), updated_at: nowIso(),
    customer: c1, edition, promotora: null, revendedor, card_sent: false, whatsapp_sent: false,
  };
  db.sales.push(sale1, sale2, sale3);

  const group = { id: 'g-1', edition_id: edition.id, group_number: 1, max_quotas: edition.quotas_per_group, total_quotas: 1, is_complete: false, cards_uploaded: false, cards_sent: false, created_at: nowIso(), updated_at: nowIso(), edition, quotas: [], uploads: [] } as any;
  const quota = { id: 'q-1', bolao_group_id: group.id, sale_id: sale2.id, quota_numbers: [7], created_at: nowIso(), sale: sale2 } as any;
  group.quotas.push(quota);
  db.bolao_groups.push(group);
  db.bolao_quotas.push(quota);
})();

type Filter = { op: 'eq'|'gte'|'gt'|'lt'|'lte'|'in'; column: string; value: any };

class Query {
  private table: keyof typeof db;
  private action: 'select'|'insert'|'update'|'delete' = 'select';
  private filters: Filter[] = [];
  private ord?: { column: string; ascending: boolean };
  private payload: any;
  private lim?: number;

  constructor(table: keyof typeof db) { this.table = table; }
  select(_cols?: string) { this.action = 'select'; return this; }
  insert(data: any) { this.action = 'insert'; this.payload = Array.isArray(data) ? data : [data]; return this; }
  update(values: any) { this.action = 'update'; this.payload = values; return this; }
  delete() { this.action = 'delete'; return this; }
  eq(column: string, value: any) { this.filters.push({ op: 'eq', column, value }); return this; }
  gte(column: string, value: any) { this.filters.push({ op: 'gte', column, value }); return this; }
  lt(column: string, value: any) { this.filters.push({ op: 'lt', column, value }); return this; }
  in(column: string, value: any[]) { this.filters.push({ op: 'in', column, value }); return this; }
  order(column: string, opts?: { ascending?: boolean }) { this.ord = { column, ascending: opts?.ascending !== false }; return this; }
  limit(n: number) { this.lim = n; return this.exec(); }
  single() { return this.exec(true); }

  private applyFilters(rows: any[]): any[] {
    return rows.filter((row) => this.filters.every(f => {
      const v = row[f.column];
      switch (f.op) {
        case 'eq': return v === f.value;
        case 'gte': return v >= f.value;
        case 'lt': return v < f.value;
        case 'in': return Array.isArray(f.value) && f.value.includes(v);
        default: return true;
      }
    }));
  }

  private async exec(single = false): Promise<any> {
    // @ts-ignore
    let rows: any[] = (db as any)[this.table] || [];

    if (this.action === 'insert') {
      const inserted = (this.payload as any[]).map(item => {
        const row = { id: item.id || genId(String(this.table)), created_at: nowIso(), updated_at: nowIso(), ...item };
        // joins mínimos para sales
        if (this.table === 'sales') {
          row.customer = db.customers.find((c: any) => c.id === row.customer_id) || null;
          row.edition = db.editions.find((e: any) => e.id === row.edition_id) || null;
          row.promotora = row.promotora_id ? db.promotoras.find((p: any) => p.id === row.promotora_id) : null;
          row.revendedor = row.revendedor_id ? db.revendedores.find((r: any) => r.id === row.revendedor_id) : null;
        }
        (db as any)[this.table].push(row);
        return row;
      });
      return { data: single ? inserted[0] : inserted, error: null };
    }

    if (this.action === 'update') {
      const filtered = this.applyFilters(rows);
      filtered.forEach(r => Object.assign(r, this.payload, { updated_at: nowIso() }));
      return { data: single ? filtered[0] : filtered, error: null };
    }

    if (this.action === 'delete') {
      const toDelete = this.applyFilters(rows);
      // @ts-ignore
      (db as any)[this.table] = rows.filter(r => !toDelete.includes(r));
      return { data: null, error: null };
    }

    // select
    let result = this.applyFilters(rows);
    if (this.ord) {
      const { column, ascending } = this.ord;
      result = [...result].sort((a, b) => (a[column] > b[column] ? 1 : -1) * (ascending ? 1 : -1));
    }
    if (typeof this.lim === 'number') {
      result = result.slice(0, this.lim);
    }
    return { data: single ? (result[0] ?? null) : result, error: null };
  }
}

function makeFrom(table: keyof typeof db) { return new Query(table); }

async function rpc(fn: string, args: Record<string, any>) {
  if (fn === 'register_customer_from_sale') {
    const { p_name, p_phone, p_cpf, p_email } = args as any;
    let found = db.customers.find((c: any) => (p_cpf && c.cpf === p_cpf) || (p_phone && (c.phone || '').replace(/\D/g, '') === String(p_phone).replace(/\D/g, '')));
    if (!found) {
      found = { id: genId('c'), name: p_name, phone: p_phone, cpf: p_cpf, email: p_email ?? null, created_at: nowIso(), updated_at: nowIso() } as any;
      (db as any).customers.push(found);
    }
    return { data: found.id, error: null };
  }
  return { data: null, error: null };
}

const functions = {
  async invoke(name: string, options?: { body?: any }) {
    if (name === 'process-pix-payment') {
      const txid = genId('tx');
      return { data: { success: true, txid, qrCode: `data:image/png;base64,MOCK_${txid}`, pixCopyPaste: `000201MOCK${txid}`, expires: Date.now() + 15 * 60 * 1000 }, error: null };
    }
    if (name === 'send-whatsapp') {
      return { data: { success: true }, error: null };
    }
    if (name === 'process-bolao-quotas') {
      const { saleId, editionId } = (options?.body || {}) as any;
      const sale = db.sales.find((s: any) => s.id === saleId);
      const edition = db.editions.find((e: any) => e.id === editionId);
      if (!sale || !edition) return { data: null, error: null };
      let group = db.bolao_groups.find((g: any) => g.edition_id === editionId && !g.is_complete) as any;
      if (!group) {
        group = { id: genId('g'), edition_id: editionId, group_number: db.bolao_groups.filter((g: any) => g.edition_id === editionId).length + 1, max_quotas: edition.quotas_per_group, total_quotas: 0, is_complete: false, cards_uploaded: false, cards_sent: false, created_at: nowIso(), updated_at: nowIso(), edition, quotas: [], uploads: [] };
        (db as any).bolao_groups.push(group);
      }
      const nextNumber = 1 + group.quotas.reduce((m: number, q: any) => Math.max(m, Math.max(...q.quota_numbers)), 0);
      const quota = { id: genId('q'), bolao_group_id: group.id, sale_id: sale.id, quota_numbers: [nextNumber], created_at: nowIso(), sale } as any;
      group.quotas.push(quota);
      group.total_quotas = group.quotas.length;
      group.is_complete = group.total_quotas >= group.max_quotas;
      (db as any).bolao_quotas.push(quota);
      return { data: { success: true }, error: null };
    }
    return { data: null, error: null };
  }
};

// Auth mock
let currentSession: any = null;
const auth = {
  onAuthStateChange(cb: (event: string, session: any) => void) {
    setTimeout(() => cb(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession), 0);
    return { data: { subscription: { unsubscribe() {} } } } as any;
  },
  async getSession() { return { data: { session: currentSession } } as any; },
  async signInWithPassword({ email }: { email: string; password: string }) { currentSession = { user: { id: 'u-1', email } }; return { data: { session: currentSession }, error: null } as any; },
  async signUp({ email }: { email: string; password: string; options?: any }) { currentSession = { user: { id: 'u-1', email } }; return { data: { session: currentSession }, error: null } as any; },
  async signOut() { currentSession = null; return { error: null } as any; },
} as any;

// Storage mock
const storage = {
  from(_bucket: string) {
    return {
      async upload(path: string, _file: File, _opts?: any) { return { data: { path }, error: null }; },
      getPublicUrl(path: string) { return { data: { publicUrl: `https://placeholder.local/${encodeURIComponent(path)}` } } as any; },
      async remove(_paths: string[]) { return { data: null, error: null } as any; },
    };
  }
};

export const supabase = { from: makeFrom as any, rpc, functions, auth, storage } as const;


