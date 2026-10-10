from django.contrib import admin
from django.urls import path

from diary import views


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/csrf", views.csrf_token, name="csrf"),
    path("api/auth/session", views.current_session, name="current-session"),
    path("api/auth/register", views.register, name="register"),
    path("api/auth/login", views.login_view, name="login"),
    path("api/auth/logout", views.logout_view, name="logout"),
    path("api/entries", views.entries, name="entries"),
    path("api/preferences", views.preferences, name="preferences"),
]
