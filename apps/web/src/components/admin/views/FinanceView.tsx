'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from '@/components/ui/select';
import { Download, DollarSign, TrendingUp, TrendingDown, CreditCard, Plus } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { cn } from '@/lib/utils';

// Import sub-views
import FinanceTransactions from './finance/FinanceTransactions';
import FinanceInvoices from './finance/FinanceInvoices';
import FinanceReports from './finance/FinanceReports';

const TabMap: Record<string, React.ComponentType<any>> = {
  'transactions': FinanceTransactions,
  'invoices': FinanceInvoices,
  'reports': FinanceReports
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

export default function FinanceView() {
  const { 
    transactions,
    invoices,
    stats, 
    isLoading, 
    fetchTransactions, 
    fetchInvoices, 
    fetchStats,
    createTransaction 
  } = useFinanceStore();

  // State for active tab (Standardized with AdminLayout pattern)
  const [activeTabId, setActiveTabId] = useState('transactions');
  const ActiveView = TabMap[activeTabId] || FinanceTransactions;

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleExport = () => {
    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    if (activeTabId === 'transactions') {
      filename = `transactions-${getTodayString()}.csv`;
      headers = ['ID', 'Reference', 'Date', 'Type', 'Category', 'Amount', 'Status', 'Description'];
      data = transactions.map(t => [
        t.id,
        t.reference_number,
        t.transaction_date,
        t.type,
        t.category,
        t.amount,
        t.status,
        t.description
      ]);
    } else if (activeTabId === 'invoices') {
      filename = `invoices-${getTodayString()}.csv`;
      headers = ['ID', 'Invoice #', 'Date', 'Due Date', 'Customer', 'Amount', 'Status'];
      data = invoices.map(i => [
        i.id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        i.user?.name || 'N/A',
        i.total_amount,
        i.status
      ]);
    } else {
      // Default or Reports
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    transaction_date: getTodayString(),
    status: 'completed'
  });

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchInvoices();
  }, [fetchStats, fetchTransactions, fetchInvoices]);

  const handleCreateTransaction = async () => {
    try {
      await createTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      setIsAddTransactionOpen(false);
      setNewTransaction({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        transaction_date: getTodayString(), // Fixed: Use getTodayString instead of format()
        status: 'completed'
      });
    } catch (error) {
      console.error('Failed to create transaction', error);
    }
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Finance & Analytics</h2>
          <p className="text-muted-foreground">Manage transactions, invoices, and view financial reports.</p>
        </div>
        <div className="flex gap-2">
           <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
             <DialogTrigger asChild>
               <Button className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0">
                 <Plus className="mr-2 h-4 w-4" /> New Transaction
               </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-xl border-white/10">
               <DialogHeader>
                 <DialogTitle>Add Transaction</DialogTitle>
                 <DialogDescription>
                   Record a new income or expense transaction.
                 </DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="type" className="text-right">Type</Label>
                   <Select 
                     value={newTransaction.type} 
                     onValueChange={(val: any) => setNewTransaction({...newTransaction, type: val})}
                   >
                     <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                       <SelectValue placeholder="Select type" />
                     </SelectTrigger>
                     <SelectContent className="bg-black/90 border-white/10">
                       <SelectItem value="income">Income</SelectItem>
                       <SelectItem value="expense">Expense</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="category" className="text-right">Category</Label>
                   <Input 
                     id="category" 
                     className="col-span-3 bg-white/5 border-white/10" 
                     placeholder="e.g. Sales, Salary, Rent"
                     value={newTransaction.category}
                     onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="amount" className="text-right">Amount</Label>
                   <Input 
                     id="amount" 
                     type="number" 
                     className="col-span-3 bg-white/5 border-white/10" 
                     placeholder="0"
                     value={newTransaction.amount}
                     onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="date" className="text-right">Date</Label>
                   <Input 
                     id="date" 
                     type="date" 
                     className="col-span-3 bg-white/5 border-white/10"
                     value={newTransaction.transaction_date}
                     onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="desc" className="text-right">Desc</Label>
                   <Input 
                     id="desc" 
                     className="col-span-3 bg-white/5 border-white/10" 
                     placeholder="Optional description"
                     value={newTransaction.description}
                     onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                   />
                 </div>
               </div>
               <DialogFooter>
                 <Button type="submit" onClick={handleCreateTransaction} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                   {isLoading ? 'Saving...' : 'Save Transaction'}
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
           <Button variant="outline" onClick={handleExport} className="bg-transparent border-white/10 hover:bg-white/5">
             <Download className="mr-2 h-4 w-4" /> Export
           </Button>
        </div>
      </motion.div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
         <motion.div variants={itemVariants}>
           <GlassCard className="relative overflow-hidden group hover:scale-105 transition-all duration-300">
             <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-emerald-500/10 group-hover:opacity-100 transition-opacity" />
             <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
               <GlassCardTitle className="text-sm font-medium">Total Income</GlassCardTitle>
               <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-green-400 transition-colors" />
             </GlassCardHeader>
             <GlassCardContent className="relative z-10">
               <div className="text-2xl font-bold">{stats ? formatCurrency(stats.total_income) : 'Rp 0'}</div>
               <div className="flex items-center text-xs text-green-500 mt-1">
                 <TrendingUp className="h-3 w-3 mr-1" />
                 Recorded Income
               </div>
             </GlassCardContent>
           </GlassCard>
         </motion.div>
         
         <motion.div variants={itemVariants}>
           <GlassCard className="relative overflow-hidden group hover:scale-105 transition-all duration-300">
             <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 group-hover:opacity-100 transition-opacity" />
             <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
               <GlassCardTitle className="text-sm font-medium">Total Expenses</GlassCardTitle>
               <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-red-400 transition-colors" />
             </GlassCardHeader>
             <GlassCardContent className="relative z-10">
               <div className="text-2xl font-bold">{stats ? formatCurrency(stats.total_expense) : 'Rp 0'}</div>
               <div className="flex items-center text-xs text-red-500 mt-1">
                 <TrendingDown className="h-3 w-3 mr-1" />
                 Recorded Expenses
               </div>
             </GlassCardContent>
           </GlassCard>
         </motion.div>
         
         <motion.div variants={itemVariants}>
           <GlassCard className="relative overflow-hidden group hover:scale-105 transition-all duration-300">
             <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-cyan-500/10 group-hover:opacity-100 transition-opacity" />
             <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
               <GlassCardTitle className="text-sm font-medium">Net Profit</GlassCardTitle>
               <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
             </GlassCardHeader>
             <GlassCardContent className="relative z-10">
               <div className="text-2xl font-bold">{stats ? formatCurrency(stats.net_profit) : 'Rp 0'}</div>
               <div className={cn("flex items-center text-xs mt-1", (stats?.net_profit || 0) >= 0 ? "text-green-500" : "text-red-500")}>
                 {(stats?.net_profit || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                 Net Result
               </div>
             </GlassCardContent>
           </GlassCard>
         </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTabId} onValueChange={setActiveTabId} className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10 backdrop-blur-sm">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-white/10">Transactions</TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-white/10">Invoices</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-white/10">Reports</TabsTrigger>
          </TabsList>
          
          {/* Render only the active view, standardized with AdminLayout */}
          <div className="mt-4">
             <ActiveView />
          </div>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
