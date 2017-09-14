from django.conf.urls import url

from . import views

from django.conf.urls import url, include
from django.contrib.auth import views as auth_views



urlpatterns = [
    # url(r'^$', views.index, name='index'),
    url(r'landing', views.landing, name='landing'),
    url(r'_login', views._login, name='_login'),
    url(r'sign_up', views.sign_up, name='sign_up'),
    url(r'game', views.game, name='game'),
    #
    url(r'^$', views.home, name='home'),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, {'next_page': 'login'}, name='logout'),
    url(r'^signup/$', views.signup, name='signup'),
]
