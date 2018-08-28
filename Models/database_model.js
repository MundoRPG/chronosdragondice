function database_model() {
  this.version = '0.0.1';
       var db = null;
       var mysql = require('mysql');
       var config = {
           host : '127.0.0.1',
           user : 'root',
           password : '',
           database : 'sql3254135'
       }


      this.connect = function (callback){

       db = mysql.createConnection(process.env.DATABASE_URL || config);
       db.connect(function (err) {
         if (err)
 		        {
                console.error('error connecting myslq :' + err);
                return;
            }
            console.log('Connected as database ' + config.database);

          callback(err);//return

       });


      };
/*******************************************************************************************/
       this.loadUser = function (user, callback) {

         db.query('SELECT * FROM users WHERE user_name = ? ',[user], function (err, rows) {

           if(err){ console.error(err);}

           callback(err, rows);//return

         });


       };

     this.addUser = function (user,pass,avatar, callback) {
	   var xp = 1;
	   var hp = 100;
	   var maxHp = 100;
       db.query("INSERT INTO users ( `user_name`, `pass`,`avatar`,`xp`,`hp`,`maxHp`) VALUES (?,?,?,?,?,?)",[user,pass,avatar,xp,hp,maxHp], function (err, data) {

         if(err){ console.error(err);}

         callback(err, data);//return

       });


     };
	 
	  this.verify_user = function(_user,_pass,callback)
    {
       var sql =  "SELECT * FROM users WHERE user_name =" + mysql.escape(_user)+"AND pass ="+mysql.escape(_pass);
       db.query(sql, function(err, rows)
        {
            if(err){ console.error(err);}

            if (rows[0]) {//exist a user
               callback(true);//return
            }
            else{

                   callback(false);//return
            }

        });
    };
 /**********************************************************************************************************************/

 
	 this.createItensRegister = function (_user, callback) {
	   var _espada = 0;
	   var _escudo = 0;
	   var _pocao =  0;
       db.query("INSERT INTO itens ( `user_name`, `espada`,`escudo`,`pocao`) VALUES (?,?,?,?)",[_user,_espada,_escudo,_pocao], function (err, data) {

         if(err){ console.error(err);}

         callback(err, data);//return

       });


     };
	 
	 this.loadItens = function (user, callback) {

         db.query('SELECT * FROM itens WHERE user_name = ? ',[user], function (err, rows) {

           if(err){ console.error(err);}

           callback(err, rows);//return

         });


       };


	 this.UpdateItem  = function (user, _iten, callback) {
	    
		this.loadItens(user, function (err, itens) {
				 
		    if (err) { console.error(err); }
			
			 if(_iten == 'espada')
	         {
	           var dataUpdate = {

               espada :itens[0].espada +1,
               }
		
		    db.query("UPDATE itens set ? WHERE user_name = ? ",[dataUpdate,user], function (err, data) {
            
              if (err) { console.error(err); }
              itens[0].espada = itens[0].espada+1;//atualização para o cliente
              callback(err, itens);
            });
		
	        }
	        if(_iten == 'escudo')
	        {
	           var dataUpdate = {

                  escudo : itens[0].escudo +1,
               }
		
		      db.query("UPDATE itens set ? WHERE user_name = ? ",[dataUpdate,user], function (err, data) {
            
              if (err) { console.error(err); }
              itens[0].escudo = itens[0].escudo+1;//atualização para o cliente
              callback(err, itens);
              });
		
	        }
	        if(_iten == 'pocao')
	        {
	            var dataUpdate = {

                pocao : itens[0].pocao +1,
                }
		
		       db.query("UPDATE itens set ? WHERE user_name = ? ",[dataUpdate,user], function (err, data) {
            
                if (err) { console.error(err); }
                itens[0].escudo = itens[0].pocao+1;//atualização para o cliente
                callback(err, itens);
                });
	        }
				   
				   
	    
		});
	  
	};

    


}



module.exports = new database_model;
