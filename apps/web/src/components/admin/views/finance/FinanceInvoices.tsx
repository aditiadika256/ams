'use client';

import React from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, FileText, Receipt } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default function FinanceInvoices() {
  const { invoices } = useFinanceStore();
  const [page, setPage] = React.useState(1);
  const perPage = 5;

  const paginatedInvoices = invoices.slice((page - 1) * perPage, page * perPage);

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
      className="space-y-6"
    >
      <div className="flex justify-end mb-4">
         <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm min-h-11 sm:min-h-10">
           <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Create Invoice</span></Button>
      </div>
      <GlassCard className="overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/5" />
        <GlassCardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <GlassCardTitle>Invoices</GlassCardTitle>
              <GlassCardDescription>
                Manage customer invoices and payments.
              </GlassCardDescription>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="relative z-10">
          <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/20 hover:bg-muted/40">
                  <TableHead className="text-muted-foreground">Invoice #</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow className="border-border/20 hover:bg-muted/40">
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((inv) => (
                    <TableRow key={inv.id} className="border-border/20 hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium font-mono text-primary">{inv.invoice_number}</TableCell>
                      <TableCell>{formatDate(inv.issue_date)}</TableCell>
                      <TableCell>{inv.user?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          inv.status === 'paid' ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : 
                          inv.status === 'overdue' ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30" :
                          "bg-muted text-muted-foreground border-border/60"
                        )}>
                          {inv.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">{formatCurrency(inv.total_amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-muted/60 text-muted-foreground hover:text-foreground">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls
            currentPage={page}
            lastPage={Math.ceil(invoices.length / perPage) || 1}
            total={invoices.length}
            from={invoices.length > 0 ? (page - 1) * perPage + 1 : 0}
            to={invoices.length > 0 ? Math.min(page * perPage, invoices.length) : 0}
            onPageChange={setPage}
            itemLabel="invoices"
          />
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}
