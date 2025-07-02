-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 02 Jul 2025 pada 13.28
-- Versi server: 8.0.30
-- Versi PHP: 8.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lsp_onlineshop`
--

DELIMITER $$
--
-- Prosedur
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `reduce_stock_fifo` (IN `p_product_id` INT, IN `p_qty` INT, IN `p_id` INT)   BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE cur_id INT;
  DECLARE cur_qty INT;
  DECLARE qty_to_reduce INT DEFAULT p_qty;
  DECLARE qty_used INT;

  DECLARE cur CURSOR FOR
    SELECT id, quantity FROM stocks
    WHERE product_id = p_product_id AND quantity > 0
    ORDER BY id ASC;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO cur_id, cur_qty;
    IF done OR qty_to_reduce <= 0 THEN
      LEAVE read_loop;
    END IF;

    IF cur_qty >= qty_to_reduce THEN
      -- Kurangi stok dan catat ke history
      UPDATE stocks SET quantity = quantity - qty_to_reduce WHERE id = cur_id;

      INSERT INTO stocks_history (stock_id, product_id, quantity_used, transaction_detail_id)
      VALUES (cur_id, p_product_id, qty_to_reduce, p_id);

      SET qty_to_reduce = 0;
    ELSE
      -- Habisin stok dan catat ke history
      UPDATE stocks SET quantity = 0 WHERE id = cur_id;

      INSERT INTO stocks_history (stock_id, product_id, quantity_used, transaction_detail_id)
      VALUES (cur_id, p_product_id, cur_qty, p_id);

      SET qty_to_reduce = qty_to_reduce - cur_qty;
    END IF;
  END LOOP;

  CLOSE cur;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `carts`
--

CREATE TABLE `carts` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`) VALUES
(1, 'Alat Kesehatan', '2025-06-17 10:50:35'),
(2, 'Obat-obatan', '2025-06-17 10:50:35'),
(3, 'Vitamin & Suplemen', '2025-06-17 10:50:35'),
(5, 'Suntik L6710', '2025-07-01 03:43:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `type` enum('success','warning','error') DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 3, 'Selamat Datang', 'Terima kasih telah mendaftar di LSP OnlineShop!', 'success', 0, '2025-06-17 10:50:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `image`, `price`, `category_id`, `created_by`, `created_at`) VALUES
(1, 'Masker N95 3M', 'Masker pelindung kesehatan untuk tenaga medis dan umum', '1751395537954-0084550e-1371-4f4b-b3e9-daa81df818c3.webp', 70000.00, 1, 1, '2025-06-17 10:50:35'),
(2, 'Paracetamol Tablet', 'Obat penurun demam dan penghilang nyeri', 'https://rsum.bandaacehkota.go.id/wp-content/uploads/2025/02/paracetamol.webp', 15000.00, 2, 1, '2025-06-17 10:50:35'),
(3, 'Vitamin C 1000mg', 'Vitamin untuk daya tahan tubuh', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxMgXKVXuR3ilkM-4tqUyuxaUCss0mHi4vRw&s', 30000.00, 3, 1, '2025-06-17 10:50:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data untuk tabel `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 3, 5, 'Masker nyaman dan kualitas bagus!', '2025-06-17 10:50:35'),
(2, 2, 3, 4, 'Ampuh, demam cepat turun.', '2025-06-17 10:50:35'),
(5, 3, 3, 4, 'Cukup bagus', '2025-06-24 03:05:02'),
(17, 1, 3, 5, 'ghbh', '2025-06-25 04:47:43'),
(18, 2, 72, 5, 'tes', '2025-07-01 16:39:24'),
(19, 3, 72, 5, 'sasa', '2025-07-01 17:36:52');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stocks`
--

CREATE TABLE `stocks` (
  `id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `supplier` varchar(255) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `stocks`
--

INSERT INTO `stocks` (`id`, `product_id`, `quantity`, `supplier`, `updated_at`) VALUES
(1, 1, 42, 'PT. ind1', '2025-07-01 17:52:23'),
(2, 2, 91, 'PT. ind2', '2025-07-01 17:52:23'),
(3, 3, 74, 'PT. ind3', '2025-07-01 17:52:23'),
(7, 1, 30, 'PT. China', '2025-06-30 07:28:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stocks_history`
--

CREATE TABLE `stocks_history` (
  `id` int NOT NULL,
  `stock_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity_used` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_detail_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `stocks_history`
--

INSERT INTO `stocks_history` (`id`, `stock_id`, `product_id`, `quantity_used`, `created_at`, `transaction_detail_id`) VALUES
(29, 1, 1, 1, '2025-07-01 17:52:23', 46),
(30, 3, 3, 1, '2025-07-01 17:52:23', 47),
(31, 2, 2, 1, '2025-07-01 17:52:23', 48);

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_details`
--

CREATE TABLE `transaction_details` (
  `id` int NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `transaction_details`
--

INSERT INTO `transaction_details` (`id`, `transaction_id`, `product_id`, `quantity`) VALUES
(46, 23, 1, 1),
(47, 23, 3, 1),
(48, 23, 2, 1);

--
-- Trigger `transaction_details`
--
DELIMITER $$
CREATE TRIGGER `after_insert_transaction_details` AFTER INSERT ON `transaction_details` FOR EACH ROW BEGIN
  CALL reduce_stock_fifo(NEW.product_id,NEW.quantity,NEW.id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_history`
--

CREATE TABLE `transaction_history` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `status` enum('pending','paid','failed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `order_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `transaction_history`
--

INSERT INTO `transaction_history` (`id`, `user_id`, `total_amount`, `status`, `payment_method`, `order_id`, `created_at`) VALUES
(23, 72, 105000.00, 'paid', 'gopay', 'ORDER-1751392343512', '2025-07-01 17:52:23');

--
-- Trigger `transaction_history`
--
DELIMITER $$
CREATE TRIGGER `restore_stock_on_failed` AFTER UPDATE ON `transaction_history` FOR EACH ROW BEGIN
  -- Deklarasi variabel dan cursor
  DECLARE done INT DEFAULT 0;
  DECLARE d_id INT;
  DECLARE s_id INT;
  DECLARE p_id INT;
  DECLARE qty INT;

  DECLARE cur CURSOR FOR
    SELECT sh.id, sh.stock_id, sh.product_id, sh.quantity_used
    FROM stocks_history sh
    JOIN transaction_details td ON td.id = sh.transaction_detail_id
    WHERE td.transaction_id = NEW.id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  -- Jalankan hanya jika status berubah menjadi failed
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    OPEN cur;

    restore_loop: LOOP
      FETCH cur INTO d_id, s_id, p_id, qty;
      IF done THEN
        LEAVE restore_loop;
      END IF;

      -- Tambahkan kembali quantity ke stok
      UPDATE stocks SET quantity = quantity + qty WHERE id = s_id;

      -- Hapus data dari history
      DELETE FROM stocks_history WHERE id = d_id;
    END LOOP;

    CLOSE cur;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('L','P') DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `role` enum('admin','subAdmin','customer') DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `password`, `birth_date`, `gender`, `address`, `city`, `phone`, `bank_name`, `bank_account`, `role`, `created_at`) VALUES
(1, 'Admin Utama', 'admin', 'admin@example.com', '$2b$10$GWHvOaAGG.OUKD8MSHQh1u7KSuFTaLSYf96aJNIt9rlMDYCv4bwpS', NULL, 'L', NULL, NULL, NULL, NULL, NULL, 'admin', '2025-06-17 10:50:34'),
(2, 'Sub Admin 1', 'subadmin1', 'subadmin1@example.com', '$2b$10$GWHvOaAGG.OUKD8MSHQh1u7KSuFTaLSYf96aJNIt9rlMDYCv4bwpS', NULL, 'L', NULL, NULL, NULL, NULL, NULL, 'subAdmin', '2025-06-17 10:50:34'),
(3, 'Customer Biasa', 'cust1', 'cust1@example.com', '$2b$10$GWHvOaAGG.OUKD8MSHQh1u7KSuFTaLSYf96aJNIt9rlMDYCv4bwpS', NULL, 'L', NULL, NULL, NULL, NULL, NULL, 'customer', '2025-06-17 10:50:34'),
(72, 'sasa', 'sasa', 'sasa@gmail.com', '$2b$10$8Yz8CPMo9199KcdzjAQVIOMXP9KFbPObEvrc1IeRhrzugeEXw13aa', '2025-06-16', 'L', 'sasa', 'sasa', 'sasa', 'sasa', 'sasa', 'customer', '2025-06-23 12:31:07'),
(81, 'sasa', 'sasas', 'sasas@gmail.com', '$2b$10$TtmQS0HfxWlz3gOzndbsPejoEiJIDqNFtGMJSvL21Q/Q2mqy5lEfW', '2025-07-03', 'P', 'sasa', 'sasa', 'sasa', 'sasa', 'sasa', 'customer', '2025-07-01 16:15:57');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `stocks_history`
--
ALTER TABLE `stocks_history`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `transaction_history`
--
ALTER TABLE `transaction_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `stocks_history`
--
ALTER TABLE `stocks_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT untuk tabel `transaction_history`
--
ALTER TABLE `transaction_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ketidakleluasaan untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD CONSTRAINT `transaction_details_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transaction_history` (`id`),
  ADD CONSTRAINT `transaction_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ketidakleluasaan untuk tabel `transaction_history`
--
ALTER TABLE `transaction_history`
  ADD CONSTRAINT `transaction_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
