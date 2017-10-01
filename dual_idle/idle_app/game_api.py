from idle_app import models
from django.contrib.auth import get_user
from django.core.serializers.json import DjangoJSONEncoder as JSON
import hashlib
from datetime import datetime

def create_game(request):
    user = get_user(request)
    game_id_str = "%s%d"%(user.email,datetime.now().microsecond)
    link_code = hashlib.sha1(game_id_str.encode('utf-8')).hexdigest()
    game = models.Game(
        creationDate="1970-06-06",
        linkingCode=link_code,
        isPublic=True,
    )
    game.save()
    userGame = models.UserGame(
        user=user,
        game=game,
        wealth=0,
    )
    userGame.save()
    print(userGame.game)
    if request.META['CONTENT_TYPE'] == 'json':
        # In case of restful json api endpoint
        return JSON.encode(userGame)
    return userGame
