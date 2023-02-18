-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 08, 2022 at 12:37 PM
-- Server version: 10.1.22-MariaDB
-- PHP Version: 7.1.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(20) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) NOT NULL,
  `department` int(10) NOT NULL,
  `work_phone` varchar(8) NOT NULL,
  `home_phone` varchar(8) NOT NULL,
  `mobile_phone` varchar(8) NOT NULL,
  `address` varchar(100) NOT NULL,
  `city` varchar(20) NOT NULL,
  `zoba` varchar(20) NOT NULL,
  `notes` varchar(1000) NOT NULL,
  `picture` varchar(100) NOT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(100) NOT NULL,
  `item` text NOT NULL,
  `category_id` int(20) NOT NULL,
  `description` longtext NOT NULL,
  `supplier` varchar(100) NOT NULL,
  `manufacturer` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `serial_no` varchar(100) NOT NULL,
  `reorder_level` int(20) NOT NULL,
  `target_stock_level` int(20) NOT NULL,
  `unit_measure` int(5) NOT NULL,
  `expiry_date` date NOT NULL,
  `picture` varchar(100) NOT NULL,
  `discontinued` char(1) NOT NULL DEFAULT 'N',
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `unique_id` varchar(100) DEFAULT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `id` int(20) NOT NULL,
  `location_name` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'create_user', 'Can create user accounts'),
(2, 'delete_user', 'Can delete user accounts'),
(3, 'add_item', 'Can add items to the inventory'),
(4, 'add_transaction', 'Can create transactions'),
(7, 'view_items', 'Can view inventory items'),
(8, 'view_transactions', 'Can view transactions list'),
(9, 'update_transactions', 'Can update transactions list'),
(10, 'view_fixed', 'Can view fixed assets list'),
(11, 'view_damaged', 'Can view damaged items list'),
(12, 'view_employees', 'Can view employees list'),
(13, 'add_employee', 'Can add employees'),
(14, 'update_employee', 'Can update employee information'),
(15, 'create_reports', 'Can create reports'),
(16, 'edit_item', 'Can edit item information'),
(17, 'edit_asset', 'Can edit asset information'),
(18, 'delete_item', 'Can delete an item'),
(19, 'delete_asset', 'Can delete an asset'),
(20, 'audit_items', 'Can perform an audit'),
(21, 'edit_user', 'Can edit user info');

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `permission_role`
--

INSERT INTO `permission_role` (`id`, `role_id`, `permission_id`) VALUES
(5, 6, 3),
(6, 6, 4),
(7, 6, 7),
(8, 6, 8),
(9, 6, 10),
(10, 6, 11),
(11, 6, 12),
(12, 6, 15),
(13, 3, 15),
(16, 10, 7),
(17, 10, 8),
(18, 10, 10),
(19, 10, 11),
(20, 10, 12),
(21, 11, 7),
(135, 2, 3),
(136, 2, 10),
(137, 2, 7),
(138, 2, 17),
(139, 2, 19),
(140, 2, 16),
(141, 2, 18),
(160, 20, 1),
(161, 20, 10),
(162, 20, 13),
(464, 1, 1),
(465, 1, 2),
(466, 1, 3),
(467, 1, 4),
(468, 1, 7),
(469, 1, 8),
(470, 1, 9),
(471, 1, 10),
(472, 1, 11),
(473, 1, 12),
(474, 1, 13),
(475, 1, 14),
(476, 1, 15),
(477, 1, 16),
(478, 1, 17),
(479, 1, 18),
(480, 1, 19),
(481, 1, 20),
(482, 1, 21);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_by`) VALUES
(1, 'Administrator', 'Administrator', '5f15ea36d8c104.01097493'),
(2, 'Store', 'Can create and manage transactions as well as add items.', ''),
(3, 'Finance', 'Can create reports.', ''),
(6, 'Standard User', 'Can perform basic functions', ''),
(10, 'Viewer', '', ''),
(11, 'Teacher', '', ''),
(20, 'Test', '', '620f5bc08f8d33.53831305');

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `id` int(11) NOT NULL,
  `item_id` int(20) NOT NULL,
  `location_id` int(20) NOT NULL,
  `quantity` float NOT NULL,
  `unit_price` float NOT NULL,
  `type` varchar(15) NOT NULL,
  `assigned_to` int(10) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tmp_inventory_items`
--

