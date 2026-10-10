import uuid

from django.conf import settings
from django.db import models


class Entry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="diary_entries",
    )
    title = models.CharField(max_length=500, blank=True)
    content = models.TextField(blank=True)
    hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        ordering = ["-updated_at"]


class UserPreferences(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="diary_preferences",
    )
    background = models.TextField(blank=True)
    dark_mode = models.BooleanField(default=False)
