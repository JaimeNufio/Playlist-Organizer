//Playlists to scan, URI's pre cut
var knownPlaylists = [

];


var username;

//playlistJSON, just everything about all the playlists
var playlistJSON = null;
var openState = false;

/*
function openList() {
    $("#playlistListList").show();
    //  console.log("open")

    if (!openState) {
        populate();
    } else {
        unpopulate();
    }
}
*/

function createNewPlaylistDiv(newPlaylist) {

    $("#populated").collapse('hide');


    //console.log(knownPlaylists);
    //temp fix
    //    console.log(newPlaylist);
    console.log("close populated")

    let newDiv = "";

    if (newPlaylist['images'].length > 0) {
        newDiv = `
        <div id="Div_${newPlaylist['uri'].substring(17)}" class="mt-3 col-6 col-md-3 overCard notInList">
        <div class="col-sm-12 Card" style="position:relative !important">
            <img id="Button_${newPlaylist['uri'].substring(17)}" ondblclick="dblc();"
            onclick="actionToPlaylist('${newPlaylist['uri'].substring(17)}')" style="z-index: 5;" class="innerCard albumArt" src="${newPlaylist["images"][0]['url']}">
        </div>
        <div id="Name_${newPlaylist['uri'].substring(17)}" class="playlistTitle" style="width:100%; margin:auto">${newPlaylist["name"]}</div>` +
            //<button type="btn" class="btn btn-danger" style="width:100%; height=50%; float:right; padding:auto">Remove</button>
            `</div>`;
    } else {
        newDiv = `
        <div id="Div_${newPlaylist['uri'].substring(17)}" class="mt-3 col-6 col-md-3 overCard notInList">
        <div class="col-sm-12 Card" style="position:relative !important">
            <img id="Button_${newPlaylist['uri'].substring(17)}" ondblclick="dblc();"
            onclick="actionToPlaylist('${newPlaylist['uri'].substring(17)}')" style="z-index: 5;" class="innerCard albumArt" src="https://mattymacchiato.com/wp-content/uploads/2019/02/spotify-logo.png">
        </div>

        <div class="playlistTitle" style="width:100%; margin:auto">${newPlaylist["name"]}</div>` +
            //<button type="btn" class="btn btn-danger" style="width:100%; height=50%; float:right; padding:auto">Remove</button>
            `</div>`;
    }
    updateSinglePlaylist(newPlaylist['id']);
    updateSingePlaylistNameArt(newPlaylist['id']);

    return newDiv;
}

//Inserts a div into the "Row" for the playlists
function addNewPlaylistDiv(i) {

    if (document.getElementById("activePlaylists").classList.contains("displayNone")){
        document.getElementById("activePlaylists").classList.remove("displayNone");
    }
    document.getElementById("PLBox_"+i).remove();
     console.log(knownPlaylists)

    //   console.log(knownPlaylists)
    //   console.log(playlistJSON['items'][i]['uri'].substring(17))


    if (findByUri(knownPlaylists, playlistJSON['items'][i]['id']) != null) {
        //     console.log("already exists in our list");
        return;
    } else {
        if (playlistJSON['items'][i]['owner']['id'] != username){
            console.log(`User doesn't own ${playlistJSON['items'][i]['name']}, skipping.`);
            return;

        }
        console.log("Added Playlist")
        knownPlaylists.push(playlistJSON['items'][i]['id']);
    }

    // $("#playlistList").hide();

    // if (playlistJSON['items'][i]['images'].length > 0) {
    document.querySelector("#playlistHolder").innerHTML = createNewPlaylistDiv(playlistJSON['items'][i]) +
        document.querySelector("#playlistHolder").innerHTML;

}

//read the JSON, create objects as seen.
function populate() {
    unpopulate();
    $.when(getPlaylistURIs()).done(function() {
        if (playlistJSON != null) {}
        if (songObj != null) {
            checkIfSongInPlaylist();
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
                document.querySelector("#playlistListList").innerHTML += `
                <div class="row" onclick="addNewPlaylistDiv(${i})">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-2  my-auto">
                                    <img id="" class="smallSingleCoverLabel my-auto" src="${playlistJSON['items'][i]['images'][0]['url']}" alt="sans" width="200px">
                                </div>
                                <div class="col-10 my-auto">
                                    <p id="" style="float:left; color:black" class="pl-4 card-title my-auto"> ${playlistJSON['items'][i]['name']}</p>
                                </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            } else {
                document.querySelector("#playlistListList").innerHTML += `
                <div class="row" onclick="addNewPlaylistDiv(${i})">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-2  my-auto">
                                    <img id="" class="smallSingleCoverLabel my-auto" src="https://mattymacchiato.com/wp-content/uploads/2019/02/spotify-logo.png" alt="sans" width="200px">
                                </div>
                                <div class="col-10 my-auto">
                                    <p id="" style="float:left; color:black" class="pl-4 card-title my-auto"> ${playlistJSON['items'][i]['name']}</p>
                                </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            }


            /* document.querySelector("#playlistListList").innerHTML +=
                    `<li   class="list-group-item"
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
                    `<li  class="list-group-item"
            onclick="addNewPlaylistDiv(${i})">
            <div class="smallSingleCoverLabel mr-2">
                <img src="https://mattymacchiato.com/wp-content/uploads/2019/02/spotify-logo.png">
            </div>
            <div class="pt-2" style="color:black;">
                ${playlistJSON['items'][i]['name']}
            </div>
        </li>`;*/

            // `<li onclick="addNewPlaylistDiv(${i})" class="list-group-item">${playlistJSON['items'][i]['name']}</li>`;
        };
        $("#populated").collapse('hide');
        // document.querySelector("#makePlaylistTitle").innerHTML = (`Create Playlist from: "${songObj['item']['name']}"`);
    });
}

