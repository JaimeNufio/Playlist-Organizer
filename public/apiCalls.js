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
                if (wasNull || songObj['item']['uri'] != data['item']['uri']){//data != null && songObj != null && songObj != undefined && data['item']['uri'] != songObj['item']['uri'] || wasNull) {
                    wasNull = false;
                    songObj = data;
                  //console.log("Updating song");

                  //console.log("SongObj")
                  //console.log(songObj)

                    playIcon();
                    isSaved();
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
                }
            },
            error: function(err){
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
        }
        ,error: function(data){
            console.log("ERROR REMOVE SONG")
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            $.ajax(this);
          },wait);
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
        }
        ,error: function(data){
          console.log("ERROR ADD SONG")
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            $.ajax(this);
          },wait);
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
        }
        //retry
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
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
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
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
        }
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
        }
    });
}

function spotGetPlaylistInfo(uri){
    let tag = Math.random();
    return $.ajax({
        url: `https://api.spotify.com/v1/playlists/${uri}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
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
        }
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
        }
    })
}

function nextSong(){
    let tag=Math.random();
    return $.ajax({
        url:"https://api.spotify.com/v1/me/player/next",
        type:"POST",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("next song")
            play();
        }
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
        }
    })
}

function lastSong(){
    let tag=Math.random();

    return $.ajax({
        url:"https://api.spotify.com/v1/me/player/previous",
        type:"POST",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("last song")
            playIcon();
        }
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
        }
    })
}
//https://api.spotify.com/v1/me/player/pause
function pause(){
    let tag=Math.random();

    return $.ajax({
        url:"https://api.spotify.com/v1/me/player/pause",
        type:"PUT",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("pause song")
            document.querySelector("#pause").classList.add("hide");
            document.querySelector("#play").classList.remove("hide");
        }
        ,error: function(data){

          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
        }
    })
}

function play(){
    let tag=Math.random();

    return $.ajax({
        url:"https://api.spotify.com/v1/me/player/play",
        type:"PUT",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log("play song")
            document.querySelector("#pause").classList.remove("hide");
            document.querySelector("#play").classList.add("hide");
        }
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
        }
    })
}

function isSaved(){
    tag = Math.random();
    console.log("https://api.spotify.com/v1/me/albums/contains?ids="+songObj['item']['album']['id'])
    console.log(songObj)
    return $.ajax({
        url:"https://api.spotify.com/v1/me/albums/contains?ids="+songObj['item']['album']['id']+",",
        type:"GET",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(data) {
            console.log(songObj['item']['name']);
            console.log("isSaved")
            console.log(data);

            if (data[0]==false){
                console.log("not saved");
                if (document.getElementById("save").classList.contains("saved")){
                    document.getElementById("save").classList.remove("saved")
                }
                document.getElementById("save").classList.add("notSaved");
            }else{
                console.log("saved");
                console.log(document.getElementById("save").style.color)
                if (document.getElementById("save").classList.contains("notSaved")){
                    document.getElementById("save").classList.remove("notSaved")
                }
                document.getElementById("save").classList.add("saved");
            }

        }
        ,error: function(data){
          console.log("Error on: "+tag);
          let wait = data.getResponseHeader('Retry-After')
          setTimeout(function() {
            console.log("Waited "+wait+" resending "+tag);
            $.ajax(this);
          },wait);
        }
    })
}

function playIcon(){
    document.querySelector("#pause").classList.remove("hide");
    document.querySelector("#play").classList.add("hide");
}

document.getElementById("nextSong").addEventListener("click",nextSong);
document.getElementById("lastSong").addEventListener("click",lastSong);
document.getElementById("play").addEventListener("click",play);
document.getElementById("pause").addEventListener("click",pause);
document.getElementById("save").addEventListener("click",isSaved)
