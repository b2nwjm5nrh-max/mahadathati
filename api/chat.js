export const runtime = "nodejs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY غير موجود في Vercel."
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const messages = Array.isArray(body?.messages)
      ? body.messages
      : [];

    const contents = messages
      .filter(
        (m) =>
          m &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: m.content
          }
        ]
      }));

    if (!contents.length) {
      return res.status(400).json({
        error: "لا توجد رسالة."
      });
    }

    const model =
      process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${encodeURIComponent(model)}:generateContent`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "أنت مساعد ذكي داخل موقع محادثتي. " +
                "أجب باللغة العربية عندما يكتب المستخدم بالعربية، " +
                "وكن واضحًا ومفيدًا ودقيقًا. " +
                "يمكنك الإجابة عن الأسئلة، الترجمة، البرمجة، " +
                "الدراسة، الكتابة، والتلخيص."
            }
          ]
        },

        contents,

        generationConfig: {
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          `Gemini API error (${response.status})`
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      return res.status(502).json({
        error: "لم يُرجع Gemini نصًا."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع."
    });
  }
}
