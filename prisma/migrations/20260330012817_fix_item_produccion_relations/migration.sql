/*
  Warnings:

  - You are about to drop the column `pedidoId` on the `items_produccion` table. All the data in the column will be lost.
  - You are about to drop the column `pedidoNumero` on the `items_produccion` table. All the data in the column will be lost.
  - Made the column `detalleId` on table `items_produccion` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_items_produccion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "detalleId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fechaInicio" DATETIME,
    "observaciones" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    CONSTRAINT "items_produccion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "items_produccion_detalleId_fkey" FOREIGN KEY ("detalleId") REFERENCES "detalle_pedidos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_items_produccion" ("cantidad", "createdAt", "detalleId", "fechaInicio", "habilitado", "id", "observaciones", "productoId", "updatedAt") SELECT "cantidad", "createdAt", "detalleId", "fechaInicio", "habilitado", "id", "observaciones", "productoId", "updatedAt" FROM "items_produccion";
DROP TABLE "items_produccion";
ALTER TABLE "new_items_produccion" RENAME TO "items_produccion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
