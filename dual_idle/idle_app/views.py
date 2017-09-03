from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. You're at the idle index.")

def landing(request):
    return render(request, 'landing.html', {
        "default_linking_code": "d8cd98f00b204e9"})
