'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    <Card>
      <CardHeader>
        <CardTitle>Custom Report Builder</CardTitle>
        <CardDescription>Generate detailed financial reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <input 
              type="date" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <input 
              type="date" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Group By</label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger>
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={generateReport} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>

        {data.length > 0 && (
          <div>
            <div className="flex justify-end mb-4">
               <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>{reportType === 'revenue' ? 'Revenue' : 'Count'}</TableHead>
                    {reportType === 'revenue' && <TableHead>Transaction Count</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.value}</TableCell>
                      {reportType === 'revenue' && <TableCell>{item.count}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
