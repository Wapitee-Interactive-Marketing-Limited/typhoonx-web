'use client';

import { useState } from 'react';
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

/** 注册接口地址（来自环境变量，便于多环境切换） */
const SUPABASE_FUNCTION_URL =
  process.env.NEXT_PUBLIC_SIGNUP_FUNCTION_URL ??
  'https://potpgjiuqimpbrhdafnz.supabase.co/functions/v1/user_signup';
/** 允许的邮箱域名 */
const ALLOWED_DOMAIN = 'wapitee.io';

/** 简单邮箱校验 */
function isValidEmail(value: string): boolean {
  return /.+@.+\..+/.test(value);
}

/** 域名校验 */
function isAllowedDomain(value: string, allowedDomain: string): boolean {
  const at = value.lastIndexOf('@');
  if (at < 0) return false;
  const domain = value.slice(at + 1).toLowerCase();
  return domain === allowedDomain.toLowerCase();
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  /** 提交注册 */
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!isValidEmail(email)) {
      setMsg({ type: 'error', text: '请输入有效的邮箱地址。' });
      return;
    }
    if (!isAllowedDomain(email, ALLOWED_DOMAIN)) {
      setMsg({ type: 'error', text: '目前仅支持使用 @wapitee.io 邮箱注册。' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: '密码长度至少为 6 位。' });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: 'error', text: '两次密码输入不一致。' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ type: 'error', text: data?.error || '注册失败，请稍后重试。' });
      } else {
        setMsg({ type: 'success', text: '注册成功，请检查邮箱以完成验证（若已启用）。' });
        setEmail(''); setPassword(''); setConfirm('');
      }
    } catch {
      setMsg({ type: 'error', text: '网络错误，请稍后重试。' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your TyphoonX account</DialogTitle>
            <DialogDescription>
              使用你的公司邮箱注册（当前仅支持 <span className="font-medium">@wapitee.io</span>）。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@wapitee.io" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={6} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Sign up'}
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


