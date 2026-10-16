import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import session from "express-session";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "development-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ message: "Не авторизован" });
  next();
};

const toTask = (task) => ({
  id: task.id,
  title: task.title,
  desc: task.description,
  priority: task.priority,
  status: task.status,
  createdAt: task.created_at,
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({ message: "Введите имя, email и пароль минимум из 6 символов" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existing.length) return res.status(409).json({ message: "Пользователь с таким email уже существует" });

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash],
    );
    const user = { id: result.insertId, name: name.trim(), email: normalizedEmail };
    req.session.user = user;
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось зарегистрировать пользователя" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email?.trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }
    req.session.user = publicUser(user);
    res.json({ user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось выполнить вход" });
  }
});

app.get("/api/auth/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Не авторизован" });
  res.json({ user: req.session.user });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ message: "Не удалось выйти из аккаунта" });
    res.clearCookie("connect.sid");
    res.status(204).end();
  });
});

app.get("/api/tasks", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, description, priority, status, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [req.session.user.id],
    );
    res.json({ tasks: rows.map(toTask) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось загрузить задачи" });
  }
});

app.post("/api/tasks", requireAuth, async (req, res) => {
  try {
    const { title, desc = "", priority = "низкий", status = "Очередь" } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Название задачи обязательно" });
    const [result] = await pool.execute(
      "INSERT INTO tasks (user_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?)",
      [req.session.user.id, title.trim(), desc, priority, status],
    );
    const [rows] = await pool.execute(
      "SELECT id, title, description, priority, status, created_at FROM tasks WHERE id = ? AND user_id = ?",
      [result.insertId, req.session.user.id],
    );
    res.status(201).json({ task: toTask(rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось создать задачу" });
  }
});

app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const { title, desc, priority, status } = req.body;
    const [result] = await pool.execute(
      "UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), priority = COALESCE(?, priority), status = COALESCE(?, status) WHERE id = ? AND user_id = ?",
      [title?.trim() || null, desc ?? null, priority ?? null, status ?? null, req.params.id, req.session.user.id],
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Задача не найдена" });
    const [rows] = await pool.execute(
      "SELECT id, title, description, priority, status, created_at FROM tasks WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.user.id],
    );
    res.json({ task: toTask(rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось обновить задачу" });
  }
});

app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", [req.params.id, req.session.user.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Задача не найдена" });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось удалить задачу" });
  }
});

app.delete("/api/tasks", requireAuth, async (req, res) => {
  try {
    await pool.execute("DELETE FROM tasks WHERE user_id = ?", [req.session.user.id]);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось удалить задачи" });
  }
});

app.listen(port, () => console.log(`API server started on http://localhost:${port}`));