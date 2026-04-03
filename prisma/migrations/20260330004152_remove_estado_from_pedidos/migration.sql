/*
  Warnings:

  - You are about to drop the column `estado` on the `pedidos` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pedidos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "incluirIva" BOOLEAN DEFAULT true,
    "subtotal" REAL NOT NULL,
    "impuesto" REAL DEFAULT 0,
    "total" REAL NOT NULL,
    "margen" REAL DEFAULT 0,
    "fechaCreacion" TEXT,
    "observaciones" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "fechaDeshabilitado" DATETIME,
    "crearItemsProduccion" BOOLEAN DEFAULT false,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_pedidos" ("clienteId", "crearItemsProduccion", "createdAt", "fechaCreacion", "fechaDeshabilitado", "habilitado", "id", "impuesto", "incluirIva", "margen", "numero", "observaciones", "subtotal", "total", "updatedAt") SELECT "clienteId", "crearItemsProduccion", "createdAt", "fechaCreacion", "fechaDeshabilitado", "habilitado", "id", "impuesto", "incluirIva", "margen", "numero", "observaciones", "subtotal", "total", "updatedAt" FROM "pedidos";
DROP TABLE "pedidos";
ALTER TABLE "new_pedidos" RENAME TO "pedidos";
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
