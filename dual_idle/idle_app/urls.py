from django.conf.urls import url

from . import views

from django.conf.urls import url, include
from django.contrib.auth import views as auth_views


urlpatterns = [
    url(r'landing', views.landing, name='landing'),
    url(r'^game/posttest$', views.posttest, name='posttest'),
    url(r'^game/(?P<linkingCode>[a-zA-Z0-9]+)', views.game, name='game'),
    url(r'^login/$', views.login_view, name='login'),
    url(r'^logout/$', views.logout_view, name='logout'),
    url(r'^signup/$', views.signup, name='signup'),
]
