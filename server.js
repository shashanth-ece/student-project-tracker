import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.static('public'));

app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});
