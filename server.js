
var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);
var shortId 		= require('shortid');//import shortid lib
var database_model = require('./Models/database_model');
app.use(express.static(__dirname));

var clients			= [];//storage clients
var clientLookup = {};// cliends search engine
var sockets = {};


//open a connection with the database through the file:	./Database/database_model
database_model.connect(function (err_connect) {




});



//houve uma conexão de algum cliente que abriu alguma aplicação pela primeira vez
io.on('connection', function(socket){
  
    console.log('A user ready for connection!');
  //console.log('connection socket:!'+socket.id);

    var currentUser;//variavel para guardar o cliente corrente que abriu algum dos  sockets abaixo
	
	/************************************************************************************************************************************/
	//description: process request of user's registration
	//socket open for the method NetworkController.EmitRegister(string _login , string _pass ) in Unity aplication
	socket.on('REGISTER', function (data){

		//chamada a função assincrona database_model.loadUser que verifica se existe algum usuário com o nome data.name passado como parametro no banco de dados
	   // o resultado e retornado pelas variáveis err ou row e serão processados dentro da callback function (err, rows){processamento...}
      database_model.loadUser(data.name, function (err, rows) {

	      if (rows.length > 0) {
	    
		   console.log("user already exits! ");
	      // pacote JSON que retorna para a aplicação nesse caso 1 indicando que existe sim um usuario com o nome
	       result = {
			       exist:"1"//already exits
				    };

		    socket.emit('REGISTER_RESULT',result);//envia para o metodo NetworkController.OnRegisterResult(SocketIOEvent _result) da aplicacao que abriu este socket

		   }//END-IF
		   else
		   {
			 //a callback  function (err, data) {process..} processa o resultado da operação retornado na variavel data
		     console.log("avatar escolhido: "+data.avatar);
		     database_model.addUser(data.name, data.pass,data.avatar, function (err, rows) {//TRY ADD USER

                 if (err) { console.error(err); }

	             else {
            
		            console.log("user registered with success! ");
		            database_model.createItensRegister(data.name, function (err, result) {//try create inventary

                       if (err) { console.error(err); }
		               // pacote JSON que retorna para a aplicação nesse caso 0 indicando que o usuario foi cadastrado com sucesso
		               result =
		               {
			              exist:"0"

		               };
		               socket.emit('REGISTER_RESULT',result);//envia para o metodo NetworkController.OnRegisterResult(SocketIOEvent _result) da aplicacao que abriu este socket
                    });//END-DATABASE_MODEL.reateItensRegister
		        }//END-ELSE

		    });//END-DATABASE_MODEL.ADDUSER
		}//END-ELSE

	   });//END-database_model.loadUser



    });//END-SOCET REGISTER

	/***********************************************************************************************************************************/
	
	
    /***********************************************************************************************************************************/
     //description: process request of user's login
	//socket open for the method NetworkController.EmitLogin(string _login , string _pass ) in Unity aplication
     socket.on('LOGIN', function (data){

	   //first verify if user exist
	   database_model.verify_user(data.name,data.pass, function(result)
       {
	       if (result == true) {

			console.log("user authenticated!");
			console.log('[INFO] Player: ' + data.name + ' connected!');
           
		   //second try load user
           database_model.loadUser(data.name, function (err, rows) {//notice that this callback is inside of the callback verifyUser to guarantee the execution order

				 if (err) { console.error(err); }
                 //current user JSon Package
				 currentUser = {
			        name:rows[0].user_name,
					id:shortId.generate(),
					avatar:rows[0].avatar,
					animation:'',
				    xp:rows[0].xp,
					hp:rows[0].hp,
					maxHp:rows[0].maxHp,
					espada:0,
					escudo:0,
					pocao:0,
					position:''
		         };//instance a new player in server to be add in the clients list
				 
				 //third load user's itens
				 database_model.loadItens(data.name, function (err, itens) {//notice that this callback is inside of the callback loadUser to guarantee the execution order
				 
				   if (err) { console.error(err); }
				     
					 currentUser.espada = itens[0].espada;
					 currentUser.escudo = itens[0].escudo;
					 currentUser.pocao = itens[0].pocao;
					 
				     clientLookup[currentUser.id] = currentUser;//add client in search engine
				     clients.push(currentUser);//add currentUser in clients
				     socket.emit("LOGIN_SUCCESS",currentUser);

				     for (var i = 0; i < clients.length; i++) {
					  
					     //testa para ver se nao e o propio cliente
						 if(clients[i].id != currentUser.id )
						   {
							console.log('[INFO] generate ' + clients[i].name+ ' connected!');
							//send for the currentUser the other players on line, THE call SPAW_PLAYER will be processed by the function  OnInstantiateNetworkPlayer in the script TestsocketIO in the customer
						     socket.emit('SPAW_PLAYER',{

								 name:clients[i].name,
								 id:clients[i].id,
								 avatar:clients[i].avatar,
						         position:clients[i].position

								});
								 console.log('User name '+clients[i].name+' is connected..');
						 }//END-IF
					   }//END-FOR
					 
		             socket.broadcast.emit('SPAW_PLAYER',currentUser); //send to others clients except currentUser
				 });//END-database_model.loadItens
				 
				

			});//END- database_model.loadUser

		}//END-IF

		else
	    {
		   console.log("incorrect login or password");
		   socket.emit("INCORRECT_PASS");

		}
         });//END-database_model.verify_user

    });//END-SOCKET.ON
	
  /************************************************************************************************************/
	
  /************************************************************************************************************/
	 //description: call when the user catches an item
	//socket open for the method NetworkController.EmitTakeItem(string _item ) in Unity aplication
     
	socket.on('UPDATE_ITEM', function (data){

	  database_model.UpdateItem(currentUser.name, data.item, function (err, rows) {
	
	    if (err) { console.error(err); }
	 
	    console.log("item: "+rows[0].user_name+" atualizado com sucesso!");
	    console.log("espada: "+rows[0].espada);
	    console.log("escudo: "+rows[0].escudo);
	    console.log("pocao: "+rows[0].pocao);
	    socket.emit('UPDATE_ITEM_COLLECTED',{

								 espada:rows[0].espada,
								 escudo:rows[0].escudo,
								 pocao:rows[0].pocao
	                           });
	
	 });//END-database_model.UpdateItem
	
	
	
	});//END-SOCKET.ON
 /***************************************************************************************************************/
 
 
	
/******************************************************************************************************************/	
	//description: call when the user MOVE
	//socket open for the method NetworkController.EmitPosition(Vector3 _pos , string animation) in Unity aplication
	socket.on('MOVE', function (data)
	{
	  if(currentUser)
	  {
	
       currentUser.position = data.position;
	   currentUser.animation = data.animation;
       socket.broadcast.emit('UPDATE_MOVE', currentUser);//envia para todos os outros clientes a nova posicao do cliente que chamou este socket send to 'UPDATE_MOVE' in networkController in unity app
      // console.log(currentUser.name+" Move to "+currentUser.position);
	  }
	});
	
/************************************************************************************************************************************/	

/************************************************************************************************************************************/	
	//description: call when the user rotate
	//socket open for the method NetworkController.EmitRotation(Quaternion _rot) in Unity aplication
	socket.on('ROTATE', function (data)
	{
      if(currentUser)
	  {
	   currentUser.rotation = data.rotation;
       socket.broadcast.emit('UPDATE_ROTATE', currentUser);
      // console.log(currentUser.name+" Rotate to "+currentUser.rotation);
	  }
	});
	
/*************************************************************************************************************************************/


/**************************************************************************************************************************************/	
	//description: call when the user stop move
	//socket open for the method NetworkController.EmitRotation(Quaternion _rot) in Unity aplication
	socket.on('IDLE', function (data)
	{
	  if(currentUser)
	  {
	   currentUser.animation = data.animation;
       socket.broadcast.emit('UPDATE_IDLE', currentUser);
      }
	  
	});

/***************************************************************************************************************************************/

/***************************************************************************************************************************************/	
	//description: call when the user desconnect
	//socket open for the API Socket.io in Unity aplication
	socket.on('disconnect', function ()
	{
        console.log("User  has disconnected");
	    console.log("conexão finalizada!");
	    if(currentUser)
		{
		 currentUser.isDead = true;
		 socket.broadcast.emit('USER_DISCONNECTED', currentUser);//emite para o metodo NetworkController.OnUserDisconnected(SocketIOEvent _myPlayer)
		 
		
		 for (var i = 0; i < clients.length; i++)
		 {
			if (clients[i].name == currentUser.name && clients[i].id == currentUser.id) 
			{

				console.log("User "+clients[i].name+" has disconnected");
				clients.splice(i,1);

			};
		};	
		
		
		}
    });//END-SOCKET.ON
 /**************************************************************************************************************************************************/	
		
});//END-IO.ON
/***********************************************************************************************************************************/

http.listen(process.env.PORT ||3000, function(){
	console.log('listening on *:3000');
});
console.log("------- server is running -------");
