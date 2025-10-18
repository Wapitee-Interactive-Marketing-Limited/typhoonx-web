'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Merchant = {
  merchant_id: string;
  merchant_name: string;
  status: string;
  created_at: string;
};

type MerchantResponse = {
  success: boolean;
  user_email: string;
  user_id: string;
  merchant_count: number;
  merchants: Merchant[];
  timestamp: string;
};

export default function MerchantAdminPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listUrl = process.env.NEXT_PUBLIC_MERCHANT_LIST_URL;

  const fetchMerchants = useMemo(() => async () => {
    const accessToken = localStorage.getItem('tpx_access_token');
    if (!accessToken) {
      window.location.assign('/login');
      return;
    }
    if (!listUrl) {
      setError('缺少 NEXT_PUBLIC_MERCHANT_LIST_URL');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      // apikey 使用 anon key
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': anonKey ?? '',
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `请求失败，状态码 ${res.status}`);
      }
      const data = (await res.json()) as MerchantResponse;
      if (!data.success) {
        throw new Error('接口返回失败。');
      }
      setMerchants(data.merchants || []);
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [listUrl]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  async function onLogout() {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } finally {
      localStorage.removeItem('tpx_access_token');
      window.location.assign('/login');
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Merchants</h2>
        <Button variant="outline" onClick={onLogout}>Logout</Button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchants.map((m) => (
                <TableRow key={m.merchant_id}>
                  <TableCell className="font-mono text-sm">{m.merchant_id}</TableCell>
                  <TableCell>{m.merchant_name}</TableCell>
                  <TableCell>{m.status}</TableCell>
                  <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {merchants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}


