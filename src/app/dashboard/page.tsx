'use client'

import { useState } from 'react'
import { FaArrowRight } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from '@/components/ui/card'

type record = {
  paymentId: string;
  status: string;
  amount: Number;
  cardNumber: string;
  cardExpiry: string;
  brand: string;
  createdAt: Timestamp;
  capturedAt: Timestamp;
  voidedAt: Timestamp;
  refundedAt: Timestamp;
}

const dashboard = () => {  
  const [records, setRecords] = useState([])
  const formSchema = z.object({
    paymentId: z.string().max(36),
    startDate: z.string(),
    endDate: z.string(),
    status: z.string(),
  })

  const today = new Date().toISOString().split('T')[0]
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentId: "",
      startDate: today,
      endDate: today,
      status: "",
    },
  })

  const handleSearch = async (values: z.infer<typeof formSchema>) => {
    try {
      const jsonBody = JSON.stringify(
        Object.entries(values).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>)
      );

      const res = await fetch('http://localhost:55555/api/payment-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonBody
      })
      if (!res.ok) setRecords([])
      const data = (await res.json()).paymentRecords
      const filteredRecords = data?.filter((record: record) => {
        const selectedStatus = form.getValues().status
        if (!selectedStatus || selectedStatus === "All") return true
        return record.status === selectedStatus.toLowerCase()
      })
      setRecords(filteredRecords)
    } catch (err) {
      console.error('検索失敗:', err)
    }
  }
  const maskMiddleCardNum = (cardNumber: string) => {
    const first4 = cardNumber.slice(0, 4)
    const last4 = cardNumber.slice(-4)
    const maskedMiddle = '*'.repeat(Math.max(0, cardNumber.length - 8))
    const masked = `${first4}${maskedMiddle}${last4}`;
    return masked.match(/.{1,4}/g)?.join(' ') ?? masked;
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="h-1/3 w-full bg-white overflow-auto px-12 mt-6">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4 ml-6">
              <div className="flex justify-between">
                <div>  
                  <FormField
                    control={form.control}
                    name="paymentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Id</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Payment Id"
                            {...field}
                            className="w-[400px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-6 mr-10">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>StartDate</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="w-[125px]" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FaArrowRight className="mt-8"/>
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EndDate</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="w-[125px]" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select {...field} className="w-[125px] border rounded px-3 py-2 text-sm">
                            <option value="">All</option>
                            <option value="Authorised">Authorised</option>
                            <option value="Captured">Captured</option>
                            <option value="Voided">Voided</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button type="submit">Search</Button>
            </form>
          </Form>
        </Card>
      </div>
      <div className="h-2/3 px-12">
        <Table>
          <TableCaption>A list of your recent payments.</TableCaption>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead>Authorised At</TableHead>
              <TableHead>Id</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>CardNumber</TableHead>
              <TableHead>CardExpiry</TableHead>
              <TableHead>brand</TableHead>
              <TableHead>Captured At</TableHead>
              <TableHead>Voided At</TableHead>
              <TableHead>Refunded At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {records?.map((record: record) => (
            <TableRow key={record.paymentId}>
              <TableCell>{record.createdAt || '-'}</TableCell>
              <TableCell>{record.paymentId}</TableCell>
              <TableCell>{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</TableCell>
              <TableCell>{`\\${record.amount.toFixed(2)}`}</TableCell>
              <TableCell>{maskMiddleCardNum(record.cardNumber)}</TableCell>
              <TableCell>{record.cardExpiry}</TableCell>
              <TableCell>{record.brand}</TableCell>
              <TableCell>{record.capturedAt || '-'}</TableCell>
              <TableCell>{record.voidedAt || '-'}</TableCell>
              <TableCell>{record.refundedAt || '-'}</TableCell>
            </TableRow>
          ))}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
      </div>
    </div>
  )
}

export default dashboard