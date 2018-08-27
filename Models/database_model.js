function database_model() {

    this.version = '0.0.1';
    var db = null;
    var mysql = require('mysql');
    var config = {
        host : 'dragondice.com.br',
        user : 'dragondi_adm',
        password : 'Animes21',
        database : 'dragondi_chronos',
	    /*
        host : 'localhost',
        user : '',
        password : '',
        database : 'dragondi_chronos',
	    */
    }

    this.connect = function (callback){
        
        db = mysql.createConnection(config);
        db.connect(function (err) {
            
           if (err) 
		   {
            console.error('error connecting myslq :' + err);
            return;
           }
            
           console.log('Connected as database ' + config.database);

            callback(err);
        });

    };
	//function to add a new user
	this.addUser = function (user, pass, callback) {

        db.query("INSERT INTO users ( `user`, `pass`) VALUES (?,?)",[user,pass], function (err, data) {
            if (err) { console.error(err); }
            
            callback(err, data);
        });

    };

	
	 //function to already verify some exists user with the same name in the database 
	this.verify_fk = function(_user,_pass,callback)
    {
	    var sql = "SELECT * FROM users WHERE user =" + mysql.escape(_user)+"AND pass ="+mysql.escape(_pass);
		db.query(sql, function (err, rows) {

            if(err){ console.error(err);}
			
			if (rows[0]) {
			   callback(true);
			}
			else
			{
			  callback(false);
			}
		
        });
		
    };
    
	

    this.loadUser = function (user, callback) {

        db.query('SELECT * FROM users WHERE user = ?',[user], function (err, rows) {

            if(err){ console.error(err);}
            callback(err, rows);
        });

    };

}
module.exports = new database_model;
