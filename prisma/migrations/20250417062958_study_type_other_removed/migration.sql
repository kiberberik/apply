/*
  Warnings:

  - The values [OTHER] on the enum `Details_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Details` MODIFY `type` ENUM('PAID', 'GRANT', 'NONE_DEGREE', 'CONDITIONAL') NULL;
