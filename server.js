var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);

var shortId 		= require('shortid');
app.use(express.static(__dirname ));
var database_model = require('./Models/database_model');

var clients			= [];
var clientLookup = {};

database_model.connect(function (err_connect) {

});

io.on('connection', function(socket){
    
	var currentUser;
  
    
	console.log('A user ready for connection!');
	
	socket.on('beep', function(){
	    console.log('test beep received! ');
		
	});
	
	 socket.on('REGISTER', function (data){
       var jo = JSON.parse(data);
	  datasetup.searchUser(jo.name, function (err, rows) {
        
        if (rows.length > 0) {
            console.log("user already exists! ");
			 result = {
			         exist:"1"
					 
		             };
			 socket.emit('REGISTER_RESULT',1);
        } else {
            
			datasetup.addUser(jo.name, jo.pass, function (err, jo) {
                if (err) { console.error(err); }
                else {
				   
                    console.log("user registered with success! ");
					result = {
			         exist:"0"
					 
		             };
                    socket.emit('REGISTER_RESULT',0);
                }
            });
			 
        }

    });
	
            
        
    });
	
	socket.on('LOGIN', function(player){
	
	   	 database_model.verify_fk(player.name, player.pass, function ( result) {
       
         if (result == true) {
				 
		   console.log("authenticated user");
		   console.log('[INFO] Player ' + player.name + ' connected!');

		   database_model.loadUser(player.name, function (err, rows) {
                    
			    if (err) { console.error(err); }
				   
				 //instantiate a new player in that server to be added in clients list
				 currentUser = {
					 id:shortId.generate(),
			         name:rows[0].user,
					 position:player.position
		          };
					 
				 clientLookup[currentUser.id] = currentUser;//add client in search engine
			     clients.push(currentUser);//add currentUser in clients
				 socket.emit("LOGIN_SUCCESS",currentUser);
					
				 //for each client on-line instance in the customer's machine that called this function all of the prefabs player corresponding to the other customers
		         for (var i = 0; i < clients.length; i++) {		
	              // verifies if he is not the self customer			
		          if(clients[i].id != currentUser.id )
		           {
					 console.log('[INFO] generate ' + clients[i].name+ ' connected!');
		             //send to currentUser the others players on line, the call INSTANTIATE_PLAYER sera processada pela funcao OnInstantiatePlayer no script TestsocketIO no cliente
			         socket.emit('SPAW_PLAYER',{
				          name:clients[i].name,
				          id:clients[i].id,
						  position:clients[i].position,

			         });
			         console.log('User name '+clients[i].name+' is connected..');
		            }

		           };
		           //envia para todos os outros clientes on-line exceto o cliente que chamou esse socket o novo player que e o propio cliente
		           socket.broadcast.emit('SPAW_PLAYER',currentUser);//o no broadcast o currentUser nao recebe , INSTANTIATE_PLAYER sera processada pela funcao OnInstantiatePlayer
	              
			});
		         
		 }
		 else
		 {
			console.log("incorrect login or pass");
			socket.emit("INCORRECT_PASS");
				 
		 }
				
	    });
	});
	   
	//funcao para atualizar a movimentacao do cliente que chamou este socket para os demais clientes do game
	socket.on('MOVE', function (data)
	{
	  currentUser.position = data.position;
	  socket.broadcast.emit('UPDATE_MOVE', currentUser);//envia para todos os outros clientes a nova posicao do cliente que chamou este socket UPDATE_MOVE' sera
      console.log(currentUser.name+" Move to "+currentUser.position);
	
	});
	
	
	//funcao para atualizar a movimentacao do cliente que chamou este socket para os demais clientes do game
	socket.on('ROTATE', function (data)
	{
    
	  currentUser.rotation = data.rotation;
      socket.broadcast.emit('UPDATE_ROTATE', currentUser);//envia para todos os outros clientes a nova posicao do cliente que chamou este socket UPDATE_MOVE' sera
      console.log(currentUser.name+" Rotate to "+currentUser.rotation); // processada pela funcao onUserMove em todos os clientes exceto o cliente que chamou este socket
	 
	});
	
	
	socket.on('disconnect', function ()
	{

		socket.broadcast.emit('USER_DISCONNECTED',currentUser);
		for (var i = 0; i < clients.length; i++)
		{
			if (clients[i].name == currentUser.name && clients[i].id == currentUser.id) 
			{

				console.log("User "+clients[i].name+" has disconnected");
				clients.splice(i,1);

			};
		};
	});
	
	
});

http.listen(process.env.PORT ||3000, function(){
	console.log('listening on *:3000');
});
console.log("------- server is running -------");