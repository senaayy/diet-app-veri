-- CreateTable
CREATE TABLE `WeightEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `danisanId` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `week` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WeightEntry_danisanId_week_key`(`danisanId`, `week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WeightEntry` ADD CONSTRAINT `WeightEntry_danisanId_fkey` FOREIGN KEY (`danisanId`) REFERENCES `Danisan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
