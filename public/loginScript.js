$("#LoginPage").hide();
$("#user").hide();
$("#playlistsView").hide();
$("#playlistList").hide();
$("#sticky-footer").hide();

var stateKey = 'spotify_auth_state';
var loggedIn = false;
var currentSong = null;
var scope =
"playlist-read-private " +
"user-read-currently-playing " +
"user-read-playback-state " +
"playlist-modify-public " +
"playlist-modify-private "+
"user-modify-playback-state "+
"user-library-read "+
"user-library-modify ";


var online = "http://playlists.wezlalabs.com/";
var localHost = "http://localhost:5000" //"http://localhost:5000"

var client_id = 'e01d706bd59d491cba77787afa5a9bce'; // Your client id
var redirect_uri = localHost;

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

/*
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
var params = getHashParams();

var access_token = params.access_token,
    state = params.state,
    storedState = localStorage.getItem(stateKey);

if (access_token && (state == null || state !== storedState)) {
    alert('There was an error during the authentication');
} else {
    localStorage.removeItem(stateKey);
    if (access_token) {
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {

                console.log("logged in.");
                console.log(response)
                loggedIn = true;
                $("#username").html(response['display_name']);
                $("#pfp").attr("src",response['images'][0]['url']);
                $("#loginPage").hide();
                $("#playlistsView").show();
                $("#playlistList").show();
                $("#playlistListList").show();
                $("#sticky-footer").hide();
                $("#user").show();
                username = response['id'];

                getPlaylistURIs();

            }
        });
    } else {
        console.log("Not Logged in");

    }


    //Login with Spotify
    document.getElementById('loginButton').addEventListener('click', function() {


            //'http://www.spotifystats.com/'; // Your redirect uri

        var state = generateRandomString(16);

        localStorage.setItem(stateKey, state);

        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        url += '&scope=' + encodeURIComponent(scope);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
        url += '&state=' + encodeURIComponent(state);
        window.location = url;
    }, false);


}
