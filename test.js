var event = require('./test.json');
var lambda = require('./lambda');

const callback = (err, data) => {
    if(err){
        console.log(err, data);
    }else{
        console.log(data);
    }
}

lambda.handler(event, {
    done: callback,
    fail: (err) => {
        callback(err);
    }
});