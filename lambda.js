const tesseract = require('node-tesseract');

const fs = require('fs');

const temp = require("temp");

const request = require('request').defaults({ encoding: null });

//process.env['LD_DEBUG'] = 'all';

const urlToBuffer = (url, cb) => {
	request.get(url, function (error, response, body) {
		let buffer = !error && new Buffer(body, 'binary');
		cb(error, !error && buffer);
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

const imageToOCR = (buffer, cb) => {
    bufferToPath(buffer, (err, path) => {
        if (err) return cb(err);
        tesseract.process(path, {
			binary: (process.env.BIN_DIR || '.') + '/tesseract' 
		}, (err, text) => {
            if (err) {
                cb(err);
            } else {
                cb(null, text.trim());
            }
        });
    });
}

const handler = exports.handler = function (event, context) {
	const process = (err, buffer) => {
		if(err) return context.fail(err);
		imageToOCR(buffer, context.done);
	}

	if(event.base64){
		base64ToBuffer(event.base64, process);
	}else{
		urlToBuffer(event.url, process);
	}
	
};

process.on('uncaughtException', function(err) {
	console.log(err);
});



