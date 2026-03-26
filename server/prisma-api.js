// API Server con Express + Prisma para SQLite (JavaScript)
// server/prisma-api.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001; // Puerto diferente para no conflictos

// Helper function para asegurar que los nuevos registros tengan habilitado: true
const ensureHabilitado = (data) => {
  return { ...data, habilitado: true };
};

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// === RUTAS DE SALUD ===
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'sqlite',
      timestamp: new Date().toISOString(),
      prisma: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'sqlite',
      error: error.message
    });
  }
});

// === USUARIOS ===
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { habilitado: true }, // Solo usuarios habilitados
      orderBy: { id: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: ensureHabilitado(req.body)
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    // Soft delete: cambiar habilitado a false en lugar de eliminar
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { habilitado: false }
    });
    res.json({ message: 'Usuario deshabilitado', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === CLIENTES ===
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { habilitado: true }, // Solo clientes habilitados
      orderBy: { id: 'asc' }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({
      data: ensureHabilitado(req.body)
    });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    // Soft delete: cambiar habilitado a false
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(req.params.id) },
      data: { habilitado: false }
    });
    res.json({ success: true, message: 'Cliente deshabilitado', cliente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === CATEGORÍAS ===
app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categorias', async (req, res) => {
  try {
    const categoria = await prisma.categoria.create({
      data: req.body
    });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categorias/:id', async (req, res) => {
  try {
    const categoria = await prisma.categoria.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categorias/:id', async (req, res) => {
  try {
    await prisma.categoria.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ROLES ===
// Endpoint virtual para roles (basado en valores del campo role en Users)
app.get('/api/roles', async (req, res) => {
  try {
    // Roles disponibles en el sistema
    const rolesDisponibles = [
      {
        id: 1,
        nombre: 'ADMIN',
        descripcion: 'Administrador del sistema',
        permisos: ['usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'pedidos.crear', 'pedidos.editar', 'productos.crear', 'productos.editar', 'reportes.ver'],
        activo: true,
        habilitado: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        nombre: 'VENDEDOR',
        descripcion: 'Vendedor',
        permisos: ['pedidos.crear', 'pedidos.editar', 'clientes.crear', 'clientes.editar', 'productos.ver'],
        activo: true,
        habilitado: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        nombre: 'OPERARIO',
        descripcion: 'Operario de producción',
        permisos: ['produccion.ver', 'produccion.editar', 'inventario.ver'],
        activo: true,
        habilitado: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filtrar por habilitado si se proporciona el parámetro
    const habilitado = req.query.habilitado;
    if (habilitado === 'true') {
      const rolesFiltrados = rolesDisponibles.filter(role => role.habilitado === true);
      res.json(rolesFiltrados);
    } else {
      res.json(rolesDisponibles);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/roles/:id', async (req, res) => {
  try {
    const rolesDisponibles = [
      {
        id: 1,
        nombre: 'ADMIN',
        descripcion: 'Administrador del sistema',
        permisos: ['usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'pedidos.crear', 'pedidos.editar', 'productos.crear', 'productos.editar', 'reportes.ver'],
        activo: true,
        habilitado: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        nombre: 'VENDEDOR',
        descripcion: 'Vendedor',
        permisos: ['pedidos.crear', 'pedidos.editar', 'clientes.crear', 'clientes.editar', 'productos.ver'],
        activo: true,
        habilitado: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        nombre: 'OPERARIO',
        descripcion: 'Operario de producción',
        permisos: ['produccion.ver', 'produccion.editar', 'inventario.ver'],
        activo: true,
        habilitado: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const role = rolesDisponibles.find(r => r.id === parseInt(req.params.id));
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});// === PRODUCTOS ===
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { habilitado: true }, // Solo productos habilitados
      include: {
        categoriaRef: true
      },
      orderBy: { id: 'asc' }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const producto = await prisma.producto.create({
      data: ensureHabilitado(req.body),
      include: {
        categoriaRef: true
      }
    });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  try {
    const producto = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        categoriaRef: true
      }
    });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    // Soft delete: cambiar habilitado a false
    const producto = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: { habilitado: false }
    });
    res.json({ success: true, message: 'Producto deshabilitado', producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === PEDIDOS ===
app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { habilitado: true }, // Solo pedidos habilitados
      include: {
        cliente: true,
        creador: true,
        detalles: {
          where: { habilitado: true }, // Solo detalles habilitados
          include: {
            producto: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pedidos/:id', async (req, res) => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        cliente: true,
        creador: true,
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pedidos', async (req, res) => {
  try {
    const pedido = await prisma.pedido.create({
      data: ensureHabilitado(req.body),
      include: {
        cliente: true,
        creador: true,
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pedidos/:id', async (req, res) => {
  try {
    const pedido = await prisma.pedido.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        cliente: true,
        creador: true,
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pedidos/:id', async (req, res) => {
  try {
    // Soft delete: cambiar habilitado a false
    const pedido = await prisma.pedido.update({
      where: { id: parseInt(req.params.id) },
      data: { habilitado: false }
    });
    res.json({ message: 'Pedido deshabilitado', pedido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === INVENTARIO ===
app.get('/api/inventario', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoriaRef: true
      },
      where: {
        habilitado: true // Usar habilitado en lugar de activo
      },
      orderBy: { nombre: 'asc' }
    });

    const inventario = productos.map(producto => {
      let estado = 'NORMAL';
      if (producto.stockActual <= 0) {
        estado = 'CRÍTICO';
      } else if (producto.stockActual <= producto.stockMinimo) {
        estado = 'BAJO';
      }

      return {
        ...producto,
        estado
      };
    });

    res.json(inventario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === PRODUCCIÓN ===
app.get('/api/produccion', async (req, res) => {
  try {
    const items = await prisma.itemProduccion.findMany({
      where: { habilitado: true }, // Solo items habilitados
      include: {
        producto: true,
        detallePedido: {
          include: {
            pedido: {
              include: {
                cliente: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener items pendientes de producción (basado en pedidos)
app.get('/api/produccion/pendientes', async (req, res) => {
  try {
    // Obtener pedidos con detalles que requieren confección
    const pedidosPendientes = await prisma.pedido.findMany({
      include: {
        cliente: true,
        creador: true,
        detalles: {
          include: {
            producto: true
          },
          where: {
            habilitado: true, // Solo detalles habilitados
            producto: {
              requiereConfeccion: true,
              habilitado: true // Solo productos habilitados
            }
          }
        }
      },
      where: {
        habilitado: true, // Solo pedidos habilitados
        estado: {
          in: ['PENDIENTE', 'EN_CONFECCION']
        }
      }
    });

    // Convertir detalles de pedidos en items de producción pendientes
    const itemsPendientes = [];

    pedidosPendientes.forEach(pedido => {
      pedido.detalles.forEach(detalle => {
        if (detalle.producto.requiereConfeccion) {
          itemsPendientes.push({
            id: `pending_${pedido.id}_${detalle.id}`,
            pedidoId: pedido.id,
            detallePedidoId: detalle.id,
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            estado: detalle.estado || 'PENDIENTE',
            fechaInicio: null,
            fechaFin: null,
            observaciones: `Confección requerida para ${detalle.producto.nombre}`,
            // Datos del pedido y cliente para mostrar
            pedido: {
              numero: pedido.numero,
              cliente: pedido.cliente
            },
            producto: detalle.producto,
            isPending: true // Flag para identificar items pendientes
          });
        }
      });
    });

    res.json(itemsPendientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/produccion', async (req, res) => {
  try {
    const item = await prisma.itemProduccion.create({
      data: ensureHabilitado(req.body),
      include: {
        producto: true,
        detallePedido: {
          include: {
            pedido: {
              include: {
                cliente: true
              }
            }
          }
        }
      }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/produccion/:id', async (req, res) => {
  try {
    const item = await prisma.itemProduccion.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        producto: true,
        detallePedido: {
          include: {
            pedido: {
              include: {
                cliente: true
              }
            }
          }
        }
      }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/produccion/:id', async (req, res) => {
  try {
    // Soft delete: cambiar habilitado a false
    const item = await prisma.itemProduccion.update({
      where: { id: parseInt(req.params.id) },
      data: { habilitado: false }
    });
    res.json({ message: 'Item de producción deshabilitado', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    available_routes: [
      'GET /api/health - Estado del servidor',
      'GET /api/users - Usuarios (CRUD completo)',
      'GET /api/clientes - Clientes (CRUD completo)',
      'GET /api/categorias - Categorías (CRUD completo)',
      'GET /api/roles - Roles (solo lectura)',
      'GET /api/productos - Productos (CRUD completo)',
      'GET /api/pedidos - Pedidos (CRUD completo)',
      'GET /api/inventario - Inventario',
      'GET /api/produccion - Producción (CRUD completo)'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 ===============================================');
  console.log('   UNIFORMES APP - API Server con Prisma + SQLite');
  console.log('🚀 ===============================================');
  console.log(`📡 Servidor: http://localhost:${PORT}`);
  console.log(`💾 Base de datos: SQLite (uniformes.db)`);
  console.log(`🔧 DBeaver: Conectar a ${__dirname}/../prisma/uniformes.db`);
  console.log('📊 Endpoints disponibles:');
  console.log('   - GET /api/health       - Estado del servidor');
  console.log('   - GET /api/users        - Usuarios');
  console.log('   - GET /api/clientes     - Clientes');
  console.log('   - GET /api/categorias   - Categorías');
  console.log('   - GET /api/roles        - Roles');
  console.log('   - GET /api/productos    - Productos');
  console.log('   - GET /api/pedidos      - Pedidos');
  console.log('   - GET /api/inventario   - Inventario');
  console.log('   - GET /api/produccion   - Producción');
  console.log('================================================\n');
});

// Cerrar conexión al terminar
process.on('SIGINT', async () => {
  console.log('Cerrando conexión a la base de datos...');
  await prisma.$disconnect();
  process.exit(0);
});
