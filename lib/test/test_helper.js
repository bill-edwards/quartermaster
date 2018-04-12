var bcrypt = require('bcrypt'),
	path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js'));

var helper = {};

// data is an object with the properties:
// user {name}
// inventories - 2 element array of {name}
// event {name, startDate, endDate}
// items - 3 element array of {name}
helper.insertMainUser = function(data,callback){
	bcrypt.hash(data.user.password, 10, function(err,hash){
		if (err) return callback(err);
		dbConn.query('INSERT INTO users (username,password) VALUES ("'+data.user.username+'","'+hash+'")', function(err, user){
			if (err) return callback(err);
			data.user.id = user.insertId;
			dbConn.query('INSERT INTO inventories (name) VALUES ("'+data.inventories[0].name+'"),("'+data.inventories[1].name+'"),("event")', function(err, inventory){
				if (err) return callback(err);
				data.inventories[0].id = inventory.insertId; 
				data.inventories[1].id = inventory.insertId+1;
				data.event.invId = inventory.insertId+2; 
				dbConn.query('INSERT INTO users_inventories (userId, invId) VALUES ("'+data.user.id+'","'+data.inventories[0].id+'"),("'+data.user.id+'","'+data.inventories[1].id+'")', function(err){
					if (err) return callback(err);
					dbConn.query('INSERT INTO events (name, startDate, endDate, invId) VALUES ("'+data.event.name+'","'+data.event.startDate+'","'+data.event.endDate+'","'+data.event.invId+'")', function(err, event){
						if (err) return callback(err);
						data.event.id = event.insertId;
						dbConn.query('INSERT INTO users_events (userId, eventId) VALUES ("'+data.user.id+'","'+data.event.id+'")', function(err){
							if (err) return callback(err);
							dbConn.query('INSERT INTO items (name, status) VALUES ("'+data.items[0].name+'","1"),("'+data.items[1].name+'","2"),("'+data.items[2].name+'","3")', function(err,item){
								if (err) return callback(err);
								data.items[0].id = item.insertId;
								data.items[1].id = data.items[0].id+1;
								data.items[2].id = data.items[0].id+2;
								dbConn.query('INSERT INTO inventories_items (invId, itemId) VALUES ("'+data.inventories[0].id+'","'+data.items[0].id+'"),("'+data.inventories[0].id+'","'+data.items[1].id+'"),("'+data.inventories[1].id+'","'+data.items[1].id+'"),("'+data.inventories[1].id+'","'+data.items[2].id+'")', function(err){
									if (err) return callback(err);
									callback(null,data);
								});
							});
						});
					});
				});
			});
		});
	});
};

helper.emptyDB = function(callback){
	dbConn.query('DELETE FROM users', function(err){
		if (err) return callback(err);
		dbConn.query('DELETE FROM inventories', function(err){
			if (err) return callback(err);
			dbConn.query('DELETE FROM users_inventories', function(err){
				if (err) return callback(err);
				dbConn.query('DELETE FROM events', function(err){
					if (err) return callback(err);
					dbConn.query('DELETE FROM users_events', function(err){
						if (err) return callback(err);
						dbConn.query('DELETE FROM items', function(err){
							if (err) return callback(err);
							dbConn.query('DELETE FROM inventories_items', function(err){
								if (err) return callback(err);
								callback(null);
							});
						});
					});
				});
			});
		});
	});
};

module.exports = helper; 
