'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Apr', total: 2400 },
  { name: 'May', total: 3200 },
  { name: 'Jun', total: 3800 },
  { name: 'Jul', total: 4200 },
];

export default function DashboardView() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back to the admin panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Revenue', value: 'Rp 45.2M', icon: DollarSign, change: '+20.1% from last month' },
          { title: 'Active Users', value: '+2350', icon: Users, change: '+180.1% from last month' },
          { title: 'Sales', value: '+12,234', icon: ShoppingCart, change: '+19% from last month' },
          { title: 'Active Now', value: '+573', icon: TrendingUp, change: '+201 since last hour' },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `Rp${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(value: any) => [`Rp ${value}`, 'Revenue']}
                  />
                  <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 1999000 },
                { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39000 },
                { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299000 },
                { name: 'William Kim', email: 'will@email.com', amount: 99000 },
                { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 39000 }
              ].map((user, i) => (
                <div key={i} className="flex items-center">
                   <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                     <Users className="h-4 w-4 text-primary" />
                   </div>
                   <div className="ml-4 space-y-1">
                     <p className="text-sm font-medium leading-none">{user.name}</p>
                     <p className="text-sm text-muted-foreground">{user.email}</p>
                   </div>
                   <div className="ml-auto font-medium">
                     {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.amount)}
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
