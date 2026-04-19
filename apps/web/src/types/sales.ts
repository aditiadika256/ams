export interface Program {
  id: number;
  name: string;
  level: 'sd' | 'smp' | 'sma' | 'cpns' | 'umum';
  type: 'tryout' | 'bimbel' | 'bootcamp';
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
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
