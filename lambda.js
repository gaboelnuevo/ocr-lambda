const tesseract = require('node-tesseract');

const fs = require('fs');

const temp = require("temp");

const request = require('request').defaults({ encoding: null });

//process.env['LD_DEBUG'] = 'all';

const download = (url, dest, cb) =>  {
    var file = fs.createWriteStream(dest);
    var sendReq = request.get(url);
    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
    });
    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest);
        return cb(err.message);
    });
    sendReq.pipe(file);
    file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
    });
    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};

const urlToFile = (url, cb) => {
	var tempName = temp.path({suffix: '.jpg'});
	download(url, tempName, (err, file) => {
		cb(err, tempName);
	});
}

const base64ToBuffer = (base64str, cb) => {
	let bitmap = new Buffer(base64str.replace(/^data:image\/\w+;base64,/, ''), 'base64');
	cb(null, bitmap);
}

const bufferToPath = (buffer, cb) => {
    var tempName = temp.path({suffix: '.jpg'});
    fs.writeFile(tempName, buffer, (err) => {
        if(err) console.log(err);
        cb(err, tempName);
    });
}

const processFile = (path, cb) => {
	tesseract.process(path, {
		binary: process.env.BIN_DIR ? process.env.BIN_DIR  + '/tesseract': '/usr/local/bin/tesseract' 
	}, (err, text) => {
		if (err) {
			cb(err);
		} else {
			cb(null, text.trim());
		}
	});
}

const imageBufferToOCR = (buffer, cb) => {
    bufferToPath(buffer, (err, path) => {
        if (err) return cb(err);
        processFile(path, cb);
    });
}

const handler = exports.handler = function (event, context) {	
	if(event.base64){
		base64ToBuffer(event.base64, (err, buffer) => {
			if(err) return context.fail(err);
			imageBufferToOCR(buffer, context.done);
		});
	}else{
		urlToFile(event.url, (err, path) => {
			if(err) return context.fail(err);
			processFile(path, context.done);
		});
	}
};

process.on('uncaughtException', function(err) {
	console.log(err);
});



