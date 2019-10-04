console.log("test")
var advicehide = false;

var wasNull = true;
var cap = 20;

function songInPlaylist(songURI, playlistObject) {
    for (let i = 0; i < playlistObject['items'].length; i++) {
        if (playlistObject['items'][i]['track']['uri'] == songURI) {
            return true;
        }
    }
    return false;
}



$("#playSomething").hide();

//Get Current Song
var songObj = null;
setInterval(function() {

    if (songObj == null && advicehide == true) {
        // console.log("Show advice")
        $("#playSomething").show();
    } else {
        //console.log("Hide advice")
        $("#playSomething").hide();
    }

    if (loggedIn) {
        console.log("AJAX: Get Currently-Playing");
        $.ajax({
            url: "https://api.spotify.com/v1/me/player/currently-playing",
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(data) {

                if (data == undefined || data == null) {
                    $("#sticky-footer").hide();
                    $("#playlistsView").hide();
                    $("#playlistList").hide();
                    $("#playlistListList").hide();
                    $("#playlistOrganizer").hide();
                    $("#songInfo").hide();
                    $("#artistInfo").hide();
                    return;
                }

                if (songObj == null || data['item']['uri'] != songObj['item']['uri']) {
                    // if (songObj != null) {
                    //     console.log("not null");
                    //     console.log(data['item']['name'] + " vs " + songObj['item']['name']);
                    // } else {
                    songObj = data;
                    wasNull = true;

                    //}
                }
                //update Song
                if (wasNull || songObj['item']['uri'] != data['item']['uri']) { //data != null && songObj != null && songObj != undefined && data['item']['uri'] != songObj['item']['uri'] || wasNull) {
                    wasNull = false;
                    songObj = data;
                    //console.log("Updating song");

                    //console.log("SongObj")
                    //console.log(songObj)

                    $("#playlistsView").show();
                    $("#playlistList").show();
                    $("#playlistListList").show();
                    $("#playlistOrganizer").show();
                    $("#songInfo").show();
                    $("#artistInfo").show();

                    playIcon();
                    isSaved();
                    audioFeatures();
                    getArtist();
                    getRelatedArtists()
                    getArtistBlurb();



                    $("#sticky-footer").show();
                    currentSong = data;

                    $("#currentTrack").html(songObj['item']['name']);
                    if (songObj['item']['name'].length > cap) {
                        document.querySelector("#currentTrack").classList.add("go")
                    } else {
                        console.log("Don't Scroll.")
                        document.querySelector("#currentTrack").classList.remove("go");
                    }

                    $("#currentAlbum").html(songObj['item']['album']['name']);
                    if (songObj['item']['album']['name'].length > cap) {
                        document.querySelector("#currentAlbum").classList.add("go")
                    } else {
                        //    console.log("Don't Scroll.")
                        document.querySelector("#currentAlbum").classList.remove("go");
                    }

                    let artists = "";
                    for (let i = 0; i < songObj['item']['album']['artists'].length; i++) {
                        artists += songObj['item']['album']['artists'][i]['name'];
                        if (i + 1 < songObj['item']['album']['artists'].length) {
                            artists += ", ";
                        }
                    }


                    $("#currentArtist").html(artists);
                    if (artists.length > cap) {
                        document.querySelector("#currentArtist").classList.add("go")
                    } else {
                        //console.log("Don't Scroll.")
                        document.querySelector("#currentArtist").classList.remove("go");
                    }

                    $("#currentArt").attr("src", songObj['item']['album']['images'][0]["url"]);


                    for (let i = 0; i < knownPlaylists.length; i++) {
                        updateSinglePlaylist(knownPlaylists[i]);
                        updateSingePlaylistNameArt(knownPlaylists[i]);
                    }
                } else {

                }
            },
            error: function(err) {
                console.log(err);
            }
        });
    }

}, 500);


//Check Playlists

setInterval(function() {
    //   getAlbumObj();
    if (songObj != null) {
        for (let i = 0; i < knownPlaylists.length; i++) {
            //            updateSinglePlaylist(knownPlaylists[i]);
            //            updateSingePlaylistNameArt(knownPlaylists[i]);
        }
    }
}, 500)

