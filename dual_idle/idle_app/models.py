from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import timedelta

class UserProfile(models.Model):
    """
    An optional hook here which can be used to
    save additional attributes to the User.
    Note that they may be referenced via the user model:
    i.e user.displayName (the UserProfile reference is implied)
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    displayName = models.CharField(max_length=33)

    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            UserProfile.objects.create(user=instance)

    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.userprofile.save()

class Item(models.Model):
    name = models.CharField(max_length=33)
    displayImagePath = models.URLField()
    baseValue = models.IntegerField()
    upgradeValue = models.IntegerField()
    def __todict__(self):
        return {
            "name": self.name,
            "baseValue": self.baseValue,
            "upgradeValue": self.upgradeValue
        }

class Game(models.Model):
    player = models.ForeignKey(User)
    partner = models.ForeignKey(User)
    creationDate = models.DateField()
    linkingCode = models.CharField(max_length=33)
    isPublic = models.BooleanField()

class PlayerItem(models.Model):
    user = models.ForeignKey(User)
    game = models.ForeignKey(Game)
    item = models.ForeignKey(Item)
    quantity = models.IntegerField()
    upgradeQuantity = models.IntegerField()


class UserGame(models.Model):
    user = models.ForeignKey(User)
    game = models.ForeignKey(Game)
    wealth = models.BigIntegerField()
    mined = models.BigIntegerField(default=0)
    timePlayed = models.DurationField(
        default=timedelta(seconds=0))
    def __todict__(self):
        return {
            "user": {
                "id": self.user.id
            },
            "game": {
                "id": self.game.id
            },
            "wealth": self.wealth,
            "mined": self.mined,
            "timePlayed": self.timePlayed.seconds
        }