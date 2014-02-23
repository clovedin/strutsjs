var fs = require('fs');
var http = require('http');
var url = require('url');

var configFilePath = './config.json';
var config = {};
var mime = ['ico','jpeg','jpg','png','gif','txt','html','htm','css','js'];
var baseDir = './';


/*
 *
 */
 initServer();
 /*
  *
  */
var server = http.createServer().listen(config.port, config.ip, registtServer);


function initServer(){
	config=getConfig(configFilePath);
	console.log('Create server @ http://'+config.ip+':'+config.port);
}

function getConfig(path){
	var cfg = {};
	try{
		cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
	}catch(err){
		console.log('Read file : "'+path+'" error : '+err);
	}

	cfg.port = cfg.port || 1106;
	cfg.ip = cfg.ip || 'localhost';

	baseDir = (cfg.baseDir+'/') || './';

	return cfg;
}

function registtServer(){
	console.log('server start ...');
	//
	server.on('request', requestProcess);
	//
	server.on('close', closeProcess);
}

/*
	对url的处理：
	1, / 映射到欢迎页,或者action
	2, xx.html, yy.js, zz.css 映射到文件，或者action
	3, xxx? 映射到action
*/
function requestProcess(req, res){
	if ( (req.url.indexOf('?') < 0) && (req.method === 'GET') ) {
		if (req.url === '/') {
			var wpath = baseDir + (config.welcomeFile || 'index.html');
			console.log(wpath+' pk '+baseDir);
			var file = '';
			fs.readFile(wpath, function(err, data){
				if (err) {
					err404(res, wpath);
				}else{
					res.writeHead(200, {});
					res.end(data.toString());
					return;
				};
			});
		}else{
			for(var i=0,len=mime.length; i<len; i++){
				if (req.url.indexOf('.'+mime[i]) > 0) {
					console.log('MSG : return '+mime[i]+' file !');
					var path = baseDir + req.url.substring(1);
					console.log('MSG : request file : '+path);
					fs.readFile(path, function(err, data){
						if (err) {
							err404(res, path);
						}else{
							res.writeHead(200, {});
							res.end(data);
						};
					});
					return;
				};
			}
		};
	}
	if (req.url.indexOf('?') > 0) {
		var query = url.parse(req.url).query;
		
		console.log(query);
		
		res.writeHead(200, {});

		console.log(queryToObject(query));
		
		var resStr = queryToObject(query).toString();
		res.end(resStr);
	};
	if(req.method === 'POST'){
		
	};
	/*
	
	
	*/
	// baseRes(res);
}

function closeProcess(){

}

function queryToObject(q){
	var kv = q.split('&');
	var obj = {};
	for(var idx in kv){
		var k = kv[idx].split('=')[0];
		var v = kv[idx].split('=')[1];
		obj[k] = v;
	}
	return obj;
}

function readFile(file){
	console.log('Ready read file : '+file);
	fs.readFile(file, function(err, data){
		if (err) throw err;
  		console.log(data.toString());
	});
}

function err404(res, path){
	console.log('ERR : 404 file not found @ '+path);
	res.writeHead(404, {});
	res.end('404 error . Not found file : '+path);
}

function baseRes(res){
	res.writeHead(200, {});
	res.end('write end by clovedin !');
}
