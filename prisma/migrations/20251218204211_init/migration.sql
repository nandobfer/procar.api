/*
  Warnings:

  - You are about to drop the column `cnpj` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `company_name` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `state_registration` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_date` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `drawings` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `observations` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf_cnpj]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `additional_charges` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validity` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Customer_cnpj_key` ON `Customer`;

-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `cnpj`,
    DROP COLUMN `company_name`,
    DROP COLUMN `state_registration`,
    DROP COLUMN `street`,
    ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `cpf_cnpj` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `rg_ie` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `delivery_date`,
    DROP COLUMN `drawings`,
    DROP COLUMN `images`,
    DROP COLUMN `observations`,
    DROP COLUMN `type`,
    ADD COLUMN `additional_charges` DOUBLE NOT NULL,
    ADD COLUMN `attachments` JSON NULL,
    ADD COLUMN `discount` DOUBLE NOT NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `validity` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Customer_email_key` ON `Customer`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Customer_cpf_cnpj_key` ON `Customer`(`cpf_cnpj`);
