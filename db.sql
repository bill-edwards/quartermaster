create database qmNew;

	use qmNew;

	create table inventories(
		id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		name varchar(128) NOT NULL
		)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

	create table items(
		id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		name varchar(128) NOT NULL, 
		status int(2) NOT NULL, 
		issue varchar(128)
		)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;

	create table inventories_items(
		id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		invId int(11) NOT NULL,
		itemId int(11) NOT NULL
		)ENGINE = INNODB CHARACTER SET utf8 COLLATE utf8_bin;
