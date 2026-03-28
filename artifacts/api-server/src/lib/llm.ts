import type { Message } from "@workspace/db";

const SYSTEM_PROMPT = `Вы — LegalAssist AI, профессиональный юридический помощник, специализирующийся на российском праве в сфере частной собственности. Ваша специализация:
- Сделки с жилой недвижимостью (купля-продажа, дарение, мена, аренда квартир и домов)
- Сделки с транспортными средствами (купля-продажа автомобилей, регистрация, снятие с учёта)
- Юридические лица и ИП (регистрация, ликвидация, сделки)

Отвечайте на русском языке. Давайте точные, практические советы на основе действующего законодательства РФ. Структурируйте ответы с использованием списков и абзацев для лучшей читаемости. При необходимости указывайте конкретные статьи законов и нормативных актов.

Важно: Вы предоставляете справочную юридическую информацию. Для принятия юридически значимых решений рекомендуйте обратиться к практикующему юристу.`;

type MessageRole = "user" | "assistant";

interface LlmMessage {
  role: MessageRole;
  content: string;
}

function buildMessages(history: Message[]): LlmMessage[] {
  return history.map((m) => ({
    role: m.role as MessageRole,
    content: m.content,
  }));
}

export async function getLlmResponse(history: Message[]): Promise<string> {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = "gpt-5.2";

  if (!apiKey || !baseUrl) {
    return "⚠️ LLM-интеграция не настроена. Обратитесь к администратору.";
  }

  const messages = buildMessages(history);
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_completion_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "Извините, не удалось получить ответ.";
}

export async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const isPdf = file.mimetype === "application/pdf";
  const isDocx =
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (isPdf) {
    const { default: pdfParse } = await import("pdf-parse");
    const data = await pdfParse(file.buffer);
    return data.text.slice(0, 15000);
  }

  if (isDocx) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value.slice(0, 15000);
  }

  throw new Error("Unsupported file type");
}
