'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

const ALLOWED_DOMAIN = 'wapitee.io';

function isValidEmail(value: string): boolean {
  return /.+@.+\..+/.test(value);
}

function isAllowedDomain(value: string, allowedDomain: string): boolean {
  const at = value.lastIndexOf('@');
  if (at < 0) return false;
  const domain = value.slice(at + 1).toLowerCase();
  return domain === allowedDomain.toLowerCase();
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!isValidEmail(email)) {
      setMsg({ type: 'error', text: '请输入有效的邮箱地址。' });
      return;
    }
    if (!isAllowedDomain(email, ALLOWED_DOMAIN)) {
      setMsg({ type: 'error', text: '目前仅支持使用 @wapitee.io 邮箱登录。' });
      return;
    }
    if (!password) {
      setMsg({ type: 'error', text: '请输入密码。' });
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg({ type: 'error', text: error.message });
        return;
      }
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setMsg({ type: 'error', text: '登录失败，请重试。' });
        return;
      }
      localStorage.setItem('tpx_access_token', accessToken);
      setMsg({ type: 'success', text: '登录成功，正在跳转...' });
      window.location.assign('/admin/merchant');
    } catch (e) {
      setMsg({ type: 'error', text: '网络错误，请稍后再试。' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>使用你的公司邮箱登录后台。</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@wapitee.io" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            {msg && (
              <p className={msg.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-green-700'}>{msg.text}</p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