function trueUnpopulate() {
    $("#populated").collapse('hide');
    document.querySelector("#playlistListList").innerHTML = "";
}

function unpopulate() {
    //populate's target 

    if (shouldShowCreateOption) {
        /*
        document.querySelector("#playlistListList").innerHTML =
            `<div id="makePlaylist" class="row" onclick="createPlaylist()">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-2  my-auto">
                                    <img id="playlistMakerImg" class="smallSingleCoverLabel my-auto" src="${songObj['item']['album']['images'][0]['url']}" alt="sans" width="200px">
                                </div>
                                <div class="col-10 my-auto">
                                    <p id="pmakePlaylistTitle" style="float:left; color:black" class="pl-4 card-title my-auto">Create Playlist from: "${songObj['item']['name']}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
            */
    }
    /*
    `
        <li class="list-group-item p-0"
        onclick="">
            <div class=flex-row flex-wrap">
                <div class="smallSingleCoverLabel p-2">
                    <img class="" id="playlistMakerImg" src="${songObj['item']['album']['images'][0]['url']}">
                </div>
                <div id="playlistMaker" class="pt-2" style="color:black;">
                </div>   
            </div>
        </li>
     `
     */
    //must be blanked out, but we may as well add the button to create the playlist
}

//let objArray be an array of objects
//searching for uid
function findByUri(objArray, id) {
    for (let i = 0; i < objArray.length; i++) {
        if (objArray[i] == id) {
            //       console.log("Exists!");
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
    // console.log("remove");
}

//ClickHandler For each PlaylistDiv
function actionToPlaylist(playlistUri) {
    // console.log(`Button_${playlistUri}`);

    if (songObj == null || songObj['item'] == null) {
        //   console.log("No song is playing.");
        return;
    } else {
        //   console.log(songObj['item']['name'])
    }

    $.when(spotGetTracks(playlistUri, 0).done(function(data) {
        // console.log(spotTrackSet);
        // console.log(songObj['item']['uri'].substring(14))
        if (AinB(songObj['item']['uri'].substring(14), spotTrackSet)) {
            //   console.log("This playlist contains the song already.")
            removeSongFromPlaylist(songObj['item']['uri'].substring(14), playlistUri);

        } else {
            //   console.log("This playlist does not contain the song already.")
            addSongFromPlaylist(songObj['item']['uri'].substring(14), playlistUri);

        }
    }))
}

function updateSingePlaylistNameArt(playlistURI) {

    if (songObj == null) {
        //    console.log("No song is playing.");
        return;
    } else {
        //  console.log(songObj['item']['name'])
    }

    $.when(spotGetPlaylistInfo(playlistURI).done(function(data) {
        //  console.log(data);
        document.querySelector(`#Name_${playlistURI}`).innerHTML = data['name'];
        document.querySelector(`#Button_${playlistURI}`).src = data['images'][0]['url'];
    }));
}


function updateSinglePlaylist(playlistUri) {
    // console.log(`Button_${playlistUri}`);

    if (songObj == null) {
        //   console.log("No song is playing.");
        return;
    } else {
        // console.log(songObj['item']['name'])
    }

    $.when(spotGetTracks(playlistUri, 0).done(function(data) {
        // console.log(spotTrackSet);

        songObj['item']['album']

        //  console.log(songObj['item']['uri'].substring(14))
        if (AinB(songObj['item']['uri'].substring(14), spotTrackSet)) {
            //    console.log("This playlist contains the song already.")

            // removeSongFromPlaylist(songObj['item']['uri'].substring(14), playlistUri);
            if (document.querySelector(`#Div_${playlistUri}`).classList.contains("notInList")) {
                document.querySelector(`#Div_${playlistUri}`).classList.remove("notInList");
            }
            if (!document.querySelector(`#Div_${playlistUri}`).classList.contains("inList")) {
                document.querySelector(`#Div_${playlistUri}`).classList.add("inList");
            }


        } else {
            //   addSongFromPlaylist(songObj['item']['uri'].substring(14), playlistUri);
            //  console.log("This playlist does not contain the song already.")

            if (document.querySelector(`#Div_${playlistUri}`).classList.contains("inList")) {
                document.querySelector(`#Div_${playlistUri}`).classList.remove("inList");
            }
            if (!document.querySelector(`#Div_${playlistUri}`).classList.contains("notInList")) {
                document.querySelector(`#Div_${playlistUri}`).classList.add("notInList");
            }

        }
        spotTrackSet = [];
    }))
}


function dblc() {
    //console.log("Double click");
}

//uri is song uri
function checkIfSongInPlaylist(uri) {
    //console.log(uri)
    if (uri == null || uri == undefined) {
        //console.log("replacing with: " + songObj['item']['uri'].substring(14))
        uri = songObj['item']['uri'].substring(14)
    }

    // console.log("Scan all playlists")

    //for each known playlist

    for (let i = 0; i < knownPlaylists.length; i++) {
        //Collect all of a playlist's tracks in trackSet, wait for it tho.
        $.when(getTracks(knownPlaylists[i], 0).done(function(data) {

            //       console.log(data)
            // console.log(trackSet[j])
            let found = false;
            //for each track in trackSet
            for (let j = 0; j < trackSet.length; j++) {
                //only if the track count equals the expected number of tracks
                if (trackCount == trackSet.length) {
                    //turn on, if we can, don't turn off though.
                    if (trackSet[j] == uri) {
                        found = true;
                        console.log('FOUND!!')

                        break;
                    } else {
                        //   document.querySelector(`#Div_${knownPlaylists[i]}`).classList.remove("inList");
                        //  document.querySelector(`#Div_${knownPlaylists[i]}`).classList.add("notInList");
                    }
                } else {
                    break;
                }
            }
            //reset counter
            if (!found) {
                //         console.log("not found")

            }
        }))

        trackCount = 0;
        trackSet = [];
    }
}


function move(elem, target) {

    target = Math.floor(target);
    console.log(`set ${elem} to ${target}`);

    //$(elem).css('background-color', 'hsl(' + target * 2 + ', "100%","80%") !important;');
    // console.log($(elem).attr("background-color"))
    $(elem).val(target);
    console.log((elem.substring(0, elem.length - 3) + "Percent"));
    try {
        document.getElementById(elem.substring(1, elem.length - 3) + "Percent").innerHTML = (target + "%");
    } catch (e) {
        console.log(e)
    }
}

/*
function changeMode(mode) {

    if (username == undefined || username == "" || username == null) {
        console.log("not logged in.");
        return;
    }

    console.log("Mode: " + mode);

    if (mode == "playlistOrganizer") {
        $("#playlistsView").show();
        $("#playlistList").show();
        $("#playlistListList").show();
      //  $("#playlistOrganizer").show();

        $("#songInfo").hide();
    } else if (mode == "songFeatures") {
        $("#playlistsView").hide();
        $("#playlistList").hide();
        $("#playlistListList").hide();
      //  $("#playlistOrganizer").hide();

        $("#songInfo").show();
    }
}*/

function updateTopTracks(data) {
    const shuffled = data['tracks'].sort(() => 0.5 - Math.random());

    // Get sub-array of first n elements after shuffled
    let selected = shuffled.slice(0, 4);

    document.getElementById("topTrackDump").innerHTML = "";
    for (let i = 0; i < selected.length; i++) {
        document.getElementById("topTrackDump").innerHTML += createTopTrack(selected[i]);
    }
}

function updateRelatedArtists(data) {
    const shuffled = data['artists'].sort(() => 0.5 - Math.random());

    // Get sub-array of first n elements after shuffled
    let selected = shuffled.slice(0, 4);

    document.getElementById("relatedArtistDump").innerHTML = "";
    for (let i = 0; i < selected.length; i++) {
        document.getElementById("relatedArtistDump").innerHTML += createRelatedArtist(selected[i]);
    }
}

function createTopTrack(track) {
    return `<div class="col-6 col-md-3 col-lg-3 mb-2 mt-2" onclick="playTrackFromAlbum('${track['id']}','${track['album']['id']}')">
    <div class="card matchBackground">
        <div class="card-body blackText p-0 mb-0">
            <img class="card-img-top" style="border-radius: 20px" src="${track['album']['images'][0]['url']}" alt="...">
            <div class="card-body pb-0 mb-0 pt-1">
                <div>
                    <p class="text-center card-text pt-1 mb-0 ">${track['name']}</p>
                </div>
                <p class="text-center text-muted card-text pt-0 ellipsis">
                    ${track['album']['name']}
                </p>
            </div>
        </div>
    </div>
</div>`;
}

function createRelatedArtist(artist) {
    return `<div class="col-6 col-sm-6 col-md-3 col-lg-3 mb-2 mt-2" onclick="playRandomTopTrack('${artist['id']}','artist')">
    <div class="card matchBackground">
        <div class="card-body blackText p-0 mb-0">
            <img class="card-img-top" style="border-radius: 20px" src="${artist['images'][0]['url']}" alt="...">
            <div class="card-body pb-0 mb-0 pt-1">
                <div>
                    <p class="text-center card-text pt-1 mb-0 ">${artist['name']}</p>
                </div>
            </div>
        </div>
    </div>
</div>`;

}


function concatList(list) {
    let out = "";


    for (let i = 0; i < list.length; i++) {
        if (i < list.length && i != 0) {
            out += ", "
        }
        out += list[i];
    }
    out = out.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');

    return out;
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

$(document).ready(
    function() {
        $("#populateToggle").click(function() {
            console.log("toggle")
            $("#populate").collapse('toggle');
        });
    })

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

function HideTip() {
    $("#tips").fadeOut();
}

document.getElementById("tips").addEventListener("click", HideTip);


//** New Era **//


function load(msg, where, id) {
    document.getElementById(where).innerHTML = ` <div id="${id}" class="loadingFrame container">
    <div class="text-center" style="width:100%; font-size: 2em">
        <i class="fas fa-spinner fa-spin"></i>
        <div class="loadingMessage" style="font-size: .5em">${msg}</div>
    </div>
</div>`
}

function loadAppend(msg, where, id) {
    document.getElementById(where).innerHTML += ` <div id="${id}" class="loadingFrame container">
    <div class="text-center" style="width:100%; font-size: 2em">
        <i class="fas fa-spinner fa-spin"></i>
        <div class="loadingMessage" style="font-size: .5em">${msg}</div>
    </div>
</div>`
}


function stopLoad(id) {
    if (document.getElementById(id) != null) {
        document.getElementById(id).remove();
    }
}

function assemblePlaylistBox(playlist, i,ith) {
    return `<div id="PLBox_${i}" class="card mr-3 ${i}" onclick="addNewPlaylistDiv(${ith})">
    <img class="selectImg" src="${playlist['images'].length!=0?playlist['images'][0]['url']:'https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png'}">
    <div class="albumTitle text-left pl-2 pr-2 pt-1">
        ${playlist['name']}
    </div> 
    </div>`
}

function addMorePlaylists() {
    load("Loading Playlists...", "userPlaylistFrame", "playlistLoadFrame");
    $.when(getPlaylists()).done(function() {
        assemblePlaylistRow();
    });

}

function assemblePlaylistRow() {
    load("Loading Playlists...", "playlistListFrameBoxes", "playlistLoadFrame");
    for (let i = 0; i < playlistJSONNew.length; i++) {
        if (playlistJSONNew[i]['owner']['id'] != username){
            console.log(`User doesn't own ${playlistJSONNew[i]['name']}, skipping.`);
            continue;
        }else{
            console.log(playlistJSONNew[i]);
            document.getElementById("playlistListFrameBoxes").innerHTML += assemblePlaylistBox(playlistJSONNew[i], i,i);
        }
    }

    stopLoad("playlistLoadFrame");

    /* Add 50 more...
    console.log(`${playlistJSONNew.length}|${playlistNumber}`);
    if (playlistJSONNew.length < playlistNumber) {
        document.getElementById("playlistListFrameBoxes").innerHTML +=
            `<div class="card mr-3" onclick="addMorePlaylists()">
        <img class="selectImg" src="${'https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png'}">
        <div class="albumTitle">
            Get 50 more
        </div> 
    </div>`;
    }
    */
}

function contains(arr, element) {
    for (let i = 0; i < arr.length; i++) {
        //  console.log(i);
        if (arr[i] == element) {
            return i;
        }
    }
    return -1;
}


////////Nav Control//////////

views = ['playlistOrganizer','artistInfo','songInfo'];
function showHide(showThis){
    console.log(`Show Goal: #${showThis}`)
    for (let i = 0;i<views.length;i++){
        console.log(`hiding #${views[i]}`);
        $("#"+views[i]).hide();
        //$("#"+views[i]).hide("slide", { direction: "left" }, 1200);
    }
    $("#"+showThis).show();
    //$("#"+showThis).delay(400).show("slide", { direction: "left" }, 1200);
}

//////////////////

//* JQUERY *//

$( document ).ready(function() {
    for (let i = 1;i<views.length;i++){
        console.log(`hiding #${views[i]}`);
        $("#"+views[i]).hide();
        //$("#"+views[i]).hide("slide", { direction: "left" }, 1200);
    }
    console.log("showing: "+views[0]);
    $("#"+views[0]).show();
    
});
