'use client';

import { useState } from 'react';

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
    <div className="mx-auto w-full max-w-md p-6">
      <h3 className="mb-6 text-xl font-semibold">Create your TyphoonX account</h3>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input id="email" type="email" className="w-full border rounded px-3 py-2"
                 value={email} onChange={e => setEmail(e.target.value)}
                 placeholder="you@wapitee.io" required />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input id="password" type="password" className="w-full border rounded px-3 py-2"
                 value={password} onChange={e => setPassword(e.target.value)}
                 minLength={6} required />
        </div>
        <div>
          <label htmlFor="confirm" className="block mb-1">Confirm Password</label>
          <input id="confirm" type="password" className="w-full border rounded px-3 py-2"
                 value={confirm} onChange={e => setConfirm(e.target.value)}
                 minLength={6} required />
        </div>
        <button type="submit" disabled={loading}
                className="inline-flex items-center rounded bg-black px-4 py-2 text-white disabled:opacity-60">
          {loading ? 'Submitting...' : 'Sign up'}
        </button>
        {msg && (
          <p className={msg.type === 'error' ? 'text-red-600 mt-2' : 'text-green-700 mt-2'}>{msg.text}</p>
        )}
      </form>
    </div>
  );
}


