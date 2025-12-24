'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          A list of all recent financial transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ref</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
              </TableRow>
            ) : (
              transactions.map((trx) => (
                <TableRow key={trx.id}>
                  <TableCell>{formatDate(trx.transaction_date)}</TableCell>
                  <TableCell className="font-mono text-xs">{trx.reference_number}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      trx.type === 'income' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      {trx.type.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{trx.category}</TableCell>
                  <TableCell>{trx.description}</TableCell>
                  <TableCell className={cn("text-right font-medium", trx.type === 'income' ? "text-green-600" : "text-red-600")}>
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
      </CardContent>
    </Card>
  );
}
