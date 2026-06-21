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
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">Type</Label>
          <Select 
            value={newTransaction.type} 
            onValueChange={(val: any) => setNewTransaction({...newTransaction, type: val})}
          >
            <SelectTrigger className="col-span-3 bg-background border-border">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Input 
            id="category" 
            className="col-span-3 bg-background border-border" 
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
            className="col-span-3 bg-background border-border" 
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
            className="col-span-3 bg-background border-border"
            value={newTransaction.transaction_date}
            onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="desc" className="text-right">Desc</Label>
          <Input 
            id="desc" 
            className="col-span-3 bg-background border-border" 
            placeholder="Optional description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
          />
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="button" onClick={handleCreateTransaction} disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? 'Saving...' : 'Save Transaction'}
        </Button>
      </div>
    </>
  );
}
