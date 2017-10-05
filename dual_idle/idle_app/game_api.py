from idle_app import models
from django.contrib.auth import get_user
from django.core.serializers.json import DjangoJSONEncoder as JSONEncoder
import json
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
        return JSONEncoder.encode(userGame)
    return userGame

def update_user_game(request):

    """request.body.game_object =
    {
        UserGame: {},
        PlayerItems: {},
        partnerItems: {} this should only be newly purchased items for your partner!
    }
    """

    request.body = {
                        "userGame": {
                            "user": {
                                "displayName": "john",
                                "id": 1
                            },
                            "wealth": 0,
                            "game": {
                                "id": 1
                            },
                            "mined": 0,
                            "timePlayed": 0,
                        },
                        "playerItems": [
                            {
                                "item": {
                                    "name": "calculator",
                                    "baseValue": 0,
                                    "upgradeValue": 0
                                },
                                "quantity": 1,
                                "upgradeQuantity": 1
                            },
                        ],
                        "partnerItems": [
                            {
                                "item": {
                                    "name": "computer",
                                    "baseValue": 0,
                                    "upgradeValue": 0
                                },
                                "quantity": 1,
                                "upgradeQuantity": 1
                            },
                        ]
                    }
    if type(request.body) == bytes:
        g_o = json.loads(request.body.decode('utf-8'))
    else:
        g_o = json.loads(json.dumps(request.body))

    user=None
    try:
        user = get_user(request)
    except Exception:
        user = models.User.get(id=g_o.get('userGame')['user']['id'])
    finally:
        if not user:
            user = models.UserProfile.objects.get(id=g_o.get('userGame')['user']['id'])
            if not user:
                raise Exception("Read the User library documentation :(")

    game = models.Game.objects.get(id=g_o.get('userGame')['game']['id'])

    myUserGame = models.UserGame.objects.filter(game=game, user=user)
    myUserGame.wealth = g_o.get('userGame')['wealth']
    myUserGame.mined = g_o.get('userGame')['mined']
    myUserGame.timePlayed = g_o.get('userGame')['timePlayed']
    myUserGame.save()

    myItems = models.PlayerItems.objects.filter(game=game, user=user)

    for updated_item in g_o.get('playerItems'):
        item = myItems.filter(name=updated_item['name'])
        if not len(item):
            if not len(models.Item.objects(name=updated_item['item']['name'])):
                item = models.Item(upgradeValue=updated_item['item']['upgradeValue'],
                                   baseValue=updated_item['item']['baseValue'],
                                   name=updated_item['item']['name'],
                                   displayImagePath='')
                item.save()
            item = models.PlayerItem(item=item.get(),
                                     user=user,
                                     quantity=updated_item['quantity'],
                                     upgradeQuantity=updated_item['upgradeQuantity'])
        else:
            item.upgradeQuantity = updated_item['upgradeQuantity']
            item.quantity = updated_item['quantity']
        item.save()


    partner = models.UserGame.objects.filter(game=game).exclude(user=user)
    partnerUserGame = models.UserGame.objects.filter(user=partner)
    partnerItems = []
    if len(partnerUserGame):
        partnerItems = models.PlayerItems.objects.filter(game=game, user=partner)
    else:
        partnerUserGame = {}


    """
        The response object body:
    """
    game_object = {
        "partnerUserGame": partnerUserGame,
        "partnerItems": partnerItems,
    }

    if request.META['CONTENT_TYPE'] == 'json':
        # In case of restful json api endpoint
        return JSONEncoder.encode(game_object) # Todo: HttpResponse object
    return game_object

# class dummyrequest:
#     body = None
#
# update_user_game(dummyrequest())