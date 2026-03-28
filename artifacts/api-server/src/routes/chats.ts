import { Router, type IRouter } from "express";
import multer from "multer";
import { eq, and, asc } from "drizzle-orm";
import { db, chatsTable, messagesTable } from "@workspace/db";
import {
  CreateChatBody,
  SendMessageBody,
  GetChatParams,
  DeleteChatParams,
  SendMessageParams,
  UploadDocumentParams,
} from "@workspace/api-zod";
import { getLlmResponse, extractTextFromFile } from "../lib/llm";

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are allowed"));
    }
  },
});

router.get("/chats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const chats = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, req.user.id))
    .orderBy(chatsTable.updatedAt);
  chats.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  res.json(chats);
});

router.post("/chats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [chat] = await db
    .insert(chatsTable)
    .values({ userId: req.user.id, title: parsed.data.title })
    .returning();
  res.status(201).json(chat);
});

router.get("/chats/:chatId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetChatParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(
      and(
        eq(chatsTable.id, params.data.chatId),
        eq(chatsTable.userId, req.user.id),
      ),
    );
  if (!chat) {
    res.status(404).json({ error: "Chat not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chat.id))
    .orderBy(asc(messagesTable.createdAt));
  res.json({ ...chat, messages });
});

router.delete("/chats/:chatId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteChatParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(
      and(
        eq(chatsTable.id, params.data.chatId),
        eq(chatsTable.userId, req.user.id),
      ),
    );
  if (!chat) {
    res.status(404).json({ error: "Chat not found" });
    return;
  }
  await db.delete(chatsTable).where(eq(chatsTable.id, chat.id));
  res.sendStatus(204);
});

router.post("/chats/:chatId/messages", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(
      and(
        eq(chatsTable.id, params.data.chatId),
        eq(chatsTable.userId, req.user.id),
      ),
    );
  if (!chat) {
    res.status(404).json({ error: "Chat not found" });
    return;
  }

  const [userMsg] = await db
    .insert(messagesTable)
    .values({ chatId: chat.id, role: "user", content: body.data.content })
    .returning();

  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chat.id))
    .orderBy(asc(messagesTable.createdAt));

  const aiText = await getLlmResponse(history);

  const [aiMsg] = await db
    .insert(messagesTable)
    .values({ chatId: chat.id, role: "assistant", content: aiText })
    .returning();

  await db
    .update(chatsTable)
    .set({ updatedAt: new Date() })
    .where(eq(chatsTable.id, chat.id));

  req.log.info({ userMsgId: userMsg.id, aiMsgId: aiMsg.id }, "Messages saved");
  res.json(aiMsg);
});

router.post(
  "/chats/:chatId/upload",
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const params = UploadDocumentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const [chat] = await db
      .select()
      .from(chatsTable)
      .where(
        and(
          eq(chatsTable.id, params.data.chatId),
          eq(chatsTable.userId, req.user.id),
        ),
      );
    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const fileName = req.file.originalname;
    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(req.file);
    } catch (err) {
      req.log.error({ err }, "Failed to extract text from document");
      res.status(400).json({ error: "Failed to read document" });
      return;
    }

    const userContent = `[Загружен документ: ${fileName}]\n\nСодержание документа:\n${extractedText}`;

    const [userMsg] = await db
      .insert(messagesTable)
      .values({
        chatId: chat.id,
        role: "user",
        content: userContent,
        fileName,
      })
      .returning();

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chat.id))
      .orderBy(asc(messagesTable.createdAt));

    const aiText = await getLlmResponse(history);

    const [aiMsg] = await db
      .insert(messagesTable)
      .values({ chatId: chat.id, role: "assistant", content: aiText })
      .returning();

    await db
      .update(chatsTable)
      .set({ updatedAt: new Date() })
      .where(eq(chatsTable.id, chat.id));

    req.log.info({ userMsgId: userMsg.id, aiMsgId: aiMsg.id, fileName }, "Document processed");
    res.json(aiMsg);
  },
);

export default router;
