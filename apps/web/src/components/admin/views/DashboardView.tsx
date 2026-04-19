'use client';

import React from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Apr', total: 2400 },
  { name: 'May', total: 3200 },
  { name: 'Jun', total: 3800 },
  { name: 'Jul', total: 4200 },
];

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

export default function DashboardView() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants as any}>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back to the admin panel.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Revenue', value: 'Rp 45.2M', icon: DollarSign, change: '+20.1% from last month', gradient: 'from-green-500/20 to-emerald-500/20' },
          { title: 'Active Users', value: '+2350', icon: Users, change: '+180.1% from last month', gradient: 'from-blue-500/20 to-indigo-500/20' },
          { title: 'Sales', value: '+12,234', icon: ShoppingCart, change: '+19% from last month', gradient: 'from-orange-500/20 to-red-500/20' },
          { title: 'Active Now', value: '+573', icon: TrendingUp, change: '+201 since last hour', gradient: 'from-purple-500/20 to-pink-500/20' },
        ].map((item, i) => (
          <motion.div key={i} variants={itemVariants}>
            <GlassCard className="hover:scale-105 transition-transform duration-300">
              <div className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-50`} />
              <GlassCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <GlassCardTitle className="text-sm font-medium">{item.title}</GlassCardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </GlassCardHeader>
              <GlassCardContent className="relative z-10">
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.change}</p>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={itemVariants} className="col-span-4">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Overview</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="pl-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/10" />
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
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(23, 23, 23, 0.8)', 
                        backdropFilter: 'blur(12px)',
                        borderRadius: '8px', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff'
                      }}
                      formatter={(value: any) => [`Rp ${value}`, 'Revenue']}
                    />
                    <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary/80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-3">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <GlassCardTitle>Recent Sales</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-8">
                {[
                  { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 1999000 },
                  { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39000 },
                  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299000 },
                  { name: 'William Kim', email: 'will@email.com', amount: 99000 },
                  { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 39000 }
                ].map((user, i) => (
                  <div key={i} className="flex items-center">
                     <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
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
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
