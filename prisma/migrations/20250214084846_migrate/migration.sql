-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('COACH', 'PARTICIPANT') NOT NULL DEFAULT 'PARTICIPANT',
    `firstLogin` BOOLEAN NOT NULL DEFAULT true,
    `coachId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParticipantGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `coachId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrainingPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `coachId` INTEGER NOT NULL,
    `groupId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `plannedFor` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrainingPlanExercise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trainingPlanId` INTEGER NOT NULL,
    `load` VARCHAR(191) NOT NULL,
    `exercise` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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

-- CreateTable
CREATE TABLE `_GroupParticipants` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GroupParticipants_AB_unique`(`A`, `B`),
    INDEX `_GroupParticipants_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParticipantGroup` ADD CONSTRAINT `ParticipantGroup_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlan` ADD CONSTRAINT `TrainingPlan_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlan` ADD CONSTRAINT `TrainingPlan_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `ParticipantGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlanExercise` ADD CONSTRAINT `TrainingPlanExercise_trainingPlanId_fkey` FOREIGN KEY (`trainingPlanId`) REFERENCES `TrainingPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlanAssignment` ADD CONSTRAINT `TrainingPlanAssignment_trainingPlanId_fkey` FOREIGN KEY (`trainingPlanId`) REFERENCES `TrainingPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingPlanAssignment` ADD CONSTRAINT `TrainingPlanAssignment_participantId_fkey` FOREIGN KEY (`participantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achievement` ADD CONSTRAINT `Achievement_participantId_fkey` FOREIGN KEY (`participantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupParticipants` ADD CONSTRAINT `_GroupParticipants_A_fkey` FOREIGN KEY (`A`) REFERENCES `ParticipantGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupParticipants` ADD CONSTRAINT `_GroupParticipants_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
