# Bitcoin Bros Idle Game

This repository contains the source for a javascript and django based website/game.

This website was written as a team for the Internet Software Platforms uni course.
My part of the 5 man team working on this was to develop all the javascript for the game, and to plan out the database model.

I also did a lot of work on the html and CSS for the game page (game.html).

## Setup

1. Install python dependencies in virtualenv.

`virtualenv -p python3 venv`

`source venv/bin/activate`

`pip install -r requirements.txt`

2. Start server running locally

`python manage.py runserver`

3. Visit game in browser

[Click to open game](http://localhost:8000/idle_app/)

## Tech

This website uses;
* Django
* Javascript
* KnockoutJS
* Lots and lots of AJAX
