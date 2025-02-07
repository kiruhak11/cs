-- AlterTable
ALTER TABLE `trainingplan` ALTER COLUMN `plannedFor` DROP DEFAULT;

-- CreateTable
CREATE TABLE `TrainingPlanExercise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trainingPlanId` INTEGER NOT NULL,
    `load` VARCHAR(191) NOT NULL,
    `exercise` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrainingPlanExercise` ADD CONSTRAINT `TrainingPlanExercise_trainingPlanId_fkey` FOREIGN KEY (`trainingPlanId`) REFERENCES `TrainingPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
