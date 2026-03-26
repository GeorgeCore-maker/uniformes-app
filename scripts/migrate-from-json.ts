// Script de migración de db.json a SQLite
// scripts/migrate-from-json.ts

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JsonDatabase {
  users: any[];
  clientes: any[];
  categorias: any[];
  productos: any[];
  pedidos?: any[];
  detallePedidos?: any[];
  itemsProduccion?: any[];
}

async function migrarDatos() {
  try {
    console.log('🚀 Iniciando migración de db.json a SQLite...');

    // Leer datos actuales
    const dbPath = path.join(process.cwd(), 'db.json');
    if (!fs.existsSync(dbPath)) {
      throw new Error('❌ No se encontró el archivo db.json');
    }

    const rawData = fs.readFileSync(dbPath, 'utf8');
    const jsonDb: JsonDatabase = JSON.parse(rawData);

    console.log('📦 Datos leídos desde db.json');

    // Limpiar base de datos existente
    console.log('🧹 Limpiando base de datos...');
    await prisma.movimientoInventario.deleteMany();
    await prisma.itemProduccion.deleteMany();
    await prisma.detallePedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.producto.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.user.deleteMany();

    // 1. Migrar usuarios
    console.log('👥 Migrando usuarios...');
    for (const user of jsonDb.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          username: user.username,
          password: user.password, // En producción se debe hashear
          role: user.role,
          activo: user.activo ?? true,
          habilitado: user.habilitado ?? true,
          token: user.token,
          fechaDeshabilitado: user.fechaDeshabilitado ? new Date(user.fechaDeshabilitado) : null,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
        }
      });
    }
    console.log(`✅ ${jsonDb.users.length} usuarios migrados`);

    // 2. Migrar clientes
    console.log('🏢 Migrando clientes...');
    for (const cliente of jsonDb.clientes) {
      await prisma.cliente.create({
        data: {
          id: cliente.id,
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          nit: cliente.nit,
          habilitado: cliente.habilitado ?? true,
          fechaDeshabilitado: cliente.fechaDeshabilitado ? new Date(cliente.fechaDeshabilitado) : null,
          createdAt: cliente.createdAt ? new Date(cliente.createdAt) : new Date(),
          updatedAt: cliente.updatedAt ? new Date(cliente.updatedAt) : new Date()
        }
      });
    }
    console.log(`✅ ${jsonDb.clientes.length} clientes migrados`);

    // 3. Migrar categorías
    console.log('📂 Migrando categorías...');
    for (const categoria of jsonDb.categorias) {
      await prisma.categoria.create({
        data: {
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          habilitado: categoria.habilitado ?? true,
          createdAt: categoria.createdAt ? new Date(categoria.createdAt) : new Date(),
          updatedAt: categoria.updatedAt ? new Date(categoria.updatedAt) : new Date()
        }
      });
    }
    console.log(`✅ ${jsonDb.categorias.length} categorías migradas`);

    // 4. Migrar productos
    console.log('🛍️ Migrando productos...');
    for (const producto of jsonDb.productos) {
      // Buscar categoria ID
      const categoria = await prisma.categoria.findFirst({
        where: { nombre: producto.categoria }
      });

      if (categoria) {
        await prisma.producto.create({
          data: {
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: parseFloat(producto.precio.toString()),
            categoria: producto.categoria,
            categoriaId: categoria.id,
            stockActual: producto.stock ?? producto.stockActual ?? 0,
            stockMinimo: producto.stockMinimo ?? 5,
            requiereConfeccion: producto.requiereConfeccion ?? false,
            activo: producto.habilitado ?? producto.activo ?? true,
            createdAt: producto.createdAt ? new Date(producto.createdAt) : new Date(),
            updatedAt: producto.updatedAt ? new Date(producto.updatedAt) : new Date()
          }
        });
      } else {
        console.warn(`⚠️ Categoría "${producto.categoria}" no encontrada para producto ${producto.nombre}`);
      }
    }
    console.log(`✅ ${jsonDb.productos.length} productos migrados`);

    // 5. Migrar pedidos (si existen)
    if (jsonDb.pedidos && jsonDb.pedidos.length > 0) {
      console.log('📋 Migrando pedidos...');
      for (const pedido of jsonDb.pedidos) {
        // Validar fechas
        let fechaPedido = new Date();
        if (pedido.fechaCreacion) {
          // Intentar parsear la fecha
          const parsed = new Date(pedido.fechaCreacion);
          if (!isNaN(parsed.getTime())) {
            fechaPedido = parsed;
          }
        }

        let fechaCreated = new Date();
        if (pedido.createdAt) {
          const parsed = new Date(pedido.createdAt);
          if (!isNaN(parsed.getTime())) {
            fechaCreated = parsed;
          }
        }

        let fechaUpdated = new Date();
        if (pedido.updatedAt) {
          const parsed = new Date(pedido.updatedAt);
          if (!isNaN(parsed.getTime())) {
            fechaUpdated = parsed;
          }
        }

        await prisma.pedido.create({
          data: {
            id: pedido.id,
            numero: pedido.numero,
            clienteId: pedido.clienteId,
            creadorId: pedido.creadorId || 1, // Asignar admin por defecto si no existe
            fechaPedido: fechaPedido,
            fechaEntrega: null, // No hay fecha de entrega en el formato actual
            estado: pedido.estado || 'PENDIENTE',
            descuento: 0, // No hay descuento en el formato actual
            total: parseFloat(pedido.total?.toString() || '0'),
            observaciones: pedido.observaciones,
            createdAt: fechaCreated,
            updatedAt: fechaUpdated
          }
        });

        // Migrar detalles del pedido si están anidados
        if (pedido.detalles && Array.isArray(pedido.detalles)) {
          for (const detalle of pedido.detalles) {
            await prisma.detallePedido.create({
              data: {
                pedidoId: pedido.id,
                productoId: detalle.productoId,
                cantidad: detalle.cantidad,
                precioUnit: parseFloat(detalle.precioUnitario?.toString() || '0'),
                subtotal: parseFloat(detalle.subtotal?.toString() || (detalle.cantidad * parseFloat(detalle.precioUnitario?.toString() || '0'))),
                estado: detalle.estado || 'PENDIENTE',
                createdAt: fechaCreated,
                updatedAt: fechaUpdated
              }
            });
          }
        }
      }
      console.log(`✅ ${jsonDb.pedidos.length} pedidos migrados`);
    }

    // 6. Migrar detalles de pedidos (si existen)
    if (jsonDb.detallePedidos && jsonDb.detallePedidos.length > 0) {
      console.log('📝 Migrando detalles de pedidos...');
      for (const detalle of jsonDb.detallePedidos) {
        await prisma.detallePedido.create({
          data: {
            id: detalle.id,
            pedidoId: detalle.pedidoId,
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnit: parseFloat(detalle.precioUnit.toString()),
            subtotal: parseFloat(detalle.subtotal.toString()),
            estado: detalle.estado || 'PENDIENTE',
            createdAt: detalle.createdAt ? new Date(detalle.createdAt) : new Date(),
            updatedAt: detalle.updatedAt ? new Date(detalle.updatedAt) : new Date()
          }
        });
      }
      console.log(`✅ ${jsonDb.detallePedidos.length} detalles de pedidos migrados`);
    }

    // 7. Migrar items de producción (si existen)
    if (jsonDb.itemsProduccion && jsonDb.itemsProduccion.length > 0) {
      console.log('🏭 Migrando items de producción...');
      for (const item of jsonDb.itemsProduccion) {
        await prisma.itemProduccion.create({
          data: {
            id: item.id,
            productoId: item.productoId,
            detallePedidoId: item.detallePedidoId,
            cantidad: item.cantidad,
            cantidadCompletada: item.cantidadCompletada ?? 0,
            estado: item.estado || 'PENDIENTE',
            prioridad: item.prioridad || 'NORMAL',
            fechaInicio: item.fechaInicio ? new Date(item.fechaInicio) : null,
            fechaFin: item.fechaFin ? new Date(item.fechaFin) : null,
            observaciones: item.observaciones,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
          }
        });
      }
      console.log(`✅ ${jsonDb.itemsProduccion.length} items de producción migrados`);
    }

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen de migración:');
    console.log(`  👥 Usuarios: ${jsonDb.users.length}`);
    console.log(`  🏢 Clientes: ${jsonDb.clientes.length}`);
    console.log(`  📂 Categorías: ${jsonDb.categorias.length}`);
    console.log(`  🛍️ Productos: ${jsonDb.productos.length}`);
    console.log(`  📋 Pedidos: ${jsonDb.pedidos?.length || 0}`);
    console.log(`  📝 Detalles de pedidos: ${jsonDb.detallePedidos?.length || 0}`);
    console.log(`  🏭 Items de producción: ${jsonDb.itemsProduccion?.length || 0}`);

    console.log('\n💾 Base de datos SQLite: ./prisma/uniformes.db');
    console.log('🔧 Para abrir en DBeaver:');
    console.log('   1. Abre DBeaver');
    console.log('   2. Nueva Conexión → SQLite');
    console.log('   3. Ruta: ' + path.join(process.cwd(), 'prisma', 'uniformes.db'));

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrarDatos();
