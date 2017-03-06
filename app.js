var Hapi = require("hapi");
var Joi = require("joi"); 				// useful for validation
var Path = require('path'); 			//useful for specifying path
var Inert = require('inert'); 			//useful for serving static content
var cache = require('catbox-redis'); 	// useful for caching
var server = new Hapi.Server(); 		// creating a new server

server.connection({						// establishing server connection
	host:'localhost',
	port:3000
});

var fibo1 = function(number){	
	if(number == 1){		
		nextTerm = 1;						
	}else{		
		// nextTerm = fibo1(number-1) + fibo1(number-2);
		// nextTerm = setTimeout(function(){fibo1(number-1);},1); + setTimeout(function(){fibo1(number-2)},1);
		nextTerm = setTimeout(fibo1(number-1),1); + setTimeout(fibo1(number-2),1);// infinite loop
	}	
	console.log("returned nextTerm :"+ nextTerm);			
	return nextTerm;			
};

var fiboSeries = function(number,next){// function to calculate fibonacci series until the required element		
	var sequence = [];
	sequence[0] = 1; 
	sequence[1] = 1;
	var nextTerm = '';
	nextTerm = fibo1(number);	
	console.log("returned nextTerm :"+ nextTerm);
	console.log("number :"+ number);
	// while(nextTerm<=number){
	// 	console.log("inside while loop");
	// 	sequence.push(nextTerm);
	// 	console.log("pushed nextterm to sequence");
	// }
	var returnObject = {value:number,sequence:sequence};	
	next(null,returnObject);
	return returnObject;
};
server.method('fiboSeries',fiboSeries,{
	cache:{
		expiresIn:30000,
		generateTimeout: 10000
	}
});
server.register([require('vision'), Inert],function(err){
	if(err){
		throw err;
	}
	server.route({
		method:'POST',
		path:'/',
		handler:function(req,reply){
			var value = req.payload;
			server.methods.fiboSeries(value.number,function(err,result){
				if (err){
					throw err;
				}else{
					reply(result); 				
				}
			});			
		 },
		config: {
        	validate: {					//validation of the input
            	payload: {
                	number: Joi.number().integer().min(1).max(10000).default(1)
            	}
        	}
    	}
	});
	server.route([{
		method:'GET',
		path:'/',
		handler:{
			file:('public/index.html')
		}
	},
	{
		method: 'GET',
		path: '/public/{param*}',
		handler: {
		    directory: {
		        path: Path.normalize(__dirname + '/public')
		    }		    
		}
	}
	]);
	server.views({
		engines:{
			html:require('handlebars')
		},
		path: Path.join(__dirname, 'public')
	});
});
server.start(function(){ 								//start the server
	console.log("server running at: ",server.info.uri); // server.info.uri has the info, outputs : server running at:  http://localhost:3000
});