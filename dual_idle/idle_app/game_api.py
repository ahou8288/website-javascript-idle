from idle_app import models
from django.contrib.auth import get_user
from django.core.serializers.json import DjangoJSONEncoder as JSONEncoder
import json
import hashlib
from datetime import datetime, timedelta
from django.http import HttpResponse

def create_game(request):
    user = get_user(request)
    game_id_str = "%s%d"%(user.email,datetime.now().microsecond)
    link_code = hashlib.sha1(game_id_str.encode('utf-8')).hexdigest()
    game = models.Game(
        player = user,
        partner = None,
        creationDate=datetime.now(),
        linkingCode=link_code,
        isPublic=True,
    )
    game.save()
    userGame = models.UserGame(
        user=user,
        game=game,
        wealth=199,
    )
    userGame.save()
    if request.META['CONTENT_TYPE'] == 'json':
        pass
        # In case of restful json api endpoint
        # return JSONEncoder.encode(userGame)
    return userGame

def update_players_items(g_o, game, user, ctx):
    myItems = models.PlayerItem.objects.filter(game=game, user=user)
    for updated_item in g_o.get(ctx):
        item=None
        try:
            item = models.Item.objects.get(name=updated_item['item']['name'])
        except Exception:
            item = models.Item(upgradeValue=updated_item['item']['upgradeValue'],
                               baseValue=updated_item['item']['baseValue'],
                               name=updated_item['item']['name'],
                               displayImagePath='')
            item.save()
        myItem=None
        try:
            myItem = myItems.get(item=item)
            myItem.upgradeQuantity = updated_item['upgradeQuantity']
            myItem.quantity = updated_item['quantity']
        except Exception:
            myItem = models.PlayerItem(item=item,
                                        user=user,
                                        game=game,
                                        quantity=updated_item['quantity'],
                                        upgradeQuantity=updated_item['upgradeQuantity'])
        myItem.save()
    return [it.__todict__() for it in models.PlayerItem.objects.filter(game=game, user=user)]
    # return [it.item.__todict__() for it in models.PlayerItem.objects.filter(game=game, user=user)]

def update(request):
    """request.body.game_object =
    {
        UserGame: {},
        PlayerItems: {},
        partnerItems: {} this should only be newly purchased items for your partner!
    }
    """
    if type(request.body) == bytes:
        g_o = json.loads(request.POST.get("data", "0"))
    elif type(request.body) == str:
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
        elif user.is_anonymous:
            err = {"error": "User does not exist"}
            print(err)
            return HttpResponse(json.dumps(err),
                            content_type='application/json')
    game=None
    try:
        game = models.Game.objects.get(id=g_o.get('userGame')['game']['id'])
    except Exception:
        err = {"error": "game does not exist"}
        print(err)
        return HttpResponse(json.dumps(err),
                            content_type='application/json')

    try:
        print("trying to get usergame for: id=%d and game id: %d"%(user.id,game.id))

        myUserGame = models.UserGame.objects.get(game=game, user=user)
        myUserGame.wealth = g_o.get('userGame')['wealth']
        myUserGame.mined = g_o.get('userGame')['mined']
        myUserGame.timePlayed = timedelta(seconds=g_o.get('userGame')['timePlayed'])
        myUserGame.save()
    except Exception as ex:
        err = {"error": "User is not assigned to this game"}
        print(err)
        return HttpResponse(json.dumps(err),
                            content_type='application/json')

    update_players_items(g_o, game, user, 'playerItems')

    partnerUserGame={}
    partnerItems = []
    partner = models.UserGame.objects.filter(game=game).exclude(user=user)
    if len(partner):
        if len(partner) > 1:
            print("Too many users in this game!")
        partner = partner[0].user
        partnerUserGame = models.UserGame.objects.get(user=partner, game=game).__todict__()
        partnerItems = update_players_items(g_o, game, partner, 'partnerItems')

    """
        The response object body:
    """
    response_object = {
        "partnerUserGame": partnerUserGame,
        "partnerItems": partnerItems if partnerItems else [],
    }
    return HttpResponse(json.dumps(response_object),
                            content_type='application/json')
