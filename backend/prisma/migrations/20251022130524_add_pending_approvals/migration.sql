/*
  Warnings:

  - You are about to drop the `danisan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `danisan`;

-- CreateTable
CREATE TABLE `Danisan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `height` DOUBLE NULL,
    `targetCalories` INTEGER NOT NULL,
    `protein` INTEGER NOT NULL,
    `carbs` INTEGER NOT NULL,
    `fat` INTEGER NOT NULL,
    `allergens` JSON NULL,
    `currentWeight` DOUBLE NOT NULL,
    `targetWeight` DOUBLE NOT NULL,
    `startWeight` DOUBLE NOT NULL,
    `weeklyProgress` JSON NULL,
    `adherence` INTEGER NOT NULL,
    `mealsLogged` INTEGER NOT NULL,
    `totalMeals` INTEGER NOT NULL,
    `aiUsageCount` INTEGER NOT NULL DEFAULT 0,
    `weeklyMenu` JSON NULL,
    `pendingApprovals` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WeightEntry` ADD CONSTRAINT `WeightEntry_danisanId_fkey` FOREIGN KEY (`danisanId`) REFERENCES `Danisan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
