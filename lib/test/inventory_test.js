var expect = require('chai').expect,
	request = require('supertest'),
	path = require('path'),
	helper = require(__dirname + '/test_helper.js'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	app = require(path.join(__dirname, '../app.js'));

describe('the /api/inventory routes', function(){

	var agent = request.agent(app);
	var testIds = {};

	var newUser = {
		user: {username: 'bill', password: 'password'},
		inventories: [
			{name: 'climbing'},
			{name: 'camping'}
		],
		event: {name: 'climbing trip', startDate: 1500000000000, endDate: 1500500000000},
		items: [
			{name: 'harness'},
			{name: 'jacket'},
			{name: 'sleeping bag'}
		]
	};

	var otherUser = {
		user: {username: 'ben', password: 'password'},
		inventories: [
			{name: 'climbing'},
			{name: 'running'}
		],
		event: {name: 'holiday', startDate: 1500000000000, endDate: 1500500000000},
		items: [
			{name: 'harness'},
			{name: 'jacket'},
			{name: 'running shoes'}
		]
	};

	before(function(done){
		// Add test data to DB. 
		helper.insertMainUser(newUser,function(err,data){
			if (err) return done(err);
			newUser = data; 
			helper.insertMainUser(otherUser,function(err,data){
				if (err) return done(err);
				otherUser = data; 
				// Log-in.
				agent
				.post('/api/login')
				.send(newUser.user)
				.end(function(err,res){
					if (err) return done(err);
					done();
				});
			});
		});
	});

	after(function(done){
		// Remove test date from DB.
		helper.emptyDB(function(err){
			if (err) return done(err);
			done();
		});
	});

	describe('POSTing to /api/inventory/new', function(){

		it('should create new a DB entry, and return the new id', function(done){
			// Make call to api
			agent
			.post('/api/inventory/new')
			.send({name:'anotherNewInventory'})
			.end(function(err,res){

				// Test response
				expect(res.status).to.equal(200);

				// Check database. 
				dbConn.query('SELECT * FROM inventories WHERE name="anotherNewInventory"',function(err, record){
					if (err) return done(err);
					expect(record).to.have.length(1);

					// Clear up database. 
					dbConn.query('DELETE FROM inventories WHERE name="anotherNewInventory"',function(err){
						if (err) return done(err);
						done();
					});
				});
			});
		});

		it('should not allow creation of inventory with existing name', function(done){
			// Make call to api
			agent
			.post('/api/inventory/new')
			.send(newUser.inventories[0])
			.end(function(err){
				expect(err.status).to.equal(400);
				done();
			});
		});

	});

	describe('GETting from /api/inventory/id', function(){

		it('should return information on the inventory', function(done){
			agent
			.get('/api/inventory/'+newUser.inventories[0].id)
			.end(function(err,res){
				if (err) return done(err);

				expect(res.status).to.equal(200);
				expect(res.body.name).to.equal(newUser.inventories[0].name);
				expect(res.body.items).to.have.length(2);
				expect(res.body.items[0].name).to.equal(newUser.items[0].name);
				expect(res.body.items[0].status).to.equal(1);

				done();
			});
		});

		it('should not return information on another user\'s inventory', function(done){
			agent
			.get('/api/inventory/'+otherUser.inventories[0].id)
			.end(function(err){
				expect(err.status).to.equal(404);
				done();
			});
		});

		it('should return an error if the id is not numeric', function(done){
			agent
			.get('/api/inventory/apple')
			.end(function(err){
				expect(err.status).to.equal(404);
				done();
			});
		});
	});

	describe('PUTting to /api/inventory/id', function(){

		it('should allow update of inventory name', function(done){
			agent
			.put('/api/inventory/'+newUser.inventories[0].id)
			.send({name:'rock-climbing'})
			.end(function(err,res){
				if (err) return done(err);

				// Check response.
				expect(res.status).to.equal(200);

				// Check database.
				dbConn.query('SELECT * FROM inventories WHERE id="'+newUser.inventories[0].id+'"',function(err,results){
					if (err) return done(err);
					expect(results[0].name).to.equal('rock-climbing');
					done();
				});
			});
		});

		// Add item[2] to inventory[0].
		it('should allow addition of item from one inventory to another', function(done){
			agent
			.put('/api/inventory/'+newUser.inventories[0].id)
			// This item is not currently in this inventory. 
			.send({addedItems:[newUser.items[2].id]})
			.end(function(err,res){
				if (err) return done(err);

				// Check response.
				expect(res.status).to.equal(200);

				// Check database.
				dbConn.query('SELECT * FROM inventories_items WHERE invId="'+newUser.inventories[0].id+'" AND itemId="'+newUser.items[2].id+'"',function(err,results){
					if (err) return done(err);
					expect(results).to.have.length(1);
					done();
				});
			});
		});

		// Try to add item[1] to inventory[0] (it's already there).
		it('should not add duplicate of item already in inventory', function(done){
			agent
			.put('/api/inventory/'+newUser.inventories[0].id)
			// This item is already in this inventory. 
			.send({addedItems:[newUser.items[0].id]})
			.end(function(err,res){
				if (err) return done(err);

				// Check response.
				expect(res.status).to.equal(200);

				// Check database.
				dbConn.query('SELECT * FROM inventories_items WHERE invId="'+newUser.inventories[0].id+'" AND itemId="'+newUser.items[0].id+'"',function(err,results){
					if (err) return done(err);
					// Checking that a duplicate record has not been created. 
					expect(results).to.have.length(1);
					done();
				});
			});
		});

		// Remove item[1] from inventory[0] (it's also in inventory[1])
		it('should allow removal of item from inventory, but not delete item if it\'s still part of another inventory', function(done){
			agent
			.put('/api/inventory/'+newUser.inventories[0].id)
			// This item is currently in both user's inventories.  
			.send({removedItems:[newUser.items[1].id]})
			.end(function(err,res){
				if (err) return done(err);

				// Check response.
				expect(res.status).to.equal(200);

				// Check database.
				dbConn.query('SELECT * FROM inventories_items WHERE invId="'+newUser.inventories[0].id+'" AND itemId="'+newUser.items[1].id+'"',function(err,results){
					if (err) return done(err);
					// Checking that the link record has been deleted. 
					expect(results).to.have.length(0);
					dbConn.query('SELECT * FROM items WHERE id="'+newUser.items[1].id+'"', function(err, results){
						if (err) return done(err);
						// Checking that item record has not been deleted. 
						expect(results).to.have.length(1);
						done();
					});
				});
			});
		});

		// Remove item[0] from inventory[0] (it's not in any other inventory)
		it('should allow removal of item from inventory, and delete that item if it appears in no other inventory', function(done){
			agent
			.put('/api/inventory/'+newUser.inventories[0].id)
			// This item belongs only to this inventory.   
			.send({removedItems:[newUser.items[0].id]})
			.end(function(err,res){
				if (err) return done(err);

				// Check response.
				expect(res.status).to.equal(200);

				// Check database.
				dbConn.query('SELECT * FROM inventories_items WHERE invId="'+newUser.inventories[0].id+'" AND itemId="'+newUser.items[0].id+'"',function(err,results){
					if (err) return done(err);
					// Checking that the link record has been deleted. 
					expect(results).to.have.length(0);
					dbConn.query('SELECT * FROM items WHERE id="'+newUser.items[0].id+'"', function(err, results){
						if (err) return done(err);
						// Checking that item record has not been deleted. 
						expect(results).to.have.length(0);
						done();
					});
				});
			});
		});

		it('should not allow editing of another user\'s inventory', function(done){
			agent
			.put('/api/inventory/'+otherUser.inventories[0].id)
			.send({name:'rock-climbing'})
			.end(function(err){
				expect(err.status).to.equal(404);
				done();
			});
		});

		it('should return an error if the id is not numeric', function(done){
			agent
			.put('/api/inventory/apple')
			.send({name:'rock-climbing'})
			.end(function(err){
				expect(err.status).to.equal(404);
				done();
			});
		});

		it('should not allow name to be changed to the name of an existing inventory', function(done){
			agent
			.put('/api/inventory/'+newUser.inventories[0].id)
			.send({name:newUser.inventories[1].name})
			.end(function(err){
				expect(err.status).to.equal(400);
				done();
			});
		});

	});

	describe('DELETEing from /api/inventory/id', function(){

		it('should remove the inventory, all links to its items, and any items not in other inventories', function(done){
			agent
			.delete('/api/inventory/'+newUser.inventories[1].id)
			.end(function(err){
				
				// Check database
				dbConn.query('SELECT * FROM inventories WHERE id="'+newUser.inventories[1].id+'"', function(err, results){
					if (err) return done(err);
					// Inventory should have been removed. 
					expect(results).to.have.length(0);
					dbConn.query('SELECT * FROM inventories_items WHERE invId="'+newUser.inventories[1].id+'"', function(err, results){
						if (err) return done(err);
						// Any links from this inventory to items should have been removed.
						expect(results).to.have.length(0);
						dbConn.query('SELECT * FROM items WHERE id="'+newUser.items[2].id+'"', function(err, results){
							if (err) return done(err);
							// This item is still in inventory[0] so shouldn't have been removed. 
							expect(results).to.have.length(1);
							dbConn.query('SELECT * FROM items WHERE id="'+newUser.items[1].id+'"', function(err, results){
								if (err) return done(err);
								// This item is in no other inventory, so should have been removed. 
								expect(results).to.have.length(0);
								done();
							});
						});
					});
				});
			});
		});

		it('should not allow removal of another user\'s inventory', function(done){
			agent
			.delete('/api/inventory/'+otherUser.inventories[0].id)
			.end(function(err){
				expect(err.status).to.equal(404);
				done();
			});
		});

		it('should return an error if the id is not numeric', function(done){
			agent
			.delete('/api/inventory/apple')
			.end(function(err){
				expect(err.status).to.equal(404);
				done();
			});
		});

	});
	
});