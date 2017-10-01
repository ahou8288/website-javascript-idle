from django.contrib.auth.forms import AuthenticationForm, authenticate
from django.contrib.auth import logout, authenticate, login, get_user
from idle_app.forms import RegistrationForm
from django.shortcuts import render
from django.http import HttpResponseRedirect
from idle_app import game_api as api
from django.contrib.auth.models import User


def landing(request):
    """
    api.create_game(request) Returns a UserGame
    object for implementing the create game button
    """
    if request.user.is_authenticated:
        return render(request, 'landing.html', {
            "default_linking_code": "d8cd98f00b204e9"})
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
                login(request, user)
                return HttpResponseRedirect('/idle_app/landing')
            else:
                print('User not found')
        else:
            # If there were errors, we render the form with these
            # errors
            return render(request, '_login.html', {'form': form})


def logout_view(request):
    logout(request)
    return render(request, '_logout.html')


def game(request):
    saved_game_state = {
        "perks": ["snowflake", '', '', '', ''],
        "coins": {"username": 10,
                  "username2": 122},
        "items": {"username": ['calculator', 'mobile', 'desktop'],
                  "username2": ['calculator']},
        "tips": ["A hot tip for my Bitcoin Bro!",
                 "Another tip...."],
        "elapsed_time": 100,
        "linking_code": "d8cd98f00b204e9"
    }
    return render(request, 'game.html',
                  {"game_data": saved_game_state}
                  )


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
