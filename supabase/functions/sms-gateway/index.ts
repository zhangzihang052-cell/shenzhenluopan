// ===== 阿里云配置 =====
const ALI_KEY_ID = Deno.env.get("ALI_ACCESS_KEY_ID") ?? "";
const ALI_KEY_SECRET = Deno.env.get("ALI_ACCESS_KEY_SECRET") ?? "";
const ALI_SIGN = Deno.env.get("ALI_SIGN_NAME") ?? "恒创联众";
const ALI_TEMPLATE = Deno.env.get("ALI_TEMPLATE_CODE") ?? "100001";

// ===== Supabase 配置 =====
const SB_URL = Deno.env.get("SB_URL") ?? "";
const SB_KEY = Deno.env.get("SB_SERVICE_KEY") ?? "";

// ===== CORS =====
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ===== 阿里云签名 =====
function pctEncode(str: string): string {
  return encodeURIComponent(String(str))
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

async function signParams(params: Record<string, string>, secret: string): Promise<string> {
  const sorted = Object.keys(params).sort();
  const canonical = sorted.map(k => `${pctEncode(k)}=${pctEncode(params[k])}`).join("&");
  const stringToSign = `GET&${pctEncode("/")}&${pctEncode(canonical)}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret + "&"),
    { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(stringToSign));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// ===== 调用阿里云 SendSms =====
async function sendSms(phone: string, signName: string, templateCode: string, templateParam: string): Promise<any> {
  const params: Record<string, string> = {
    AccessKeyId: ALI_KEY_ID,
    Action: "SendSms",
    Format: "JSON",
    Version: "2017-05-25",
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: crypto.randomUUID(),
    Timestamp: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
    PhoneNumbers: phone,
    SignName: signName,
    TemplateCode: templateCode,
    TemplateParam: templateParam,
  };
  params.Signature = await signParams(params, ALI_KEY_SECRET);

  const qs = Object.entries(params)
    .map(([k, v]) => `${pctEncode(k)}=${pctEncode(v)}`)
    .join("&");

  const resp = await fetch(`https://dysmsapi.aliyuncs.com/?${qs}`);
  const text = await resp.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

// ===== Supabase REST 辅助 =====
async function sbInsert(table: string, row: Record<string, unknown>) {
  const resp = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!resp.ok) throw new Error(`DB insert failed: ${resp.status}`);
}

async function sbSelect(table: string, filters: Record<string, string>, order: string, limit: number) {
  const qs = new URLSearchParams({ ...filters, order, limit: String(limit) });
  const resp = await fetch(`${SB_URL}/rest/v1/${table}?${qs}`, {
    headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` },
  });
  if (!resp.ok) throw new Error(`DB select failed: ${resp.status}`);
  return await resp.json();
}

async function sbUpdate(table: string, id: string, patch: Record<string, unknown>) {
  const resp = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!resp.ok) throw new Error(`DB update failed: ${resp.status}`);
}

// ===== 生成6位验证码 =====
function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ===== 主处理 =====
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const { action, phone } = body;

    if (!phone) return new Response(JSON.stringify({ success: false, error: "缺少 phone" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    if (!SB_URL || !SB_KEY) return new Response(JSON.stringify({ success: false, error: "数据库未配置" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });

    // ===== 发送验证码 =====
    if (action === "send") {
      const code = genCode();
      const templateParam = JSON.stringify({ code, min: "5" });

      const data = await sendSms(phone, ALI_SIGN, ALI_TEMPLATE, templateParam);

      if (data.Code !== "OK") {
        return new Response(JSON.stringify({ success: false, error: `阿里云: ${data.Code} - ${data.Message}` }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
      }

      // 存入数据库
      await sbInsert("otp_codes", {
        phone,
        code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        used: false,
      });

      return new Response(JSON.stringify({ success: true, message: "验证码已发送" }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // ===== 验证验证码 =====
    if (action === "verify") {
      const { code } = body;
      if (!code) return new Response(JSON.stringify({ success: false, error: "缺少 code" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

      const records = await sbSelect("otp_codes", {
        phone: `eq.${phone}`,
        used: "eq.false",
        expires_at: `gt.${new Date().toISOString()}`,
      }, "created_at.desc", 1);

      if (!records || records.length === 0) {
        return new Response(JSON.stringify({ success: false, error: "验证码无效或已过期" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
      }

      const otp = records[0];
      if (otp.code !== code) {
        return new Response(JSON.stringify({ success: false, error: "验证码不正确" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
      }

      await sbUpdate("otp_codes", otp.id, { used: true });

      // 查找或创建用户
      const users = await sbSelect("users", { phone: `eq.${phone}` }, "created_at.desc", 1);
      let user = users && users.length > 0 ? users[0] : null;

      if (!user) {
        const resp = await fetch(`${SB_URL}/rest/v1/users`, {
          method: "POST",
          headers: {
            "apikey": SB_KEY,
            "Authorization": `Bearer ${SB_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
          },
          body: JSON.stringify({ phone }),
        });
        const created = await resp.json();
        user = created[0];
      }

      return new Response(JSON.stringify({ success: true, user: { id: user.id, phone: user.phone } }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "未知 action" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "未知错误" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
