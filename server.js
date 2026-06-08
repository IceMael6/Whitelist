const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const FILE = 'whitelist.json';
const HASLO = process.env.ADMIN_PASSWORD;

function load() {
  return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : [];
}
function save(list) {
  fs.writeFileSync(FILE, JSON.stringify(list));
}

app.get('/check/:userId', (req, res) => {
  const id = Number(req.params.userId);
  const list = load();
  res.json({ allowed: list.includes(id) });
});

app.post('/add', async (req, res) => {
  const { username, password } = req.body;
  if (password !== HASLO) return res.status(403).json({ error: 'Złe hasło' });

  const r = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
  const data = await r.json();
  if (!data.Id) return res.status(404).json({ error: 'Nie znaleziono gracza' });

  const list = load();
  if (!list.includes(data.Id)) {
    list.push(data.Id);
    save(list);
  }
  res.json({ success: true, username: data.Username, id: data.Id });
});

app.post('/remove', async (req, res) => {
  const { username, password } = req.body;
  if (password !== HASLO) return res.status(403).json({ error: 'Złe hasło' });

  const r = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
  const data = await r.json();
  if (!data.Id) return res.status(404).json({ error: 'Nie znaleziono gracza' });

  let list = load();
  list = list.filter(id => id !== data.Id);
  save(list);
  res.json({ success: true });
});

app.get('/list', (req, res) => {
  const { password } = req.query;
  if (password !== HASLO) return res.status(403).json({ error: 'Złe hasło' });
  res.json(load());
});

app.listen(3000, () => console.log('Działa na porcie 3000'));
