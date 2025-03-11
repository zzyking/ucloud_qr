import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

type Params = {
  id: string;
  siteId: string;
  classLessonId: string;
};

let storedParams: Params | null = null;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/params', (req, res) => {
  storedParams ? res.json(storedParams) : res.status(404).json({ message: 'No params' });
});

app.post('/api/params', (req, res) => {
  storedParams = req.body;
  res.json(storedParams);
});

app.delete('/api/params', (req, res) => {
    storedParams = null;
    res.status(204).send();
  });

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});