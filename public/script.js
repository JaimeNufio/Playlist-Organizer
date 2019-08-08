//Playlists to scan, URI's pre cut
var knownPlaylists = [

];


var username;

//playlistJSON, just everything about all the playlists
var playlistJSON = null;

var openState = false;

function openList() {
    $("#playlistListList").show();
    console.log("open")

    if (!openState) {
        populate();
    } else {
        unpopulate();
    }
}


$('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
        // On-page links
        if (
            location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
            location.hostname == this.hostname
        ) {
            // Figure out element to scroll to
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000, function() {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                        $target.focus(); // Set focus again
                    };
                });
            }
        }
    });

function createNewPlaylistDiv(newPlaylist) {
    //console.log(knownPlaylists);
    //temp fix
    newDiv = `

    <div id="S${newPlaylist['uri'].substring(17)}" class="mt-3 col-6 col-md-3 overCard notInList">
    <div class="col-sm-12 Card" style="position:relative !important">
        <img id="Button_${newPlaylist['uri'].substring(17)}" ondblclick="dblc();" 
        onclick="addToPlaylist('${newPlaylist['uri'].substring(17)}')" style="z-index: 5;" class="innerCard albumArt" src="${newPlaylist["images"][0]['url']}">
    </div>

    <div class="playlistTitle" style="width:100%; margin:auto">${newPlaylist["name"]}</div>` +
        //<button type="btn" class="btn btn-danger" style="width:100%; height=50%; float:right; padding:auto">Remove</button>
        `</div>`;

    return newDiv;
}

//Inserts a div into the "Row" for the playlists
function addNewPlaylistDiv(i) {
    if (findByUri(knownPlaylists, playlistJSON['items'][i]['uri'].substring(14)) != null) {
        console.log("already exists in our list");
        return;
    } else {
        knownPlaylists.push(playlistJSON['items'][i]['uri'].substring(17));
    }

    // $("#playlistList").hide();

    if (playlistJSON['items'][i]['images'].length > 0) {
        document.querySelector("#playlistHolder").innerHTML = createNewPlaylistDiv(playlistJSON['items'][i]) +
            document.querySelector("#playlistHolder").innerHTML;
    }
    unpopulate();

}

//read the JSON, create objects as seen.
function populate() {

    console.log("playlistJSON")
    console.log(playlistJSON)

    if (playlistJSON != null) {
        getPlaylistTracks();
    }

    for (let i = 0; i < playlistJSON['items'].length; i++) {
        // console.log("collaborative: " + playlistJSON['items'][i]['collaborative'])
        // console.log("playlist owner: " + playlistJSON['items'][i]['owner']['id'])

        if (playlistJSON['items'][i]['owner']['id'] != username) {
            if (playlistJSON['items'][i]['collaborative'] == false) {
                continue;
            }
        }

        if (playlistJSON['items'][i]['images'].length > 0) {
            document.querySelector("#playlistListList").innerHTML +=
                `<li data-toggle="collapse" data-target="#disappear" class="list-group-item"
             onclick="addNewPlaylistDiv(${i})">
                <div class="smallSingleCoverLabel mr-2">
                    <img src="${playlistJSON['items'][i]['images'][0]['url']}">
                </div>
                <div class="pt-2" style="color:black;">
                    ${playlistJSON['items'][i]['name']}
                </div>
            </li>`;
        } else {
            document.querySelector("#playlistListList").innerHTML +=
                `<li data-toggle="collapse" data-target="#disappear" class="list-group-item"
         onclick="addNewPlaylistDiv(${i})">
            <div class="smallSingleCoverLabel mr-2">
                <img src="https://mattymacchiato.com/wp-content/uploads/2019/02/spotify-logo.png">
            </div>
            <div class="pt-2" style="color:black;">
                ${playlistJSON['items'][i]['name']}
            </div>
        </li>`;
        }
        // `<li onclick="addNewPlaylistDiv(${i})" class="list-group-item">${playlistJSON['items'][i]['name']}</li>`;
    }
    //document.body.scrollTop = document.documentElement.scrollTop = 0;
    openState = true;
}

function unpopulate() {
    document.querySelector("#playlistListList").innerHTML = "";
    openState = false;
}

//let objArray be an array of objects
//searching for uid
function findByUri(objArray, id) {
    for (let i = 0; i < objArray.length; i++) {
        if (objArray[i] == id) {
            console.log("Exists!");
            return objArray[i];
        }
    }
    return null;
}