CREATE TABLE `tmp_inventory_items` (
  `id` int(100) NOT NULL,
  `item` text NOT NULL,
  `category` text NOT NULL,
  `location` text NOT NULL,
  `description` longtext NOT NULL,
  `reorder_level` int(20) NOT NULL,
  `target_stock_level` int(20) NOT NULL,
  `unit_price` text NOT NULL,
  `unit_measure` text NOT NULL,
  `quantity` int(11) NOT NULL,
  `expiry_date` date NOT NULL,
  `unique_id` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `assigned_to` varchar(100) NOT NULL,
  `type` varchar(15) NOT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_in`
--

CREATE TABLE `transaction_in` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `location_id` int(20) NOT NULL,
  `quantity` float NOT NULL,
  `unit_price` float NOT NULL,
  `grn_no` int(11) NOT NULL,
  `purchase_order` int(20) NOT NULL,
  `purchase_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_by` int(10) NOT NULL,
  `received_by` int(10) NOT NULL,
  `authorised_by` int(10) NOT NULL,
  `remark` text NOT NULL,
  `created_by` varchar(1000) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_out`
--

CREATE TABLE `transaction_out` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `location_id` int(20) NOT NULL,
  `quantity` float NOT NULL,
  `siv_no` int(11) NOT NULL,
  `requisition` int(11) NOT NULL,
  `dept_id` int(20) NOT NULL,
  `employee_id` int(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `remark` text NOT NULL,
  `created_by` varchar(1000) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `unit`
--

CREATE TABLE `unit` (
  `id` int(10) NOT NULL,
  `unit_name` varchar(100) NOT NULL,
  `unit_type` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `unit`
--

INSERT INTO `unit` (`id`, `unit_name`, `unit_type`, `description`, `created_by`) VALUES
(1, 'meter', 'bulk', '', ''),
(2, 'pieces', 'pcs', '', ''),
(3, 'litre', 'bulk', '', ''),
(4, 'set', 'pcs', '', ''),
(5, 'Pack', 'pcs', '12 pieces', '5f15ea36d8c104.01097493'),
(6, 'Kilogram', 'bulk', '', '5f15ea36d8c104.01097493'),
(7, 'Roll', 'pcs', '', '5f15ea36d8c104.01097493'),
(8, 'Set', 'pcs', '10 Pieces', '5f15ea36d8c104.01097493'),
(9, 'Pack', 'pcs', '7 pieces', '5f15ea36d8c104.01097493'),
(10, 'Reem', 'pcs', '500 Leaves', '5f15ea36d8c104.01097493');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) NOT NULL,
  `uname` varchar(50) NOT NULL,
  `user_name` text NOT NULL,
  `role_id` int(11) NOT NULL,
  `password` varchar(1000) NOT NULL,
  `salt` varchar(1000) NOT NULL,
  `dept_id` int(10) NOT NULL,
  `uuid` varchar(512) NOT NULL,
  `deactivated` char(1) NOT NULL DEFAULT 'N',
  `created_by` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uname`, `user_name`, `role_id`, `password`, `salt`, `dept_id`, `uuid`, `deactivated`, `created_by`) VALUES
(1, 'admin', 'Administrator', 1, 'tiFd/d2OR0Y8yINuSz8BO84ZxwUzNzEzZGJjYjhj', '3713dbcb8c', 1, '630912a0eefd30.88866023', 'N', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`,`category_name`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`first_name`,`last_name`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `item` (`item`(100));

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `location_name` (`location_name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `tmp_inventory_items`
--
ALTER TABLE `tmp_inventory_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transaction_in`
--
ALTER TABLE `transaction_in`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transaction_out`
--
ALTER TABLE `transaction_out`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `unit`
--
ALTER TABLE `unit`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;
--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=560;
--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;
--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
--
-- AUTO_INCREMENT for table `permission_role`
--
ALTER TABLE `permission_role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=483;
--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=325;
--
-- AUTO_INCREMENT for table `tmp_inventory_items`
--
ALTER TABLE `tmp_inventory_items`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;
--
-- AUTO_INCREMENT for table `transaction_in`
--
ALTER TABLE `transaction_in`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
--
-- AUTO_INCREMENT for table `transaction_out`
--
ALTER TABLE `transaction_out`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
--
-- AUTO_INCREMENT for table `unit`
--
ALTER TABLE `unit`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD CONSTRAINT `permission_role_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `permission_role_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`);

--
-- Constraints for table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `stock_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
