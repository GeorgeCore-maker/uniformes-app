const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('prisma/uniformes.db');

const queries = [
  ['users', 'SELECT id, username, substr(password,1,7) AS pwdPrefix, role, activo, habilitado, fechaDeshabilitado, createdAt, updatedAt, typeof(fechaDeshabilitado) AS tFecha, typeof(createdAt) AS tCreated FROM users LIMIT 3'],
  ['pedidos', 'SELECT id, numero, fechaCreacion, subtotal, total, typeof(createdAt) AS tCreated, fechaDeshabilitado FROM pedidos LIMIT 3'],
  ['detalle_pedidos', 'SELECT id, pedidoId, precioUnitario, typeof(precioUnitario) AS tPrecio, subtotal, estado FROM detalle_pedidos LIMIT 3'],
  ['items_produccion', 'SELECT id, detalleId, fechaInicio, typeof(fechaInicio) AS tFecha, createdAt FROM items_produccion LIMIT 3'],
  ['roles', 'SELECT id, nombre, typeof(permisos) AS tPermisos, substr(permisos,1,60) AS permisosSample, activo, habilitado FROM roles LIMIT 5'],
  ['productos', 'SELECT id, nombre, categoria, precio, costo, stock, stockMinimo, requiereConfeccion, habilitado FROM productos LIMIT 3'],
  ['clientes', 'SELECT id, nombre, nit, habilitado FROM clientes LIMIT 3'],
  ['categorias', 'SELECT * FROM categorias LIMIT 3'],
  ['schema_users', "SELECT sql FROM sqlite_master WHERE name='users'"],
  ['schema_pedidos', "SELECT sql FROM sqlite_master WHERE name='pedidos'"],
  ['counts', "SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM clientes) AS clientes, (SELECT count(*) FROM productos) AS productos, (SELECT count(*) FROM pedidos) AS pedidos, (SELECT count(*) FROM detalle_pedidos) AS detalles, (SELECT count(*) FROM items_produccion) AS items, (SELECT count(*) FROM roles) AS roles, (SELECT count(*) FROM categorias) AS categorias"],
];

let pending = queries.length;
queries.forEach(([name, sql]) => {
  db.all(sql, [], (err, rows) => {
    if (err) console.log(`[${name}] ERROR: ${err.message}`);
    else console.log(`[${name}]\n${JSON.stringify(rows, null, 1)}`);
    if (--pending === 0) db.close();
  });
});
