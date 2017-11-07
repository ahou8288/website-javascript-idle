from django.conf.urls import url

from . import views
from . import game_api
from django.conf.urls import url, include
from django.contrib.auth import views as auth_views


urlpatterns = [
    url(r'landing', views.landing, name='landing'),
    url(r'my_games', views.my_games, name='my_games'),
    url(r'delete_game/(?P<argument_linking_code>[a-zA-Z0-9]+)', views.delete_game, name='delete_game'),
    url(r'^game/posttest$', views.posttest, name='posttest'),
    url(r'^game/update$', game_api.update, name='update'),
    url(r'^game/(?P<linkingCode>[a-zA-Z0-9]+)', views.game, name='game'),
    url(r'^login/$', views.login_view, name='login'),
    url(r'^logout/$', views.logout_view, name='logout'),
    url(r'^signup/$', views.signup, name='signup'),
    url(r'^.*', views.bad_url, name='bad_url'),

]
