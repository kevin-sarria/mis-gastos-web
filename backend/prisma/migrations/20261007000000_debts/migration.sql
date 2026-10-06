CREATE TABLE `debt` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `lenderType` ENUM('BANK', 'CREDIT_CARD', 'STORE', 'INFORMAL', 'FAMILY', 'OTHER') NOT NULL DEFAULT 'BANK',
    `lenderName` VARCHAR(191) NULL,
    `principalMinorUnits` INTEGER NULL,
    `balanceMinorUnits` INTEGER NOT NULL,
    `monthlyRateMicro` INTEGER NOT NULL,
    `installmentMinorUnits` INTEGER NOT NULL,
    `remainingMonths` INTEGER NULL,
    `paymentDay` INTEGER NULL,
    `startDate` DATE NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('ACTIVE', 'PAID', 'DEFAULTED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `debt_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `debtPayment` (
    `id` VARCHAR(191) NOT NULL,
    `debtId` VARCHAR(191) NOT NULL,
    `amountMinorUnits` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debtPayment_debtId_date_idx`(`debtId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `debt` ADD CONSTRAINT `debt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `debtPayment` ADD CONSTRAINT `debtPayment_debtId_fkey` FOREIGN KEY (`debtId`) REFERENCES `debt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
