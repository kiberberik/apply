-- Добавляем колонку с default 'USER'
ALTER TABLE `User` ADD COLUMN `role` ENUM('ADMIN', 'LAWYER', 'MANAGER', 'CONSULTANT', 'USER') NOT NULL DEFAULT 'USER';

-- Обновляем NULL-значения (если уже есть данные)
UPDATE `User` SET `role` = 'USER' WHERE `role` IS NULL;
