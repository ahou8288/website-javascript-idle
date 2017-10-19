from django.contrib.auth.forms import AuthenticationForm, authenticate
from django.contrib.auth import logout, authenticate, login, get_user
from idle_app.forms import RegistrationForm
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from idle_app import game_api as api
from idle_app.models import UserGame, Game, PlayerItem, Item
import json

# from django.contrib.auth.decorators import login_required
# from django.contrib.auth import login, authenticate
# from django.contrib.auth.forms import UserCreationForm
# from django.shortcuts import render, redirect

def landing(request):
    """
    api.create_game(request) Returns a UserGame
    object for implementing the create game button
    """
    print(api.create_game(request))
    if request.user.is_authenticated:
        if request.method =='GET':
            last_game = None
            try:
                last_game = UserGame.objects.filter(user=get_user(request)).reverse()[0].game
            except Exception:
                pass
            return render(request, 'landing.html', {
                "default_linking_code":  "sb34b34jhb35hbk35"})

    else:
        return HttpResponseRedirect('/idle_app/login')


def login_view(request):
    if request.user.is_authenticated:
        return render(request, 'landing.html', )

    if request.method == 'GET':
        form = AuthenticationForm()
        return render(request, '_login.html', {'form': form})

    if request.method == 'POST':
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                print(user, request)
                login(request, user)
                return HttpResponseRedirect('/idle_app/landing/')
            else:
                print('User not found')
                return render(request, '_login.html', {'form': form})
        else:
            # If there were errors, we render the form with these
            # errors
            return render(request, '_login.html', {'form': form})


def logout_view(request):
    logout(request)
    return render(request, '_logout.html')


def game(request, linkingCode):
    current_user = get_user(request)
    if current_user.is_anonymous:
        return HttpResponseRedirect('/idle_app/login/')
    try:
        the_game = Game.objects.get(linkingCode=linkingCode)
        try:
            userGame = UserGame.objects.get(game=the_game, user=current_user)
        except Exception:
            userGame = UserGame(
                            user=current_user,
                            game=the_game,
                            wealth=0,
                        )
            userGame.save()
    except Exception:
        userGame = api.create_game(request)
        the_game = userGame.game
    me,partner,partners_stuff = None,None,None
    try: #  and see if we have a partner yet
        partner = UserGame.objects.filter(game=the_game).exclude(user=current_user)
        partners_stuff = PlayerItem.objects.filter({'game':the_game,'user':partner.user})
        me = UserGame.objects.filter(game=the_game).exclude(user=partner.user)
    except Exception:
        me = UserGame.objects.filter(game=the_game)

    my_stuff = PlayerItem.objects.filter(game=the_game).filter(user=current_user)
    possible_items = list(Item.objects.all())

    game_data = {
        "game": the_game,
        "me": me,
        "my_stuff": my_stuff,
        "partner": partner,
        "partners_stuff": partners_stuff,
        "possible_items": possible_items,
    }
    saved_game_state = {
        "perks": ["snowflake", '', ''],
        "coins": {"username": 10,
                  "username2": 122},
        "items": {"username": ['calculator', 'mobile', 'desktop'],
                  "username2": ['calculator']},
        "tips": ["A hot tip for my Bitcoin Bro!",
                 "Another tip...."],
        "elapsed_time": 100,
        "linking_code": the_game.linkingCode
    }
    return render(request, 'game.html',
                  {"game_data": saved_game_state,
                    "saved_game": game_data
                   }
                  )


def posttest(request):
    print('Post received.')
    if request.method == 'POST':
        data=json.loads(request.POST.get("data", "0"))
        print(data)
        for i in data:
            print(i, data[i])
        return HttpResponse(json.dumps('test_response_info'), content_type='application/json')


def signup(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            new_user = authenticate(username=form.cleaned_data['username'],
                                    password=form.cleaned_data['password1'],
                                    )
            login(request, new_user)
            return HttpResponseRedirect('/idle_app/landing/')
    else:
        form = RegistrationForm()
    return render(request, 'sign_up.html', {'form': form})
