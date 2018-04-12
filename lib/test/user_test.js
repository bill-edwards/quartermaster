var expect = require('chai').expect,
	request = require('supertest'),
	bcrypt = require('bcrypt'),
	path = require('path'),
	helper = require(__dirname + '/test_helper.js'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	app = require(path.join(__dirname, '../app.js'));

describe('the /api/user routes', function(){

	describe('POSTing to /api/user/new', function(){

		it('should create new a DB entry, and return the new id', function(done){

			var newUser = {
				username: 'newUser',
				password: 'newPassword'
			};

			// Make call to api
			request(app)
			.post('/api/user/new')
			.send(newUser)
			.end(function(err,res){
				if (err) return done(err);

				// Test details of response. 
				expect(res.status).to.equal(200);

				// Check database. 
				dbConn.query('SELECT * FROM users WHERE username="newUser"',function(err, record){
					if (err) return done(err);
					expect(record).to.have.length(1);

					// Clear up database. 
					dbConn.query('DELETE FROM users WHERE username="newUser"',function(err){
						if (err) return done(err);
						done();
					});
				});
			});
		});

		it('should not allow duplicate usernames', function(done){

			// Insert an 'existing' record into the database. 
			dbConn.query('INSERT INTO users (username) VALUES ("newUser")', function(err){
				if (err) return done(err); 

				var newUser = {
					username: 'newUser',
					password: 'newPassword'
				};

				// Make call to api
				request(app)
				.post('/api/user/new')
				.send(newUser)
				.end(function(err){

					// Test details of response. 
					expect(err.status).to.equal(400);

					// Clear up database. 
					dbConn.query('DELETE FROM users WHERE username="newUser"',function(err){
						if (err) return done(err);
						done();
					});
				});
			});
		});
	});

	describe('GETting from /api/user/me', function(){

		var testIds={}; 
		var agent = request.agent(app);

		var newUser = {
			user: {username: 'bill', password: 'password'},
			inventories: [
				{name: 'camping'},
				{name: 'climbing'}
			],
			event: {name: 'climbing trip', startDate: 1500000000000, endDate: 1500500000000},
			items: [
				{name: 'harness'},
				{name: 'jacket'},
				{name: 'sleeping bag'}
			]
		}

		// Create new user, with inventories and events. 
		before(function(done){
			helper.insertMainUser(newUser, function(err,data){
				if (err) return done(err);
				newUser = data; 
				done();
			});
		});

		// Delete new user and associated data from DB. 
		after(function(done){
			helper.emptyDB(function(err){
				if (err) return done(err);
				done();
			});
		});
		
		it('when logged-in should return information on the user', function(done){

			// Log-in 
			agent
			.post('/api/login')
			.send({username:newUser.user.username, password:newUser.user.password})
			.end(function(err,res){
				if (err) return done(err); 
				
				// Make call to GET api/user/me
				agent
				.get('/api/user/me')
				.end(function(err,res){
					if (err) return done(err);

					// Test contents of response. 
					expect(res.status).to.equal(200);
					expect(res.body.id).to.equal(newUser.user.id);
					expect(res.body.username).to.equal(newUser.user.username);
					expect(res.body.inventories).to.have.length(2);
					expect(res.body.inventories[0].name).to.equal(newUser.inventories[0].name);
					expect(res.body.events).to.have.length(1);
					expect(res.body.events[0].name).to.equal(newUser.event.name);
					done();
				});
			});

		});

		it('should not return data if user not logged-in', function(done){
			
			// Make call to GET /api/user/me
			request(app)
			.get('/api/user/me')
			.end(function(err){
				// Expect to get 401 not authorised error. 
				expect(err.status).to.equal(401);
				done();
			});
		});
	});
});