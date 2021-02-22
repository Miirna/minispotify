var path = require('path');
var fs = require('fs');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
var mongoosePaginate = require('mongoose-pagination');

function getSong(req, res){
    var songId = req.params.id;

    Song.findById(songId).populate({path: 'album'}).exec((err, song) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!song){
                res.status(404).send({message: 'La cancion no existe'});
            } else{
                res.status(200).send({song});
            }
        }
    });
}

function getSongs (req, res){
    var albumId = req.params.album;
    if(!albumId){
        var find = Song.find({}).sort('number');
    } else{
        var find = Song.find({album: albumId}).sort('number');
    }
    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function (err, songs) {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!songs){
                res.status(404).send({message: 'No hay canciones'});
            } else{
                res.status(200).send({songs});
            }
        }
    })
}

function saveSong(req, res){
    var song = new Song();
    var params = req.body;

    song.number = params.number;
    song.name = params.name;
    song.file = 'null';
    song.duration = params.duration;
    song.file = params.file;
    song.album = params.album;

    song.save((err, songStored) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!songStored){
                res.status(404).send({message: 'No se ha podido guardar la cancion'});
            } else {
                res.status(200).send({song: songStored});
            }
        }
    });
}

function updateSong(req, res){
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdate) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!songUpdate){
                res.status(404).send({message: 'No se ha podido guardar la cancion'});
            } else {
                res.status(200).send({song: songUpdate});
            }
        }
    });
}

function deleteSong(req, res){
    var songId= req.params.id;
    Song.findByIdAndRemove(songId, (err, songRemove) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!songRemove){
                res.status(404).send({message: 'No se ha podido borrar la cancion'});
            } else {
                res.status(200).send({song: songRemove});
            }
        }
    });
}

function uploadFile(req, res){
    var songId = req.params.id;
    var filename = 'No subido...';

    if(req.files){
        var file_path = req.files.file.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //console.log(ext_split);
        if(file_ext == 'mp3' || file_ext == 'mp4'){
            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdate) => {
               if(!songUpdate) {
                   res.status(404).send({message: 'No se ha podidp actualizar el usuario'});
               } else {
                   res.status(200).send({song: songUpdate});
               }
           });           
        } else {
            res.status(200).send({message: "Extencion de la imagen no valida"});
        }
    }else {
        res.status(200).send({message: "No ha subido ninguna imagen"});
    }
}

function getSongFile(req, res){
    var file = req.params.songFile;
    var path_file = './uploads/songs/' + file;
   fs.exists(path_file, function(exists){
       if(exists){            
            res.sendFile(path.resolve(path_file));
       } else{
            res.status(200).send({message: 'No existe la cancion'});
       }
   })
}

module.exports = {
    getSong,
    getSongs,
    saveSong,
    updateSong,
    deleteSong, 
    uploadFile,
    getSongFile
}