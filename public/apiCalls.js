console.log("test")

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


//Get Current Song
var songObj = null;
setInterval(function() {

    if (songObj == null && advicehide == true) {
        console.log("Show advice")
        $("#playSomething").show();
    } else {
        console.log("Hide advice")
        $("#playSomething").hide();
    }

    if (loggedIn) {
        $.ajax({
            url: "https://api.spotify.com/v1/me/player/currently-playing",
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(data) {

                if (data == undefined || data == null) {
                    $("#sticky-footer").hide();
                    return;
                }

                if (songObj == null || data['item']['uri'] != songObj['item']['uri']) {
                    if (songObj != null) {
                        console.log("not null");
                        console.log(data['item']['name'] + " vs " + songObj['item']['name']);
                    } else {
                        songObj = data;
                        wasNull = true;
                    }
                }
                //update Song
                if (data != null && songObj != null && songObj != undefined && data['item']['uri'] != songObj['item']['uri'] || wasNull) {
                    wasNull = false;
                    songObj = data;

                    console.log("SongObj")
                    console.log(songObj)

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
                        console.log("Don't Scroll.")
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
                        console.log("Don't Scroll.")
                        document.querySelector("#currentArtist").classList.remove("go");
                    }

                    $("#currentArt").attr("src", songObj['item']['album']['images'][0]["url"]);
                    //   checkIfSongInPlaylist();
                }
            }
        });
    }

}, 500);


//Check Playlists

setInterval(function() {
    //   getAlbumObj();
    if (songObj != null) {
        //  checkIfSongInPlaylist();
        //  console.log("beep.")
        for (let i = 0; i < knownPlaylists.length; i++) {
            updateSinglePlaylist(knownPlaylists[i])
        }
    }
}, 2000)


function removeSongFromPlaylist(songURI, playlistURI) {

    bodyTxt = JSON.stringify({ "tracks": [{ "uri": "spotify:track:" + songURI }] })
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistURI}/tracks`,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + access_token,
        },
        data: bodyTxt,
        success: function(data) {
            console.log("Should have removed the song?")
            checkIfSongInPlaylist();
        },

    });
}

function addSongFromPlaylist(songURI, playlistURI) {
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${playlistURI}/tracks?uris=spotify:track:${songURI}`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + access_token,

        },
        //data: { "tracks": [{ "uri": `spotify:track:${songURI}` }] },
        success: function(data) {
            console.log("Should have added the song?")
                // checkIfSongInPlaylist();
        }
    });
}

//update playlistJSON to the JSON object of the playlists, support only the last 50.
//TODO support more than 50.
function getPlaylistURIs() {

    $.ajax({
        url: "https://api.spotify.com/v1/me/playlists?limit=50",
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log(data)
            playlistJSON = (data);
        }
    });
}


//A list of URIs inside the playlist
var trackSet = [];
var trackCount = 0;

function getTracks(uri, offset) {

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
        },
    });
}

//Method for an individual Check of tracks.
var spotTrackSet = [];
var spotTrackCount = 0;

function spotGetTracks(uri, offset) {
    spotTrackSet = [];
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
    });
}

albumObj = {};


function getArtistObj() {

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
            console.log(data)
            albumObj = data;
        }
    })
}