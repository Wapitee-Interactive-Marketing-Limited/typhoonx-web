// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
const supabaseAdmin = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "");
/**
 * 统一的 CORS 头
 */ function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
/**
 * 简单邮箱校验
 */ function isValidEmail(value) {
  return /.+@.+\..+/.test(value);
}
/**
 * 主逻辑入口
 */ serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders()
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method Not Allowed"
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders()
      }
    });
  }
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: "缺少 email 或 password"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      });
    }
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        error: "邮箱格式不正确"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      });
    }
    if (password.length < 9) {
      return new Response(JSON.stringify({
        error: "密码长度至少为 9 位"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      });
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      });
    }
    const userId = data?.user?.id;
    return new Response(JSON.stringify({
      ok: true,
      userId
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders()
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err?.message ?? "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders()
      }
    });
  }
});