function removeSongFromPlaylist(songURI, playlistURI) {
    let tag = Math.random();
    console.log("USER REQUEST REMOVE SONG TO PLAYLIST");

    bodyTxt = JSON.stringify({ "tracks": [{ "uri": "spotify:track:" + songURI }] })
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistURI}/tracks`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + access_token,
        },
        data: bodyTxt,
        success: function(data) {
            console.log("SUCCESS REMOVE SONG")
            updateSinglePlaylist(playlistURI);
            updateSingePlaylistNameArt(playlistURI);
        },
        error: function(data) {
            console.log("ERROR REMOVE SONG")
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                $.ajax(this);
            }, wait);
        }

    });
}

function addSongFromPlaylist(songURI, playlistURI) {
    console.log("USER REQUEST ADD SONG TO PLAYLIST");
    let tag = Math.random();
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistURI}/tracks?uris=spotify:track:${songURI}`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + access_token,

        },

        success: function(data) {
            console.log("SUCCESS ADD SONG")
            updateSinglePlaylist(playlistURI);
            updateSingePlaylistNameArt(playlistURI);
        },
        error: function(data) {
            console.log("ERROR ADD SONG")
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                $.ajax(this);
            }, wait);
        }
    });
}

//update playlistJSON to the JSON object of the playlists, support only the last 50.
//TODO support more than 50.
function getPlaylistURIs() {

    let tag = Math.random();
    $.ajax({
        url: "https://api.spotify.com/v1/me/playlists?limit=50",
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
                // console.log(data)
                playlistJSON = (data);
                populate();
                $("#populated").collapse('hide');
                $("#populated").collapse('hide');
                $("#populated").collapse('hide');

            }
            //retry
            ,
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    });
}


//A list of URIs inside the playlist
var trackSet = [];
var trackCount = 0;

function getTracks(uri, offset) {

    tag = Math.random();
    // console.log(`https://api.spotify.com/v1/playlists/${uri}/tracks?offset=${offset*50}`)
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${uri}/tracks?offset=${offset*100}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
                //  console.log("Offset: " + offset)
                //  console.log(data['items'].length);
                trackCount = data['total'];
                for (let i = 0; i < data['items'].length; i++) {
                    trackSet.push(data['items'][i]['track']['uri'].substring(14));
                }
                if (data['next'] != null) {
                    //    console.log("Next!")
                    getTracks(uri, offset + 1);
                } else {
                    // return getTracks;
                }
            }
            //retry
            ,
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    });
}

//Method for an individual Check of tracks.
var spotTrackSet = [];
var spotTrackCount = 0;

function spotGetTracks(uri, offset) {
    spotTrackSet = [];
    let tag = Math.random();
    // console.log(`https://api.spotify.com/v1/playlists/${uri}/tracks?offset=${offset*50}`)
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${uri}/tracks?offset=${offset*100}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            //  console.log("Offset: " + offset)
            //  console.log(data['items'].length);
            spotTrackCount = data['total'];
            for (let i = 0; i < data['items'].length; i++) {
                spotTrackSet.push(data['items'][i]['track']['uri'].substring(14));
            }
            if (data['next'] != null) {
                //    console.log("Next!")
                getTracks(uri, offset + 1);
            } else {
                // return getTracks;
            }
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    });
}

function spotGetPlaylistInfo(uri) {
    let tag = Math.random();
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${uri}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    });
}

albumObj = {};


