var path = require('path');
var fs = require('fs');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
var mongoosePaginate = require('mongoose-pagination');


function getAlbum(req, res){
    var albumId = req.params.id;

    //conseguir todos los datos que ha creado un album 
    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        }else{
            if(!album){
                res.status(404).send({message: 'El album no existe'});
            } else{
                res.status(200).send({album});
            }
        }
    });
}

function getAlbums(req, res){
    var artistId = req.params.artist;
    if(!artistId){
        //sacar todos los albums de la db
        var find = Album.find({}).sort('title');
    }else{
        //sacar los album de un artista concreto de la db
        var find = Album.find({artist: artistId}).sort('year');
    }

    find.populate({path: 'artist'}).exec((err, albums) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else {
            if(!albums){
                res.status(404).send({message: 'No hay albums'});
            } else{
                res.status(200).send({albums});
            }            
        }
    }); 
}

function saveAlbum(req, res){
    var album = new Album();
    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if(err){
            res.status(500).send({message: "Error en la peticion"});
        } else {
            if(!albumStored){
                res.status(404).send({message: "No se ha guardado el dato"});
            } else{
                res.status(200).send({album: albumStored});
            }
        }
    });
}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdate) => {
        if(err){
            res.status(500).send({message: "Error en la peticion"});
        } else {
            if(!albumUpdate){
                res.status(404).send({message: "No se ha actualizado el dato"});
            } else{
                res.status(200).send({album: albumUpdate});
            }
        }
    });
}

function deleteAlbum(req, res){
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, (err, albumRemove) => {
        if(err){
            res.status(500).send({message: 'Error al elimiar el album'});
        } else {
            if(!albumRemove){
                res.status(404).send({message: 'El album no ha sido eliminado'});
            } else {
                Song.find({album: albumRemove._id}).remove((err, songRemove) => {
                    if(err){
                        res.status(500).send({message: 'Error al elimiar la cancion'});
                    } else {
                        if(!albumRemove){
                            res.status(404).send({message: 'La cancion no ha sido eliminada'});
                        } else {
                            res.status(200).send({album: albumRemove});
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res){
    var albumId = req.params.id;
    var filename = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //console.log(ext_split);
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdate) => {
               if(!albumUpdate) {
                   res.status(404).send({message: 'No se ha podidp actualizar el usuario'});
               } else {
                   res.status(200).send({album: albumUpdate});
               }
           });           
        } else {
            res.status(200).send({message: "Extencion de la imagen no valida"});
        }
    }else {
        res.status(200).send({message: "No ha subido ninguna imagen"});
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/albums/' + imageFile;
   fs.exists(path_file, function(exists){
       if(exists){            
            res.sendFile(path.resolve(path_file));
       } else{
            res.status(200).send({message: 'No existe la imagen'});
       }
   })
}

module.exports = {
    getAlbum,
    getAlbums, 
    saveAlbum, 
    updateAlbum, 
    deleteAlbum,
    uploadImage,
    getImageFile
}