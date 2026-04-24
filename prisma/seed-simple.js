// seed-simple.js - Versión simplificada para despliegue web
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  try {
    console.log('🌱 Iniciando seed básico para web...');
    
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.itemProduccion.deleteMany({});
    await prisma.detallePedido.deleteMany({});
    await prisma.pedido.deleteMany({});
    await prisma.producto.deleteMany({});
    await prisma.categoria.deleteMany({});
    await prisma.cliente.deleteMany({});
    await prisma.user.deleteMany({});

    // USUARIOS
    console.log('👤 Creando usuario admin...');
    await prisma.user.create({
      data: {
        username: "admin",
        password: "admin123", // En producción esto debería estar hasheado
        role: "ADMIN",
        activo: true,
        token: "fake-jwt-token-admin",
        habilitado: true
      }
    });

    // CLIENTES
    console.log('🏢 Creando clientes de ejemplo...');
    const cliente1 = await prisma.cliente.create({
      data: {
        nombre: "Colegio Santa María",
        telefono: "3001234567",
        email: "contacto@santamaria.edu.co",
        direccion: "Calle 10 #20-30",
        ciudad: "Bogotá",
        nit: "900123456",
        habilitado: true
      }
    });

    const cliente2 = await prisma.cliente.create({
      data: {
        nombre: "Hospital Central",
        telefono: "3007654321",
        email: "compras@hospitalcentral.com",
        direccion: "Carrera 5 #15-45",
        ciudad: "Medellín",
        nit: "901234567",
        habilitado: true
      }
    });

    // CATEGORÍAS
    console.log('📂 Creando categorías...');
    await prisma.categoria.create({
      data: {
        nombre: "UNIFORMES_ESCOLARES",
        descripcion: "Uniformes para instituciones educativas",
        habilitado: true
      }
    });

    await prisma.categoria.create({
      data: {
        nombre: "TRAJES_MEDICOS",
        descripcion: "Uniformes y equipamiento médico",
        habilitado: true
      }
    });

    // PRODUCTOS
    console.log('📦 Creando productos...');
    await prisma.producto.create({
      data: {
        nombre: "Uniforme Escolar - Vestido",
        descripcion: "Vestido para uniforme escolar",
        categoria: "UNIFORMES_ESCOLARES",
        precio: 85000,
        costo: 45000,
        requiereConfeccion: true,
        habilitado: true
      }
    });

    await prisma.producto.create({
      data: {
        nombre: "Bata Médica Blanca",
        descripcion: "Bata médica profesional",
        categoria: "TRAJES_MEDICOS",
        precio: 120000,
        costo: 60000,
        requiereConfeccion: true,
        habilitado: true
      }
    });

    // Obtener los productos creados
    const productos = await prisma.producto.findMany({});
    const producto1 = productos[0]; // Uniforme Escolar
    const producto2 = productos[1]; // Bata Médica

    // PEDIDO EJEMPLO
    console.log('📋 Creando pedido de ejemplo...');
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: cliente1.id,
        numero: "PED-001",
        incluirIva: false,
        subtotal: 85000,
        total: 85000,
        margen: 40000,
        fechaCreacion: new Date().toISOString(),
        observaciones: "Pedido de ejemplo para demostración",
        habilitado: true
      }
    });

    // DETALLE DEL PEDIDO
    const detalle = await prisma.detallePedido.create({
      data: {
        pedidoId: pedido.id,
        productoId: producto1.id,
        cantidad: 1,
        precioUnitario: "85000",
        subtotal: 85000,
        estado: "PENDIENTE"
      }
    });

    // ITEM DE PRODUCCIÓN
    await prisma.itemProduccion.create({
      data: {
        detalleId: detalle.id,
        productoId: producto1.id,
        cantidad: 1,
        fechaInicio: new Date().toISOString(),
        observaciones: "Item de ejemplo para demostración",
        habilitado: true
      }
    });

    console.log('✅ Seed básico completado exitosamente');
    console.log('📊 Resumen:');
    console.log('   👤 1 usuario (admin/admin123)');
    console.log('   🏢 2 clientes');
    console.log('   📂 2 categorías');
    console.log('   📦 2 productos');
    console.log('   📋 1 pedido con 1 detalle');
    console.log('   🏭 1 item de producción');

  } catch (error) {
    console.error('❌ Error en seed básico:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
