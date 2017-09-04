from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'landing', views.landing, name='landing'),
    url(r'login', views.login, name='login'),
    url(r'sign_up', views.sign_up, name='sign_up'),
]