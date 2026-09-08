export const runtime = "nodejs";

export async function POST(request) {
  try {
    // 1. استقبال الرسائل من المستخدم
    const { messages = [] } = await request.json();
    
    // 2. التحقق من وجود مفتاح API
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return Response.json({ 
        error: "لم يتم إعداد DEEPSEEK_API_KEY في Vercel." 
      }, { status: 500 });
    }
    
    // 3. التأكد من وجود رسائل
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ 
        error: "أرسل رسالة أولاً." 
      }, { status: 400 });
    }

    // 4. تحديد النموذج (deepseek-chat أو deepseek-reasoner)
    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    
    // 5. تحويل الرسائل إلى صيغة DeepSeek
    const formattedMessages = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }));

    // 6. إضافة تعليمات النظام (System Instructions)
    const systemMessage = {
      role: "system",
      content: "أنت مساعد عربي ذكي وودود. أجب بوضوح وباختصار مناسب."
    };
    
    const finalMessages = [systemMessage, ...formattedMessages];

    // 7. إرسال الطلب إلى DeepSeek API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    // 8. استقبال الرد
    const data = await response.json();
    
    // 9. التحقق من وجود أخطاء
    if (!response.ok) {
      const msg = data?.error?.message || "فشل الاتصال بـ DeepSeek.";
      return Response.json({ error: msg }, { status: response.status });
    }

    // 10. استخراج الرد وإرساله للمستخدم
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return Response.json({ 
        error: "لم يُرجع DeepSeek نصًا." 
      }, { status: 502 });
    }
    
    return Response.json({ reply });
    
  } catch (err) {
    return Response.json({ 
      error: err?.message || "حدث خطأ في الخادم." 
    }, { status: 500 });
  }
}
