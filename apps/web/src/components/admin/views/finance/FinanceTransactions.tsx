'use client';

import React from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/glass-card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useFinanceStore } from '@/store/useFinanceStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';

export default function FinanceTransactions() {
  const { transactions, isLoading } = useFinanceStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5" />
        <GlassCardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <GlassCardTitle>Recent Transactions</GlassCardTitle>
              <GlassCardDescription>
                A list of all recent financial transactions.
              </GlassCardDescription>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="relative z-10">
          <div className="rounded-md border border-white/10 bg-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/20 hover:bg-muted/40">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Ref</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-border/20 hover:bg-muted/40">
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow className="border-border/20 hover:bg-muted/40">
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
                  </TableRow>
                ) : (
                  transactions.map((trx) => (
                    <TableRow key={trx.id} className="border-border/20 hover:bg-muted/40 transition-colors">
                      <TableCell>{formatDate(trx.transaction_date)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{trx.reference_number}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          trx.type === 'income' ? "bg-green-500/20 text-green-200 border-green-500/30" : "bg-red-500/20 text-red-200 border-red-500/30"
                        )}>
                          {trx.type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>{trx.category}</TableCell>
                      <TableCell>{trx.description}</TableCell>
                      <TableCell className={cn("text-right font-medium", trx.type === 'income' ? "text-green-400" : "text-red-400")}>
                        {trx.type === 'income' ? '+' : '-'}{formatCurrency(trx.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-xs text-muted-foreground">{trx.status}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}
