var expect = require('chai').expect,
	request = require('supertest'),
	bcrypt = require('bcrypt'),
	path = require('path'),
	dbConn = require(path.join(__dirname, '../db_conn.js')),
	app = require(path.join(__dirname, '../app.js'));

var newUser = {
		username: 'newUser',
		password: 'newPassword'
	};

describe('the /api/login route', function(){

	// Create new user 
	before(function(done){
		bcrypt.hash(newUser.password, 10, function(err,hash){
			if (err) return done(err);
			dbConn.query('INSERT INTO users (username,password) VALUES ("newUser","'+hash+'")', function(err){
				if (err) done(err);
				done();
			});
		});
	});

	// Clear up database. 
	after(function(done){
		dbConn.query('DELETE FROM users WHERE username="newUser"',function(err){
			if (err) return done(err);
			done();
		});
	});

	it('should allow login if correct username/password supplied', function(done){

		// Make call to login. 
		request(app)
		.post('/api/login')
		.send(newUser)
		.end(function(err,res){
			if (err) return done(err);

			// Check response.
			expect(res.status).to.equal(200);
			expect(res.body.username).to.equal(newUser.username);
			expect(res.body.password).to.not.exist;

			done();
		});
	});

	it('should not allow login if non-existent username supplied', function(done){

		// Make call to login.
		request(app)
		.post('/api/login')
		.send({username:'anotherUsername', password:'newPassword'})
		.end(function(err,res){
			expect(err.status).to.equal(404);
			done();
		});
	});

	it('should not allow login if incorrect password supplied', function(done){

		// Make call to login.
		request(app)
		.post('/api/login')
		.send({username:'newUsername', password:'wrongPassword'})
		.end(function(err,res){
			expect(err.status).to.equal(404);
			done();
		});
	});

});

describe('the /api/logout route', function(){

});