function AinB(item, Arr) {
    for (let i = 0; i < Arr.length; i++) {
        if (Arr[i] == item) {
            return true;
        }
    }
    return false;
}

function removeFromPlaylistList() {
    console.log("remove");
}

function addToPlaylist(playlistUri) {
    console.log(`Button_${playlistUri}`);
    //console.log(songObj['item']['uri'].substring(17) + "and" + playlistUri)

    if (document.querySelector(`#S${playlistUri}`).classList.contains("notInList")) {
        console.log("Add song");
        addSongFromPlaylist(songObj['item']['uri'].substring(14), playlistUri);
    } else if (document.querySelector(`#S${playlistUri}`).classList.contains("inList")) {
        console.log("Remove the song");
        removeSongFromPlaylist(songObj['item']['uri'].substring(14), playlistUri);
    }
    getPlaylistTracks()
}

function dblc() {
    console.log("Double click");
}

function checkIfSongInPlaylist() {

    //playlistOrder

    /*
        console.log("knownPlaylists members")
        console.log(knownPlaylists)
        console.log("playlistOrder members")
        console.log(Object.keys(playlistOrder));
    */

    // console.log(songObj['item']['name'] + ":" + songObj['item']['uri'].substring(14))

    //for each playlist uri
    for (let i = 0; i < Object.keys(playlistOrder).length; i++) {


        if (!AinB(Object.keys(playlistOrder)[i], knownPlaylists)) {
            //console.log(`${Object.keys(playlistOrder)[i]} not in`)
            // console.log(knownPlaylists)
            continue;
        }

        //for each song in that playlist
        for (let j = 0; j < playlistOrder[Object.keys(playlistOrder)[i]].length; j++) {

            // console.log(`Checking Song: ${playlistOrder[Object.keys(playlistOrder)[i]][j]} against ${songObj['item']['uri'].substring(14)}`)
            // console.log(playlistOrder[Object.keys(playlistOrder)[i]])
            /*   console.log("knownPlaylists")
               console.log(knownPlaylists);
               console.log("Playlist Checking This Round")
               console.log(Object.keys(playlistOrder)[i])
               console.log("Playlist holds:") */
            //console.log(playlistOrder[Object.keys(playlistOrder)[i]])

            let current = "S" + Object.keys(playlistOrder)[i];
            //!isNaN(Object.keys(playlistOrder)[i].substring(0, 1)) ?
            //"S" + Object.keys(playlistOrder)[i] + " " : Object.keys(playlistOrder)[i];
            //console.log(current);
            if (playlistOrder[Object.keys(playlistOrder)[i]][j] == songObj['item']['uri'].substring(14)) {
                // console.log(playlistOrder[Object.keys(playlistOrder)[i]][j] + " is " +
                //     songObj['item']['uri'])
                document.querySelector(`#${current}`).classList.remove("notInList");
                document.querySelector(`#${current}`).classList.add("inList");
                break;
            } else {
                // console.log(playlistOrder[Object.keys(playlistOrder)[i]][j] + " not " +
                //     songObj['item']['uri'].substring(14))
                // console.log("Songs are: ")
                // console.log(playlistOrder[Object.keys(playlistOrder)[i]])
                document.querySelector(`#${current}`).classList.remove("inList");
                document.querySelector(`#${current}`).classList.add("notInList");
            }
        }
    }
}


//----------------------------------------------------------------
// JQUERY
//----------------------------------------------------------------



function transition(id) {
    $(id).fadeOut(500, function() {
        $(this).attr("src", "http://1.static.s-trojmiasto.pl/zdj/c/2/132/100x70/1320882__kr.jpg");
        $(this).load(function() {
            $(this).fadeIn(500);
        });
    });
}

// Author:  Jacek Becela
// Source:  http://gist.github.com/399624
// License: MIT

jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
    return this.each(function() {
        var clicks = 0,
            self = this;
        jQuery(this).click(function(event) {
            clicks++;
            if (clicks == 1) {
                setTimeout(function() {
                    if (clicks == 1) {
                        single_click_callback.call(self, event);
                    } else {
                        double_click_callback.call(self, event);
                    }
                    clicks = 0;
                }, timeout || 300);
            }
        });
    });
}