import json

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import Entry, UserPreferences


class DiaryApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="diaryuser",
            password="Strong-password-123",
        )

    def test_registration_hashes_password_and_creates_authenticated_session(self):
        response = self.client.post(
            reverse("register"),
            data=json.dumps(
                {"username": "newuser", "password": "A-strong-password-123"}
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(username="newuser")
        self.assertNotEqual(user.password, "A-strong-password-123")
        self.assertTrue(user.check_password("A-strong-password-123"))
        self.assertEqual(self.client.get(reverse("current-session")).status_code, 200)

    def test_login_is_case_insensitive_and_rejects_wrong_password(self):
        response = self.client.post(
            reverse("login"),
            data=json.dumps(
                {"username": "DIARYUSER", "password": "Strong-password-123"}
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        wrong_password = self.client.post(
            reverse("login"),
            data=json.dumps({"username": "diaryuser", "password": "incorrect"}),
            content_type="application/json",
        )
        self.assertEqual(wrong_password.status_code, 400)

    def test_entries_and_preferences_are_private_to_the_signed_in_user(self):
        self.client.force_login(self.user)
        item = {
            "id": "44a3d977-7f0c-4f0c-8de8-3aaea30cb0e0",
            "title": "First entry",
            "content": "Private diary text",
            "hidden": False,
            "createdAt": "2026-01-01T12:00:00.000Z",
            "updatedAt": "2026-01-01T12:00:00.000Z",
        }
        saved = self.client.put(
            reverse("entries"),
            data=json.dumps({"entries": [item]}),
            content_type="application/json",
        )
        self.assertEqual(saved.status_code, 200)
        self.assertEqual(Entry.objects.get().user, self.user)

        self.client.put(
            reverse("preferences"),
            data=json.dumps({"darkMode": True}),
            content_type="application/json",
        )
        self.assertTrue(UserPreferences.objects.get(user=self.user).dark_mode)

        self.client.logout()
        self.assertEqual(self.client.get(reverse("entries")).status_code, 401)

    def test_entries_reject_invalid_identifiers_and_dates(self):
        self.client.force_login(self.user)
        invalid_entry = {
            "id": "not-a-uuid",
            "title": "Entry",
            "content": "Text",
            "hidden": False,
            "createdAt": "2026-01-01T12:00:00.000Z",
            "updatedAt": "2026-01-01T12:00:00.000Z",
        }
        response = self.client.put(
            reverse("entries"),
            data=json.dumps({"entries": [invalid_entry]}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

        invalid_entry["id"] = "44a3d977-7f0c-4f0c-8de8-3aaea30cb0e0"
        invalid_entry["createdAt"] = []
        response = self.client.put(
            reverse("entries"),
            data=json.dumps({"entries": [invalid_entry]}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
