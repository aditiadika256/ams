export interface ProgramLookupRelation {
  id: number;
  code: string;
  name: string;
  row_status: -1 | 0 | 1;
  sort_order: number;
}

export interface Program {
  id: number;
  name: string;
  /** @deprecated Use program_level/program_level_id for new code. */
  level: string;
  /** @deprecated Use program_type/program_type_id for new code. */
  type: string;
  program_level_id: number | null;
  program_type_id: number | null;
  program_level?: ProgramLookupRelation | null;
  program_type?: ProgramLookupRelation | null;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramMutationPayload {
  name: string;
  program_level_id: number;
  program_type_id: number;
  price: number;
  active: boolean;
}

export interface OrderItem {
  id: number;
  program_id: number;
  program?: Program;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  total: number;
  payment_provider?: string;
  payment_reference?: string;
  snap_token?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  programs: {
    id: number;
    quantity: number;
  }[];
  payment_provider?: string;
  payment_reference?: string;
  meta?: Record<string, any>;
}

export interface PaymentWebhookPayload {
  order_id: string;
  transaction_status: string;
  fraud_status: string;
}
