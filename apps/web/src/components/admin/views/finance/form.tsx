import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TransactionFormProps {
  newTransaction: any;
  setNewTransaction: (val: any) => void;
  handleCreateTransaction: () => void;
  isLoading: boolean;
}

export function TransactionForm({ newTransaction, setNewTransaction, handleCreateTransaction, isLoading }: TransactionFormProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="grid gap-3 sm:gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1.5 sm:gap-4">
          <Label htmlFor="type" className="text-xs sm:text-right font-medium text-foreground">Type</Label>
          <div className="sm:col-span-3">
            <Select 
              value={newTransaction.type} 
              onValueChange={(val: any) => setNewTransaction({...newTransaction, type: val})}
            >
              <SelectTrigger id="type" className="w-full bg-background/70 border-input/60 text-foreground">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60 text-popover-foreground">
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1.5 sm:gap-4">
          <Label htmlFor="category" className="text-xs sm:text-right font-medium text-foreground">Category</Label>
          <Input 
            id="category" 
            className="sm:col-span-3 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" 
            placeholder="e.g. Sales, Salary, Rent"
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1.5 sm:gap-4">
          <Label htmlFor="amount" className="text-xs sm:text-right font-medium text-foreground">Amount</Label>
          <Input 
            id="amount" 
            type="number" 
            className="sm:col-span-3 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" 
            placeholder="0"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1.5 sm:gap-4">
          <Label htmlFor="date" className="text-xs sm:text-right font-medium text-foreground">Date</Label>
          <Input 
            id="date" 
            type="date" 
            className="sm:col-span-3 bg-background/70 border-input/60 text-foreground"
            value={newTransaction.transaction_date}
            onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1.5 sm:gap-4">
          <Label htmlFor="desc" className="text-xs sm:text-right font-medium text-foreground">Desc</Label>
          <Input 
            id="desc" 
            className="sm:col-span-3 bg-background/70 border-input/60 text-foreground placeholder:text-muted-foreground" 
            placeholder="Optional description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-border/60">
        <Button
          type="button"
          onClick={handleCreateTransaction}
          disabled={isLoading}
          className="w-full sm:w-auto min-h-11 sm:min-h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isLoading ? 'Saving...' : 'Save Transaction'}
        </Button>
      </div>
    </div>
  );
}
