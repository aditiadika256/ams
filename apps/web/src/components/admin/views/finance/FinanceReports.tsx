'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';
import { FileBarChart, Download, Calendar } from 'lucide-react';

export default function FinanceReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('revenue');
  const [groupBy, setGroupBy] = useState('day');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const response = await api.get('/finance/reports/custom', {
        params: {
          start_date: startDate,
          end_date: endDate,
          type: reportType,
          group_by: groupBy
        }
      });
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to generate report', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Finance Report: ${reportType.toUpperCase()}`, 14, 15);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 25);
    
    autoTable(doc, {
      startY: 35,
      head: [['Date', reportType === 'revenue' ? 'Revenue' : 'Count', reportType === 'revenue' ? 'Count' : '']],
      body: data.map(item => [
        item.date,
        item.value,
        item.count || '-'
      ]),
    });

    doc.save(`report-${reportType}-${startDate}-${endDate}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5" />
        <GlassCardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <FileBarChart className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <GlassCardTitle>Custom Report Builder</GlassCardTitle>
              <GlassCardDescription>Generate detailed financial reports.</GlassCardDescription>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3" /> Start Date
              </label>
              <input 
                type="date" 
                className="flex h-10 w-full rounded-md border border-input/50 bg-background/70 px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3" /> End Date
              </label>
              <input 
                type="date" 
                className="flex h-10 w-full rounded-md border border-input/50 bg-background/70 px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Group By</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading} 
                className="w-full bg-primary/20 hover:bg-primary/40 text-primary-foreground border border-primary/30"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {data.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-end">
                 <Button variant="outline" onClick={exportPDF} className="border-white/10 hover:bg-white/10">
                   <Download className="mr-2 h-4 w-4" />
                   Export PDF
                 </Button>
              </div>
              <div className="rounded-md border border-border/20 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/20 hover:bg-muted/40">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">{reportType === 'revenue' ? 'Revenue' : 'Count'}</TableHead>
                      {reportType === 'revenue' && <TableHead className="text-muted-foreground">Transaction Count</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={index} className="border-border/20 hover:bg-muted/40 transition-colors">
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="font-medium text-primary">{item.value}</TableCell>
                        {reportType === 'revenue' && <TableCell>{item.count}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </GlassCardContent>
      </GlassCard>
    </motion.div>
  );
}
