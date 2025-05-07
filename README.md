
# 📡 Real-Time Counter App

A real-time counter app built with **React**, **Vite**, and **Supabase**.  
It demonstrates WebSocket-based synchronization, optimistic UI updates, error rollback, and leaderboard tracking.

## 🌐 Live Demo
* 🚀 Live: *[Demo](https://my-app-nine-psi-29.vercel.app/) (Deploy via Vercel)*

---

## 🚀 Features

- 🔁 **Real-time sync** using Supabase Realtime (Postgres + WebSocket)
- ⚡ **Optimistic UI** update for fast feedback
- 🧯 **Rollback** on update failure
- 🧑‍💻 **Per-user leaderboard** using local UUID (no login)
- ☁️ Deployable to [Vercel](https://vercel.com)

---

## 🖼 Architecture


```
\[ React App ] ---> \[ Supabase Realtime ] ---> \[ PostgreSQL DB ]
↑                 ↓
WebSocket <---- Update listener
```

---

## 🧰 Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)

---

## ⚙️ Setup Instructions

1. **Clone this repository**

```bash
git clone https://github.com/krnomad/my-app.git
cd my-app
````

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run the app**

```bash
npm run dev
```

---

## 🧪 Supabase Setup

### Tables

```sql
-- Counter table
CREATE TABLE counter (
  id INT PRIMARY KEY,
  value INT
);

INSERT INTO counter (id, value) VALUES (1, 0);

-- Leaderboard table
CREATE TABLE leaderboard (
  user_id UUID PRIMARY KEY,
  value INT
);
```

### Realtime

```sql
-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE counter;
```

### RLS (Optional but secure)

```sql
-- Enable RLS
ALTER TABLE counter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write" ON counter FOR ALL TO public USING (true);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write" ON leaderboard FOR ALL TO public USING (true);
```

---

## 📄 License

MIT License © 2025 [krnomad](https://github.com/krnomad)


