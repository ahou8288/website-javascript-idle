from idle_app import models
from django.core.serializers.json import DjangoJSONEncoder as JSON

def create_game(request):
    user = request.user
    game = models.Game(
        creationDate="1970-06-06",
        linkingCode="",
        isPublic=True,
    ).save()
    userGame = models.UserGame(
        user=user,
        game=game,
        wealth=0,
    ).save()
    if request.META['CONTENT_TYPE'] == 'json':
        # In case of restful json api endpoint
        return JSON.encode(userGame)
    return userGame
