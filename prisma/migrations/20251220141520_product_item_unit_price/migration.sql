/*
  Warnings:

  - You are about to drop the column `price` on the `Item` table. All the data in the column will be lost.
  - Added the required column `unit_price` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Item` DROP COLUMN `price`,
    ADD COLUMN `unit_price` DOUBLE NOT NULL;
