/*
  Warnings:

  - You are about to drop the column `balance` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `case` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventoryitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `inventoryitem` DROP FOREIGN KEY `InventoryItem_lootId_fkey`;

-- DropForeignKey
ALTER TABLE `inventoryitem` DROP FOREIGN KEY `InventoryItem_userId_fkey`;

-- DropForeignKey
ALTER TABLE `loot` DROP FOREIGN KEY `Loot_caseId_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `balance`,
    DROP COLUMN `isActive`,
    ADD COLUMN `coachId` INTEGER NULL,
    ADD COLUMN `firstLogin` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `role` ENUM('COACH', 'PARTICIPANT') NOT NULL DEFAULT 'PARTICIPANT';

-- DropTable
DROP TABLE `case`;

-- DropTable
DROP TABLE `inventoryitem`;

-- DropTable
DROP TABLE `loot`;

-- CreateTable
CREATE TABLE `TrainingPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `coachId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrainingPlanAssignment` (
    `trainingPlanId` INTEGER NOT NULL,
    `participantId` INTEGER NOT NULL,

    PRIMARY KEY (`trainingPlanId`, `participantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achievement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `performance` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `participantId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlan` ADD CONSTRAINT `TrainingPlan_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlanAssignment` ADD CONSTRAINT `TrainingPlanAssignment_trainingPlanId_fkey` FOREIGN KEY (`trainingPlanId`) REFERENCES `TrainingPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlanAssignment` ADD CONSTRAINT `TrainingPlanAssignment_participantId_fkey` FOREIGN KEY (`participantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achievement` ADD CONSTRAINT `Achievement_participantId_fkey` FOREIGN KEY (`participantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
