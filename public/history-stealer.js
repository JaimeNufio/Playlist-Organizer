(function(window, location) {
    history.replaceState(null, document.title, location.pathname + "#!/history");
    history.pushState(null, document.title, location.pathname);

    window.addEventListener("popstate", function() {
        if (location.hash === "#!/history") {
            history.replaceState(null, document.title, location.pathname);
            setTimeout(function() {
                location.replace("http://playlists.WezlaLabs.com");
            }, 0);
        }
    }, false);
}(window, location));