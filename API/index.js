'use strict'
var mongoose = require('mongoose');
var app = require("./app");
var port = process.env.PORT || 3977;


mongoose.connect('mongodb://localhost:27017/miniSpotify', (err, res) => {
    if(err){
        throw err;
    } else {
        console.log("La base de datos esta conectada correctamente");
        app.listen(port, function() {
            console.log("Servido corriendo en puerto " + port);
        });
    }
});