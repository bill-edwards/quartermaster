create database qmNew;

use qmNew;

create table users(
id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
username varchar(128) NOT NULL,
password varchar(128) NOT NULL, 
loginAttempts int, 
timeout bigint
)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

create table inventories(
id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
name varchar(128) NOT NULL
)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

create table events(
id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
name varchar(128) NOT NULL,
startDate bigint NOT NULL,
endDate bigint NOT NULL,
invId int
)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

create table items(
id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
name varchar(128) NOT NULL, 
status int(2) NOT NULL, 
issue varchar(128)
)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

create table users_inventories(
id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
userId int(11) NOT NULL,
invId int(11) NOT NULL
)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

create table users_events(
id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
userId int(11) NOT NULL,
eventId int(11) NOT NULL
)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

create table inventories_items(
id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
invId int(11) NOT NULL,
itemId int(11) NOT NULL
)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;
