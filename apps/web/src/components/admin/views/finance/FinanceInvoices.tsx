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

export default function FinanceInvoices() {
  const { invoices } = useFinanceStore();

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
         <Button className="bg-primary/20 hover:bg-primary/40 text-primary-foreground border border-primary/30 backdrop-blur-sm">
           <Plus className="mr-2 h-4 w-4" /> Create Invoice
         </Button>
      </div>
      <GlassCard className="overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5" />
        <GlassCardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Receipt className="h-5 w-5 text-blue-400" />
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
          <div className="rounded-md border border-border/20 bg-background/30 overflow-hidden">
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
                  invoices.map((inv) => (
                    <TableRow key={inv.id} className="border-border/20 hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium font-mono text-primary">{inv.invoice_number}</TableCell>
                      <TableCell>{formatDate(inv.issue_date)}</TableCell>
                      <TableCell>{inv.user?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          inv.status === 'paid' ? "bg-green-500/20 text-green-500 border-green-500/30" : 
                          inv.status === 'overdue' ? "bg-red-500/20 text-red-500 border-red-500/30" :
                          "bg-muted text-muted-foreground border-muted"
                        )}>
                          {inv.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">{formatCurrency(inv.total_amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-white/10 hover:text-white">
                          <FileText className="h-4 w-4" />
                        </Button>
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
