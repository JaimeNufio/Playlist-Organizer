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


//getplaylistTracks will populate this with URI objects
var playlistOrder = {};

function getPlaylistTracks() {

    let next = "";
    //For each playlist, retrieve tracks
    for (let i = 0; i < playlistJSON['items'].length; i++) {
        setTimeout(function() {
                let offset = 0;
                let tempData = null;
                let tempArray = [];

                //lets get the total for some math.
                try {
                    $.ajax({
                        url: `https://api.spotify.com/v1/playlists/${playlistJSON['items'][i]['uri'].substring(17)}/tracks?offset=${offset*100}&limit=100`,
                        type: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        success: function(data) {
                            tempData = data;
                            for (let j = 0; j < data['items'].length; j++) {
                                //  console.log(data['items'][j]['track']['name']);
                                tempArray.push(data['items'][j]['track']['uri'].substring(14));
                            }

                            // If more, do the rest.
                            if (tempData['total'] > 100) {
                                for (let j = 0; j < (tempData['total'] / 100); j++) {
                                    setTimeout(function() {
                                        offset++;
                                        $.ajax({
                                            url: `https://api.spotify.com/v1/playlists/${playlistJSON['items'][i]['uri'].substring(17)}/tracks?offset=${offset*100}&limit=100`,
                                            type: 'GET',
                                            headers: {
                                                'Authorization': 'Bearer ' + access_token
                                            },
                                            success: function(data) {
                                                tempData = data;
                                                //   console.log(data)
                                                for (let j = 0; j < data['items'].length; j++) {
                                                    //  console.log(data['items'][j]['track']['name']);
                                                    tempArray.push(data['items'][j]['track']['uri']);
                                                }
                                            }
                                        });
                                    }, 1000);
                                }
                            }

                            playlistOrder[data['href'].substring(37, 59)] = (tempArray);

                        }
                    });
                } catch (e) {
                    console.log("Get PlaylistTrack failure");
                } finally {

                }
            }
            //console.log("PlaylistOrder: ")
            //console.log(playlistOrder)
        }

        setInterval(function() {
            if (songObj != null) {
                // getPlaylistTracks();
                console.log("INTERVAL: Checking for " + songObj['item']['uri'].substring(14))
                checkIfSongInPlaylist()
                    // getPlaylistTracks()
            }
        }, 1000)

        setInterval(function() {
            getPlaylistTracks()
        }, 5000)

        var songObj = null;
        setInterval(function() {
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

                            checkIfSongInPlaylist(songObj['item']['uri'])
                            $("#currentArtist").html(artists);
                            if (artists.length > cap) {
                                document.querySelector("#currentArtist").classList.add("go")
                            } else {
                                console.log("Don't Scroll.")
                                document.querySelector("#currentArtist").classList.remove("go");
                            }

                            $("#currentArt").attr("src", songObj['item']['album']['images'][0]["url"]);
                        }
                    }
                });
            }

        }, 1000);

        function removeSongFromPlaylist(songURI, playlistURI) {
            //https://api.spotify.com/v1/playlists/{playlist_id}/tracks
            $.ajax({
                url: `https://api.spotify.com/v1/playlists/${playlistURI}/tracks?uris=spotify:track:${songURI}`,
                type: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(data) {
                    console.log("Should have removed the song?")
                }
            });
        }

        function addSongFromPlaylist(songURI, playlistURI) {
            console.log(songURI)
            console.log(playlistURI)
            $.ajax({
                url: `https://api.spotify.com/v1/playlists/${playlistURI}/tracks?uris=spotify:track:${songURI}`,
                type: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    /*  data: {
                          "tracks": [{
                              "uri": `spotify:track:${songURI}`,
                          }]
                      },*/
                },
                success: function(data) {
                    console.log("Should have added the song?")
                }
            });
        }




        //Call On Start?