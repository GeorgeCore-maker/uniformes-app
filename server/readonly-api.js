// API Server en modo solo lectura para usar con DBeaver
// server/readonly-api.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3002; // Puerto diferente

// Middlewares
app.use(cors());
app.use(express.json());

console.log('🔍 ===============================================');
console.log('   UNIFORMES APP - API Server (SOLO LECTURA)');
console.log('🔍 ===============================================');
console.log(`📡 Servidor: http://localhost:${PORT}`);
console.log('💾 Base de datos: SQLite (solo consultas)');
console.log('📋 Compatible con DBeaver simultáneo');
console.log('================================================\n');

// Solo endpoints GET (lectura)
app.get('/api/health', async (req, res) => {
  res.json({ status: 'readonly', port: PORT });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { habilitado: true },
      orderBy: { id: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { habilitado: true },
      orderBy: { id: 'asc' }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor readonly corriendo en puerto ${PORT}`);
});
