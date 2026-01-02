/*
 Navicat Premium Dump SQL

 Source Server         : mysql8.0
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3308
 Source Schema         : 012

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 11/11/2025 01:35:31
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE `012` ;
USE `012`;
-- ----------------------------
-- Table structure for book
-- ----------------------------
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `isbn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书编号',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '名称',
  `price` decimal(10, 2) NULL DEFAULT NULL COMMENT '价格',
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '作者',
  `publisher` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '出版社',
  `create_time` date NULL DEFAULT NULL COMMENT '出版时间',
  `status` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '0：未归还 1：已归还',
  `borrownum` int NOT NULL COMMENT '此书被借阅次数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of book
-- ----------------------------
INSERT INTO `book` VALUES (9, '10001', 'Java从入门到精通', 35.00, '万建平', '清华大学出版社', '2026-03-03', '0', 10);
INSERT INTO `book` VALUES (10, '10002', '深入理解Java虚拟机', 64.50, '周志明', '新华网', '2026-03-03', '0', 5);
INSERT INTO `book` VALUES (11, '10003', 'Java编程思想第4版', 54.00, '林雪东', '北京大学', '2026-03-03', '0', 9);
INSERT INTO `book` VALUES (12, '10004', 'Effective Java中文版', 79.80, '林雪东', '北京邮电', '2026-03-03', '0', 9);
INSERT INTO `book` VALUES (13, '10005', 'On Java 基础卷中文版', 64.90, '布鲁斯·埃克尔', '人民邮电', '2026-03-03', '0', 10);
INSERT INTO `book` VALUES (15, '10006', 'Java面试宝典', 51.00, '布鲁克', '人民大学', '2026-03-03', '1', 1);
INSERT INTO `book` VALUES (16, '10007', 'Python从入门到精通', 100.00, '威廉詹姆斯', '普林斯顿大学', '2026-03-03', '1', 0);

-- ----------------------------
-- Table structure for bookwithuser
-- ----------------------------
DROP TABLE IF EXISTS `bookwithuser`;
CREATE TABLE `bookwithuser`  (
  `id` bigint NOT NULL COMMENT '读者id',
  `isbn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图书编号',
  `book_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书名',
  `nick_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '读者姓名',
  `lendtime` datetime NULL DEFAULT NULL COMMENT '借阅时间',
  `deadtime` datetime NULL DEFAULT NULL COMMENT '应归还时间',
  `prolong` int NULL DEFAULT NULL COMMENT '续借次数',
  PRIMARY KEY (`book_name`) USING BTREE,
  INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of bookwithuser
-- ----------------------------
INSERT INTO `bookwithuser` VALUES (2, '10004', 'Effective Java中文版', 'user', '2024-06-16 23:25:35', '2024-07-16 23:25:35', 1);
INSERT INTO `bookwithuser` VALUES (2, '10001', 'Java从入门到精通', 'user', '2024-06-17 15:20:47', '2024-07-17 15:20:47', 1);
INSERT INTO `bookwithuser` VALUES (2, '10003', 'Java编程思想第4版', 'user', '2024-06-16 23:25:14', '2024-07-16 23:25:14', 1);
INSERT INTO `bookwithuser` VALUES (3, '10005', 'On Java 基础卷中文版', 'user2', '2024-06-17 15:13:29', '2024-09-15 15:13:29', 0);
INSERT INTO `bookwithuser` VALUES (2, '10002', '深入理解Java虚拟机', 'user', '2024-06-16 23:23:53', '2024-06-16 23:23:53', 0);

-- ----------------------------
-- Table structure for lend_record
-- ----------------------------
DROP TABLE IF EXISTS `lend_record`;
CREATE TABLE `lend_record`  (
  `reader_id` bigint NOT NULL COMMENT '读者id',
  `isbn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书编号',
  `bookname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '图书名',
  `lend_time` datetime NULL DEFAULT NULL COMMENT '借书日期',
  `return_time` datetime NULL DEFAULT NULL COMMENT '还书日期',
  `status` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '0：未归还 1：已归还',
  `borrownum` int NOT NULL COMMENT '此书被借阅次数'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of lend_record
-- ----------------------------
INSERT INTO `lend_record` VALUES (2, '10001', 'Java从入门到精通', '2023-04-19 23:10:22', '2024-06-16 23:11:28', '1', 8);
INSERT INTO `lend_record` VALUES (2, '10002', '深入理解Java虚拟机', '2023-04-19 23:12:23', '2024-06-16 23:11:29', '1', 4);
INSERT INTO `lend_record` VALUES (2, '10003', 'Java编程思想第4版', '2023-04-26 03:34:37', '2024-06-20 23:11:51', '1', 6);
INSERT INTO `lend_record` VALUES (2, '10003', 'Java编程思想第4版', '2024-04-26 03:34:37', '2024-06-20 23:11:51', '1', 7);
INSERT INTO `lend_record` VALUES (2, '10003', 'Java编程思想第4版', '2024-04-26 03:34:37', '2024-06-20 23:11:51', '1', 8);
INSERT INTO `lend_record` VALUES (2, '10001', 'Java从入门到精通', '2024-06-16 23:23:14', '2024-06-17 15:20:22', '1', 9);
INSERT INTO `lend_record` VALUES (2, '10002', '深入理解Java虚拟机', '2024-06-16 23:23:53', NULL, '0', 5);
INSERT INTO `lend_record` VALUES (2, '10004', 'Effective Java中文版', '2024-06-16 23:25:35', NULL, '0', 9);
INSERT INTO `lend_record` VALUES (3, '10005', 'On Java 基础卷中文版', '2024-06-17 15:13:29', NULL, '0', 10);
INSERT INTO `lend_record` VALUES (2, '10001', 'Java从入门到精通', '2024-06-17 15:20:47', NULL, '0', 10);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '密码',
  `nick_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '姓名',
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '电话号码',
  `sex` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '性别',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址',
  `role` int NOT NULL COMMENT '角色、1：管理员 2：普通用户',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', '123456', '吴彦祖', '18321299982', '男', '浙江大学', 1);
INSERT INTO `user` VALUES (2, 'user', '123456', '给月亮点灯', '13888888888', '男', '浙江大学', 2);
INSERT INTO `user` VALUES (3, 'user2', '123456', '彭于晏', '13888888888', '男', '浙江大学', 2);
INSERT INTO `user` VALUES (4, 'user3', '123456', '周杰伦', '13888888888', '男', '浙江大学', 2);
INSERT INTO `user` VALUES (5, 'user4', '123456', '成龙', '13888888888', '男', '浙江大学', 2);
INSERT INTO `user` VALUES (18, 'user5', '123456', '周星驰', '13888888888', '男', '北京大学', 2);
INSERT INTO `user` VALUES (20, 'admin2', '123456', '吴彦祖2', '13888888888', '男', '北京大学', 1);

SET FOREIGN_KEY_CHECKS = 1;
