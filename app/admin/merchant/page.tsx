'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Merchant = {
  merchant_id: string;
  merchant_name: string;
  domain?: string;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newStatus, setNewStatus] = useState('active');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://potpgjiuqimpbrhdafnz.supabase.co';
  const listUrl = process.env.NEXT_PUBLIC_MERCHANT_LIST_URL ?? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/get-merchant-list`;
  // 创建与查询使用同一函数（支持 GET/POST）：get-merchant-list
  const manageUrl = process.env.NEXT_PUBLIC_MERCHANT_MANAGE_URL ?? listUrl;

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
      // apikey 使用 anon key（优先 env，其次内置默认值）
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdHBnaml1cWltcGJyaGRhZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzc0NTgsImV4cCI6MjA3NDU1MzQ1OH0.s-m9tLoZj9nqf81k-fG5AtN-DDKWTUCyTULkAL4POjI';
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

  /**
   * 复制商户 ID 到剪贴板
   * @param {string} id
   * @returns {Promise<void>}
   */
  async function copyMerchantId(id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // 兼容性回退
      const textarea = document.createElement('textarea');
      textarea.value = id;
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  }

  async function onLogout() {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } finally {
      localStorage.removeItem('tpx_access_token');
      window.location.assign('/login');
    }
  }

  async function onCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateMsg(null);
    if (!newName.trim()) { setCreateMsg('请输入商户名称'); return; }
    if (!newDomain.trim()) { setCreateMsg('请输入域名'); return; }
    const accessToken = localStorage.getItem('tpx_access_token');
    if (!accessToken) { window.location.assign('/login'); return; }
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdHBnaml1cWltcGJyaGRhZm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzc0NTgsImV4cCI6MjA3NDU1MzQ1OH0.s-m9tLoZj9nqf81k-fG5AtN-DDKWTUCyTULkAL4POjI';

    setCreateLoading(true);
    try {
      const res = await fetch(manageUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ merchant_name: newName.trim(), domain: newDomain.trim(), status: newStatus })
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.success) {
        setCreateMsg(data?.message || `创建失败（${res.status}）。请稍后重试`);
        return;
      }
      setCreateMsg('创建成功');
      setNewName(''); setNewDomain(''); setNewStatus('active');
      setCreateOpen(false);
      setLoading(true);
      await fetchMerchants();
    } catch (err: any) {
      setCreateMsg(err?.message || '网络错误');
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Merchants</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>Create New</Button>
          <Button variant="outline" onClick={onLogout}>Logout</Button>
        </div>
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
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchants.map((m) => (
                <TableRow key={m.merchant_id}>
                  <TableCell className="font-mono text-sm">
                    <button
                      type="button"
                      onClick={() => copyMerchantId(m.merchant_id)}
                      title="点击复制"
                      className="underline decoration-dotted underline-offset-4 hover:no-underline focus:outline-none"
                    >
                      {m.merchant_id}
                    </button>
                    {copiedId === m.merchant_id && (
                      <span className="ml-2 text-xs text-green-600 align-middle">已复制</span>
                    )}
                  </TableCell>
                  <TableCell>{m.merchant_name}</TableCell>
                  <TableCell>{m.domain || '-'}</TableCell>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Merchant</DialogTitle>
            <DialogDescription>新增商户信息。</DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="merchant_name" className="text-sm font-medium">Merchant Name</label>
              <input id="merchant_name" className="w-full border rounded px-3 py-2" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="domain" className="text-sm font-medium">Domain</label>
              <input id="domain" className="w-full border rounded px-3 py-2" value={newDomain} onChange={e => setNewDomain(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select id="status" className="w-full border rounded px-3 py-2" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            {createMsg && <p className="text-sm text-red-600">{createMsg}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


