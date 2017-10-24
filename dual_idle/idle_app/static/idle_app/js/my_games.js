

$(document).ready(function() {

    // AJAX Delete Game
    $('.btn-danger').click(function(){
        // get id (linking_code) and use it to send delete request to idle_app/delete_game/{linkingcode}
        var id_number = this.id;
        alert("Game " + id_number + "was deleted!");
        $.ajax({
            type: "DELETE",
            url: "idle_app/delete_game/"+id_number,
            success: function() {
                // if successful, set the content of the corresponding div on my_games.html page to nothing
                $("#" + id_number).html("");
        }
        });

    });

    // CSRF code
    function getCookie(name) {
        var cookieValue = null;
        var i = 0;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (i; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

});