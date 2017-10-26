// Player Join Game Linking Code
$(document).ready(function () {

    $('.btn').click(function () {
        // Get linking Code by element ID
        var linkingCode = document.getElementById('linkingCode_Value').value;

        if (linkingCode.length > 0) {
            // Setup linking Code into a new URL
            var url = "/idle_app/game/" + linkingCode;

            // Open new URL to the game
            window.open(url,"_self")
        }
    });
});