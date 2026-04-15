const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./stories.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed default stories if table is empty
  db.get("SELECT COUNT(*) as count FROM stories", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO stories (title, content, author) VALUES (?,?,?)");
      stmt.run("The 1% Rule", "James was 40kg overweight and couldn’t run 100m. He started walking 10 minutes daily. Just 10. After 1 year, he ran his first 5K. Small steps compound. 1% better every day is 37x better in a year.", "Inspired by Atomic Habits");
      stmt.run("Rejected 12 Times", "Priya applied to TELUS 12 times over 2 years. Every rejection came with feedback. She used it. On the 13th try, she got hired as Team Lead. Rejection is redirection when you learn from it.", "Community Story");
      stmt.run("The Night Shift Promise", "Ravi worked night shifts to fund his sister’s education. Sleep-deprived but never hopeless. Today, she’s a doctor and he runs his own logistics firm. Sacrifice today is someone’s future tomorrow.", "Submitted by readers");
      stmt.finalize();
    }
  });
});

// API Routes
// Get all stories
app.get('/api/stories', (req, res) => {
  db.all("SELECT * FROM stories ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new story
app.post('/api/stories', (req, res) => {
  const { title, content, author } = req.body;
  if (!title ||!content ||!author) {
    return res.status(400).json({ error: 'All fields required' });
  }

  db.run("INSERT INTO stories (title, content, author) VALUES (?,?,?)",
    [title, content, author],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, content, author });
    }
  );
});

// Subscribe email
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  db.run("INSERT INTO emails (email) VALUES (?)", [email], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Email already subscribed' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Subscribed successfully' });
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
