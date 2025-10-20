-- CreateTable
CREATE TABLE `Danisan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
