const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection configuration
const connection = mysql.createConnection({
  host: "localhost",
  database: "chatapp",
  user: "root",
  password: "secretpassword",
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// API endpoints
// Define your API endpoints here...
app.get('/api/messages', (req, res) => {
  const sql = 'SELECT * FROM messages';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Error fetching messages' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/messages', (req, res) => {
    const { text, sender, recipient } = req.body;
    const sql = 'INSERT INTO messages (text, sender, recipient) VALUES (?, ?, ?)';
    connection.query(sql, [text, sender, recipient], (err, result) => {
      if (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Error sending message' });
      } else {
        res.json({ id: result.insertId, text, sender, recipient });
      }
    });
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
