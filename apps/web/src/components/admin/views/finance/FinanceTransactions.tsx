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
import { PaginationControls } from '@/components/ui/pagination-controls';

export default function FinanceTransactions() {
  const { transactions, isLoading } = useFinanceStore();
  const [page, setPage] = React.useState(1);
  const perPage = 5;

  const paginatedTransactions = transactions.slice((page - 1) * perPage, page * perPage);

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
        <div className="absolute inset-0 bg-primary/5" />
        <GlassCardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
              <ArrowRightLeft className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
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
          <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
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
                  paginatedTransactions.map((trx) => (
                    <TableRow key={trx.id} className="border-border/20 hover:bg-muted/40 transition-colors">
                      <TableCell>{formatDate(trx.transaction_date)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{trx.reference_number}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          trx.type === 'income' ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                        )}>
                          {trx.type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>{trx.category}</TableCell>
                      <TableCell>{trx.description}</TableCell>
                      <TableCell className={cn("text-right font-medium", trx.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
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
          <PaginationControls
            currentPage={page}
            lastPage={Math.ceil(transactions.length / perPage) || 1}
            total={transactions.length}
            from={transactions.length > 0 ? (page - 1) * perPage + 1 : 0}
            to={transactions.length > 0 ? Math.min(page * perPage, transactions.length) : 0}
            onPageChange={setPage}
            itemLabel="transactions"
            isLoading={isLoading}
          />
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}
