var path = require('path');
var fs = require('fs');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
var mongoosePaginate = require('mongoose-pagination');


function getArtist(req, res){
    var artistId = req.params.id;
    Artist.findById(artistId, (err, artist) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else{
            if(!artist){
                res.status(404).send({message: 'El artista no existe'});
            } else {
                res.status(200).send({artist});
            }
        }
    });
    
}

function getArtists(req, res){
    if(req.params.page){
        var page = req.params.page;
    } else{
        var page = 1;
    }
    
    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total){
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        } else{
            if(!artists){
                res.status(404).send({message: 'No hay artistas'});
            } else {
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                });
            }
        }
    });

}

function saveArtist(req, res){
    var artist = new Artist();
    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el artista'});
        } else {
            if(!artistStored) {
                res.status(404).send({message: 'El artista no ha sido guardado'});
            } else {
                res.status(200).send({artist: artistStored});
            }
        }
    });
}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdate) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar al artista'});
        } else{
            if(!artistUpdate){
                res.status(404).send({message: 'El artista no ha sido actualizado'});
            } else {
                res.status(200).send({artist: artistUpdate});
            }
        }
    });
}

function deleteArtist(req, res){
    var artistId = req.params.id;
    Artist.findByIdAndRemove(artistId, (err, artistRemove) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar al artista'});
        } else {
            if(!artistRemove){
                res.status(404).send({message: 'El artista no a sido eliminado'});
            } else {
                Album.find({artist: artistRemove._id}).remove((err, albumRemove) => {
                    if(err){
                        res.status(500).send({message: 'Error al elimiar el album'});
                    } else {
                        if(!artistRemove){
                            res.status(404).send({message: 'El album no ha sido eliminado'});
                        } else {
                            Song.find({album: albumRemove._id}).remove((err, songRemove) => {
                                if(err){
                                    res.status(500).send({message: 'Error al elimiar la cancion'});
                                } else {
                                    if(!artistRemove){
                                        res.status(404).send({message: 'La cancion no ha sido eliminada'});
                                    } else {
                                        res.status(200).send({artist: artistRemove})
                                    }
                                }
                            });
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
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdate) => {
               if(!artistUpdate) {
                   res.status(404).send({message: 'No se ha podidp actualizar el usuario'});
               } else {
                   res.status(200).send({artist: artistUpdate});
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
    var path_file = './uploads/artists/' + imageFile;
   fs.exists(path_file, function(exists){
       if(exists){            
            res.sendFile(path.resolve(path_file));
       } else{
            res.status(200).send({message: 'No existe la imagen'});
       }
   })
}

module.exports = {
    getArtist,
    getArtists, 
    saveArtist,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}