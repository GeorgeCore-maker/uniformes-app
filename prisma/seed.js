const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  console.log('🌱 Iniciando seed completo desde db.json...');

  try {
    // Leer db.json
    const dbPath = path.join(__dirname, '..', 'db.json');
    console.log('📁 Leyendo archivo:', dbPath);

    if (!fs.existsSync(dbPath)) {
      throw new Error('Archivo db.json no encontrado');
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log('✅ Archivo db.json cargado exitosamente');

    // Primero, limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.itemProduccion.deleteMany();
    await prisma.detallePedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.producto.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rol.deleteMany();

    // USUARIOS
    console.log('👤 Creando usuarios...');
    for (const user of data.users) {
      console.log(`  - Creando usuario: ${user.username}`);
      await prisma.user.create({
        data: {
          id: user.id,
          username: user.username,
          password: user.password,
          role: user.role,
          activo: user.activo,
          token: user.token,
          habilitado: user.habilitado,
          fechaDeshabilitado: parseDate(user.fechaDeshabilitado),
          createdAt: parseDate(user.createdAt),
          updatedAt: parseDate(user.updatedAt)
        }
      });
    }

    // CLIENTES
    console.log('🏢 Creando clientes...');
    for (const cliente of data.clientes) {
      console.log(`  - Creando cliente: ${cliente.nombre}`);
      await prisma.cliente.create({
        data: {
          id: cliente.id,
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          nit: cliente.nit,
          habilitado: cliente.habilitado,
          fechaDeshabilitado: parseDate(cliente.fechaDeshabilitado),
          createdAt: parseDate(cliente.createdAt),
          updatedAt: parseDate(cliente.updatedAt)
        }
      });
    }

    // CATEGORIAS
    console.log('📂 Creando categorías...');
    for (const categoria of data.categorias) {
      console.log(`  - Creando categoría: ${categoria.nombre}`);
      await prisma.categoria.create({
        data: {
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          habilitado: categoria.habilitado,
          fechaDeshabilitado: parseDate(categoria.fechaDeshabilitado),
          createdAt: parseDate(categoria.createdAt),
          updatedAt: parseDate(categoria.updatedAt)
        }
      });
    }

    // PRODUCTOS
    console.log('📦 Creando productos...');
    for (const producto of data.productos) {
      console.log(`  - Creando producto: ${producto.nombre}`);
      await prisma.producto.create({
        data: {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoria: producto.categoria,
          talla: producto.talla,
          precio: parseFloat(producto.precio),
          costo: parseFloat(producto.costo),
          stock: parseInt(producto.stock),
          stockMinimo: parseInt(producto.stockMinimo),
          requiereConfeccion: producto.requiereConfeccion,
          habilitado: producto.habilitado,
          fechaDeshabilitado: parseDate(producto.fechaDeshabilitado)
        }
      });
    }

    // PEDIDOS
    console.log('📋 Creando pedidos...');
    for (const pedido of data.pedidos) {
      console.log(`  - Creando pedido: ${pedido.numero}`);
      await prisma.pedido.create({
        data: {
          id: pedido.id,
          clienteId: pedido.clienteId,
          numero: pedido.numero,
          // estado removido - se maneja solo en DetallePedido
          incluirIva: pedido.incluirIva,
          subtotal: parseFloat(pedido.subtotal),
          impuesto: parseFloat(pedido.impuesto || 0),
          total: parseFloat(pedido.total),
          margen: parseFloat(pedido.margen || 0),
          fechaCreacion: pedido.fechaCreacion,
          observaciones: pedido.observaciones,
          habilitado: pedido.habilitado,
          fechaDeshabilitado: parseDate(pedido.fechaDeshabilitado),
          crearItemsProduccion: pedido.crearItemsProduccion || false,
          createdAt: parseDate(pedido.createdAt),
          updatedAt: parseDate(pedido.updatedAt)
        }
      });
    }

    // DETALLES DE PEDIDOS
    console.log('📝 Creando detalles de pedidos...');

    // Extraer todos los detalles de los pedidos anidados
    const allDetalles = [];
    for (const pedido of data.pedidos) {
      if (pedido.detalles && Array.isArray(pedido.detalles)) {
        // Agregar el pedidoId a cada detalle
        const detallesConPedidoId = pedido.detalles.map(detalle => ({
          ...detalle,
          pedidoId: pedido.id
        }));
        allDetalles.push(...detallesConPedidoId);
      }
    }

    for (const detalle of allDetalles) {
      console.log(`  - Creando detalle para pedido ID: ${detalle.pedidoId}`);
      await prisma.detallePedido.create({
        data: {
          id: detalle.id,
          pedidoId: detalle.pedidoId,
          productoId: detalle.productoId,
          cantidad: parseInt(detalle.cantidad),
          precioUnitario: detalle.precioUnitario.toString(),
          subtotal: detalle.subtotal ? parseFloat(detalle.subtotal) : null,
          estado: detalle.estado
        }
      });
    }

    // ITEMS DE PRODUCCION (NUEVA ESTRUCTURA - SOLO DETALLE_ID)
    console.log('🏭 Creando items de producción...');
    for (const item of data.produccion) {
      console.log(`  - Creando item de producción ID: ${item.id} - DetalleId: ${item.detalleId}`);
      await prisma.itemProduccion.create({
        data: {
          id: item.id,
          // pedidoId removido - ahora se relaciona a través de detalle
          // pedidoNumero removido - ahora se obtiene a través de detalle.pedido
          detalleId: item.detalleId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          // estado removido - ahora se maneja solo en DetallePedido
          fechaInicio: parseDate(item.fechaInicio),
          observaciones: item.observaciones,
          habilitado: item.habilitado
          // createdAt y updatedAt removidos - se manejan automáticamente por Prisma
        }
      });
    }

    // ROLES
    console.log('🔐 Creando roles...');
    for (const rol of data.roles) {
      console.log(`  - Creando rol: ${rol.nombre}`);
      await prisma.rol.create({
        data: {
          id: rol.id,
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: Array.isArray(rol.permisos) ? JSON.stringify(rol.permisos) : rol.permisos,
          activo: rol.activo,
          habilitado: rol.habilitado,
          fechaDeshabilitado: parseDate(rol.fechaDeshabilitado),
          createdAt: parseDate(rol.createdAt),
          updatedAt: parseDate(rol.updatedAt)
        }
      });
    }

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`   👤 ${data.users.length} usuarios`);
    console.log(`   🏢 ${data.clientes.length} clientes`);
    console.log(`   📂 ${data.categorias.length} categorías`);
    console.log(`   📦 ${data.productos.length} productos`);
    console.log(`   📋 ${data.pedidos.length} pedidos`);

    // Contar detalles de todos los pedidos
    const totalDetalles = data.pedidos.reduce((sum, pedido) => {
      return sum + (pedido.detalles ? pedido.detalles.length : 0);
    }, 0);
    console.log(`   📝 ${totalDetalles} detalles de pedidos`);

    console.log(`   🏭 ${data.produccion.length} items de producción (sin campo estado)`);
    console.log(`   🔐 ${data.roles.length} roles`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