function getArtistObj() {

    let tag = Math.random();
    if (songObj == null) {
        console.log("songObj is null?")
        return
    }

    $.ajax({
        url: "https://api.spotify.com/v1/albums/" + songObj['item']['album']['id'],
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            // console.log(data)
            albumObj = data;
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function nextSong() {
    let tag = Math.random();
    return $.ajax({
        url: "https://api.spotify.com/v1/me/player/next",
        type: "POST",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("next song")
            play();
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function lastSong() {
    let tag = Math.random();

    return $.ajax({
        url: "https://api.spotify.com/v1/me/player/previous",
        type: "POST",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("last song")
            playIcon();
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}
//https://api.spotify.com/v1/me/player/pause
function pause() {
    let tag = Math.random();

    return $.ajax({
        url: "https://api.spotify.com/v1/me/player/pause",
        type: "PUT",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("pause song")
            document.querySelector("#pause").classList.add("hide");
            document.querySelector("#play").classList.remove("hide");
        },
        error: function(data) {

            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function play() {
    let tag = Math.random();

    return $.ajax({
        url: "https://api.spotify.com/v1/me/player/play",
        type: "PUT",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("play song")
            document.querySelector("#pause").classList.remove("hide");
            document.querySelector("#play").classList.add("hide");
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

//https://api.spotify.com/v1/me/tracks/contains?ids=5ojVq0bohB1uEEMga1IO3j
//https://api.spotify.com/v1/me/tracks/contains?ids=0ndGMh4twJNzPpr5XtHTR2

var currentSongIsSaved = false;

function isSaved() {
    tag = Math.random();
    console.log("Scope: " + scope);
    console.log(songObj['item']['album']['id'])
    console.log("https://api.spotify.com/v1/me/tracks/contains?ids=" + songObj['item']['id'])
    console.log(songObj)
    return $.ajax({
        url: "https://api.spotify.com/v1/me/tracks/contains?ids=" + songObj['item']['id'] + ",",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log(songObj['item']['name']);
            console.log("isSaved")
            console.log(data);

            currentSongIsSaved = data[0];
            if (data[0] == false) {
                console.log("not saved");
                if (document.getElementById("save").classList.contains("saved")) {
                    document.getElementById("save").classList.remove("saved")
                }
                if (document.getElementById("save").classList.contains("fas")) {
                    document.getElementById("save").classList.remove("fas")
                }
                document.getElementById("save").classList.add("far");
                document.getElementById("save").classList.add("notSaved");
                //  document.getElementById("save").classList.add("fa-heart");
            } else {
                console.log("saved");
                console.log(document.getElementById("save").style.color)
                if (document.getElementById("save").classList.contains("notSaved")) {
                    document.getElementById("save").classList.remove("notSaved")
                }
                if (document.getElementById("save").classList.contains("far")) {
                    document.getElementById("save").classList.remove("far")
                }
                document.getElementById("save").classList.add("saved");
                document.getElementById("save").classList.add("fas");
            }

        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

//Add or Remove new Song
function addRemove() {

    console.log("Song is saved? " + currentSongIsSaved)

    removeBodyTxt = `[\"${songObj['item']['id']}\"]`

    addBodyTxt = JSON.stringify(

        { ids: [`${songObj['item']['id']}`] }

    );
    if (currentSongIsSaved) { //Remove
        return $.ajax({
            url: "https://api.spotify.com/v1/me/tracks",
            type: "DELETE",
            data: removeBodyTxt,
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(data) {
                isSaved();
            },
            error: function(data) {
                console.log(data)
                console.log("Error on: " + tag);
                let wait = data.getResponseHeader('Retry-After')
                setTimeout(function() {
                    console.log("Waited " + wait + " resending " + tag);
                    $.ajax(this);
                }, wait);
            }
        })
    } else { //Save
        return $.ajax({
            url: "https://api.spotify.com/v1/me/tracks",
            type: "PUT",
            data: addBodyTxt,
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(data) {
                isSaved();
            },
            error: function(data) {
                console.log("Error on: " + tag);
                let wait = data.getResponseHeader('Retry-After')
                setTimeout(function() {
                    console.log("Waited " + wait + " resending " + tag);
                    $.ajax(this);
                }, wait);
            }
        })
    }
}

//https://api.spotify.com/v1/audio-features
function audioFeatures() {
    let tag = Math.random();

    return $.ajax({
        url: "https://api.spotify.com/v1/audio-features/?ids=" + songObj['item']['id'],
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log(data['audio_features'][0]['danceability'])
            move("#acousticnessBar", data['audio_features'][0]['acousticness'] * 100);
            move("#danceabilityBar", data['audio_features'][0]['danceability'] * 100);
            move("#energyBar", data['audio_features'][0]['energy'] * 100);
            //    move ("#loudnessBar",(60+data['audio_features'][0]['loudness'])*(10/6)*100);
            move("#instrumentalnessBar", data['audio_features'][0]['instrumentalness'] * 100);
            move("#livenessBar", data['audio_features'][0]['liveness'] * 100);
            move("#valenceBar", data['audio_features'][0]['valence'] * 100);
            //    move ("#tempoBar",data['audio_features'][0]['tempo']*100);
            move("#energyBar", data['audio_features'][0]['energy'] * 100);
            move("#speechinessBar", data['audio_features'][0]['speechiness'] * 100);

        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function getArtist() {
    let tag = Math.random();
    console.log(songObj)
    return $.ajax({
        url: "https://api.spotify.com/v1/artists/?ids=" + songObj['item']['album']['artists'][0]['id'],
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log(data['artists'])
            document.getElementById("artistName").innerHTML = data['artists'][0]['name'];
            document.getElementById("artistPhoto").src = data['artists'][0]['images'][0]['url'];
            document.getElementById("artistGenres").innerHTML = concatList(data['artists'][0]['genres']);
            document.getElementById("artistFollowers").innerHTML = `Followers: ${formatNumber(data['artists'][0]['followers']['total'])}`;
            move("#artistPopBar", data['artists'][0]['popularity']);
            getTopTracks();
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function getTopTracks() {
    return $.ajax({
        url: "https://api.spotify.com/v1/artists/" + songObj['item']['album']['artists'][0]['id'] + "/top-tracks?country=US",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("Top Songs")
            console.log(data)
                // Shuffle array
            updateTopTracks(data);

        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function getRelatedArtists() {
    return $.ajax({
        url: "https://api.spotify.com/v1/artists/" + songObj['item']['album']['artists'][0]['id'] + "/related-artists",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log(data)
                // Shuffle array
            updateRelatedArtists(data);

        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function playRandomTopTrack(artistId) {
    $.when(getTopTracksFromArtist(artistId)).done(function() {
        console.log(TopTracksofArtist)
        let rand = TopTracksofArtist['tracks'][Math.floor(Math.random() * TopTracksofArtist['tracks'].length)];
        $.when(getAlbumTracks(rand['album']['id'])).done(function() {
            playTrackFromAlbum(rand['id'], rand['album']['id']);
        });
    })
}

function playTrackFromAlbum(trackId, albumId) {
    let pos = 0;
    console.log(AlbumTracks)
    $.when(getAlbumTracks(albumId)).done(function() {
        console.log(AlbumTracks['items'].length + "# songs")
        for (let i = 0; AlbumTracks['items'].length; i++) {
            console.log(`Comparing: ${AlbumTracks['items'][i]['id']} and ${trackId} `)
            if (AlbumTracks['items'][i]['id'] == trackId) {
                console.log("match at position " + i)
                pos = i;
                AlbumTracks = {};

                body = JSON.stringify({
                    "context_uri": "spotify:album:" + albumId,
                    "offset": {
                        "position": pos
                    },
                    "position_ms": 0
                });

                return $.ajax({
                    url: "https://api.spotify.com/v1/me/player/play",
                    type: "PUT",
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    data: body,
                    success: function(data) {
                        console.log("play song")
                        document.querySelector("#pause").classList.remove("hide");
                        document.querySelector("#play").classList.add("hide");
                        AlbumTracks = {};
                    },
                    error: function(data) {
                        console.log("Error on: " + tag);
                        let wait = data.getResponseHeader('Retry-After')
                        setTimeout(function() {
                            console.log("Waited " + wait + " resending " + tag);
                            $.ajax(this);
                        }, wait);
                    }
                })


            }
        }
    })



}

var TopTracksofArtist = {};

function getTopTracksFromArtist(ArtistId) {
    return $.ajax({
        url: "https://api.spotify.com/v1/artists/" + ArtistId + "/top-tracks?country=US",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("Top Songs for " + ArtistId)
            console.log(data)
            TopTracksofArtist = data;
            // Shuffle array
            // updateTopTracks(data);
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}
var AlbumTracks = {};
var ArtistAlbums = {};

//Return all the albums
function getArtistsAlbums(ArtistId) {
    ArtistAlbums = {};
    $.ajax({
        url: "https://api.spotify.com/v1/artists/" + ArtistId + "/albums?include_groups=album",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            ArtistAlbums = data;
            console.log(ArtistAlbums)
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function getAlbumTracks(albumId) {
    return $.ajax({
        url: "https://api.spotify.com/v1/albums/" + albumId + "/tracks",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log(data)
            AlbumTracks = data;
        },
        error: function(data) {
            console.log("Error on: " + tag);
            let wait = data.getResponseHeader('Retry-After')
            setTimeout(function() {
                console.log("Waited " + wait + " resending " + tag);
                $.ajax(this);
            }, wait);
        }
    })
}

function getArtistBlurb() {

    let url = `https://open.spotify.com/artist/${songObj['item']['album']['artists'][0]['id']}/about`;

    let xhr = new XMLHttpRequest();

    // 2. Configure it: GET-request for the URL /article/.../load
    xhr.open('GET', "https://cors-anywhere.herokuapp.com/" + url);


    xhr.send();


    xhr.onload = function() {
        if (xhr.status != 200) {
            document.getElementById("artistBio").innerHTML="None Provided.";
        } else { // show the result
            var result = xhr.response.match(/(?<=Biography:\s+).*?(?=\s+Monthly Listeners:)/gs);
            result = result[0].slice(0, -1);
            console.log(result)

            if (result!="" || result==null || result == undefined){
                document.getElementById("artistBio").innerHTML = result
            }else{
                document.getElementById("artistBio").innerHTML="(None Provided to Spotify)";
                

            }
        }
    };


    xhr.onerror = function() {
        alert("Request failed");
    };

}


function playIcon() {
    document.querySelector("#pause").classList.remove("hide");
    document.querySelector("#play").classList.add("hide");
}

document.getElementById("nextSong").addEventListener("click", nextSong);
document.getElementById("lastSong").addEventListener("click", lastSong);
document.getElementById("play").addEventListener("click", play);
document.getElementById("pause").addEventListener("click", pause);
document.getElementById("save").addEventListener("click", addRemove);