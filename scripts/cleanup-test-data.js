const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('prisma/uniformes.db');

const sentencias = [
  'DELETE FROM items_produccion WHERE detalleId IN (SELECT id FROM detalle_pedidos WHERE pedidoId IN (SELECT id FROM pedidos WHERE numero LIKE \'TEST-%\'))',
  'DELETE FROM detalle_pedidos WHERE pedidoId IN (SELECT id FROM pedidos WHERE numero LIKE \'TEST-%\')',
  'DELETE FROM pedidos WHERE numero LIKE \'TEST-%\'',
  'DELETE FROM items_produccion WHERE productoId IN (SELECT id FROM productos WHERE nombre LIKE \'TEST%\')',
  'DELETE FROM detalle_pedidos WHERE productoId IN (SELECT id FROM productos WHERE nombre LIKE \'TEST%\')',
  "DELETE FROM productos WHERE nombre LIKE 'TEST%'",
  "DELETE FROM clientes WHERE nit = 'TEST-NIT'",
  "DELETE FROM categorias WHERE nombre LIKE 'TEST%'",
  "DELETE FROM users WHERE username LIKE 'test-%'",
  "DELETE FROM roles WHERE nombre LIKE 'TEST_%'"
];

let pendientes = sentencias.length;
for (const sql of sentencias) {
  db.run(sql, function (err) {
    if (err) console.error('ERROR:', sql.slice(0, 60), '→', err.message);
    if (--pendientes === 0) {
      console.log('Limpieza completada.');
      db.close();
    }
  });
}
