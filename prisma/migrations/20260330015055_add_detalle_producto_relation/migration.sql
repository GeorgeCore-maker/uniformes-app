-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_detalle_pedidos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" TEXT NOT NULL,
    "subtotal" REAL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT "detalle_pedidos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "detalle_pedidos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_detalle_pedidos" ("cantidad", "estado", "id", "pedidoId", "precioUnitario", "productoId", "subtotal") SELECT "cantidad", "estado", "id", "pedidoId", "precioUnitario", "productoId", "subtotal" FROM "detalle_pedidos";
DROP TABLE "detalle_pedidos";
ALTER TABLE "new_detalle_pedidos" RENAME TO "detalle_pedidos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
