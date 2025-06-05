require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());

// Parsear la URL de conexión de MySQL desde la variable de entorno
const dbUrl = new URL(process.env.MYSQL_PUBLIC_URL);

const connection = mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // eliminar la barra inicial '/'
  port: dbUrl.port,
});

connection.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos de Railway');
});

// Endpoint para agregar un usuario
app.post('/usuarios', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'Falta el nombre' });
  }

  connection.query(
    'INSERT INTO usuarios (nombre) VALUES (?)',
    [nombre],
    (err, results) => {
      if (err) {
        console.error('❌ Error al insertar usuario:', err);
        return res.status(500).json({ error: 'Error al insertar usuario' });
      }
      res.status(201).json({ id: results.insertId, nombre });
    }
  );
});

// Endpoint para listar usuarios
app.get('/usuarios', (req, res) => {
  connection.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
