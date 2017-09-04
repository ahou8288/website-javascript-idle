from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. You're at the idle index.")

def landing(request):
    return render(request, 'landing.html', {
        "default_linking_code": "d8cd98f00b204e9"}
                  )

def login(request):
    return render(request, 'login.html',
                  )

def sign_up(request):
    return render(request, 'sign_up.html',
                  )

def game(request):
    saved_game_state = {
        "perks": ["snowflake",'','','',''],
        "coins": {"username": 10,
                  "username2": 122},
        "items": {"username": ['calculator','mobile','desktop'],
                  "username2": ['calculator']},
        "tips": ["A hot tip for my Bitcoin Bro!",
                 "Another tip...."],
        "elapsed_time": 100,
        "linking_code": "d8cd98f00b204e9"
    }
    return render(request, 'game.html',
                  {"game_data": saved_game_state}
                  )