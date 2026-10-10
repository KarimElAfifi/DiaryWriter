import json
import uuid
from json import JSONDecodeError

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods

from .models import Entry, UserPreferences


def error_response(message, status):
    return JsonResponse({"error": message}, status=status)


def read_json(request):
    try:
        payload = json.loads(request.body or b"{}")
    except (JSONDecodeError, UnicodeDecodeError):
        return None
    return payload if isinstance(payload, dict) else None


def authenticated_user(request):
    return request.user if request.user.is_authenticated else None


def user_payload(user):
    return {"userId": str(user.pk), "username": user.get_username()}


@ensure_csrf_cookie
@require_GET
def csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set."})


@require_GET
def current_session(request):
    user = authenticated_user(request)
    if not user:
        return error_response("Not signed in.", 401)
    return JsonResponse({"user": user_payload(user)})


@require_http_methods(["POST"])
def register(request):
    payload = read_json(request)
    if payload is None:
        return error_response("Invalid JSON request.", 400)

    username = payload.get("username")
    password = payload.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return error_response("Please enter a username and password.", 400)
    username = username.strip()
    if not username or not password:
        return error_response("Please enter a username and password.", 400)

    user_model = get_user_model()
    if user_model.objects.filter(username__iexact=username).exists():
        return error_response("This username already exists.", 400)

    user = user_model(username=username)
    try:
        user.full_clean(exclude=["password"])
        validate_password(password, user=user)
    except ValidationError as error:
        return error_response(" ".join(error.messages), 400)

    user.set_password(password)
    user.save()
    login(request, user)
    return JsonResponse({"user": user_payload(user)}, status=201)


@require_http_methods(["POST"])
def login_view(request):
    payload = read_json(request)
    if payload is None:
        return error_response("Invalid JSON request.", 400)

    username = payload.get("username")
    password = payload.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return error_response("Please enter a username and password.", 400)
    user_model = get_user_model()
    user_record = user_model.objects.filter(username__iexact=username.strip()).first()
    user = (
        authenticate(request, username=user_record.get_username(), password=password)
        if user_record
        else None
    )
    if user is None:
        return error_response("Incorrect username or password.", 400)

    login(request, user)
    return JsonResponse({"user": user_payload(user)})


@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"detail": "Signed out."})


def serialize_entry(entry):
    return {
        "id": str(entry.pk),
        "title": entry.title,
        "content": entry.content,
        "hidden": entry.hidden,
        "createdAt": entry.created_at.isoformat(),
        "updatedAt": entry.updated_at.isoformat(),
    }


def parse_entry(item):
    if not isinstance(item, dict):
        raise ValidationError("Each entry must be an object.")

    entry_id = item.get("id")
    created_at_value = item.get("createdAt", "")
    updated_at_value = item.get("updatedAt", "")
    title = item.get("title", "")
    content = item.get("content", "")
    hidden = item.get("hidden", False)
    if not isinstance(entry_id, str):
        raise ValidationError("Each entry must have a valid id.")
    try:
        entry_id = uuid.UUID(entry_id)
    except ValueError:
        raise ValidationError("Each entry must have a valid id.") from None
    if not isinstance(title, str) or len(title) > 500:
        raise ValidationError("Entry titles must be 500 characters or fewer.")
    if not isinstance(content, str) or not isinstance(hidden, bool):
        raise ValidationError("Entry content or visibility is invalid.")

    if not isinstance(created_at_value, str) or not isinstance(updated_at_value, str):
        raise ValidationError("Entry dates must be valid ISO timestamps.")
    created_at = parse_datetime(created_at_value)
    updated_at = parse_datetime(updated_at_value)
    if not created_at or not updated_at:
        raise ValidationError("Entry dates must be valid ISO timestamps.")
    if timezone.is_naive(created_at):
        created_at = timezone.make_aware(created_at)
    if timezone.is_naive(updated_at):
        updated_at = timezone.make_aware(updated_at)

    try:
        entry = Entry(
            id=entry_id,
            title=title,
            content=content,
            hidden=hidden,
            created_at=created_at,
            updated_at=updated_at,
        )
    except (TypeError, ValueError):
        raise ValidationError("Each entry must have a valid id.") from None
    return entry


@require_http_methods(["GET", "PUT"])
def entries(request):
    user = authenticated_user(request)
    if not user:
        return error_response("Authentication required.", 401)

    if request.method == "GET":
        items = [serialize_entry(entry) for entry in Entry.objects.filter(user=user)]
        return JsonResponse({"entries": items})

    payload = read_json(request)
    if payload is None or not isinstance(payload.get("entries"), list):
        return error_response("Entries must be provided as a JSON array.", 400)

    try:
        parsed_entries = [parse_entry(item) for item in payload["entries"]]
        ids = [entry.pk for entry in parsed_entries]
        if len(ids) != len(set(ids)):
            raise ValidationError("Entry ids must be unique.")
    except ValidationError as error:
        return error_response(" ".join(error.messages), 400)

    with transaction.atomic():
        existing_entries = {
            entry.pk: entry for entry in Entry.objects.filter(user=user)
        }
        foreign_entry_exists = Entry.objects.filter(pk__in=ids).exclude(user=user).exists()
        if foreign_entry_exists:
            return error_response("An entry id belongs to another account.", 404)

        create_entries = []
        update_entries = []
        for entry in parsed_entries:
            entry.user = user
            if entry.pk in existing_entries:
                update_entries.append(entry)
            else:
                create_entries.append(entry)

        submitted_ids = set(ids)
        Entry.objects.filter(user=user).exclude(pk__in=submitted_ids).delete()
        if create_entries:
            Entry.objects.bulk_create(create_entries)
        if update_entries:
            Entry.objects.bulk_update(
                update_entries,
                ["title", "content", "hidden", "created_at", "updated_at"],
            )

    return JsonResponse({"detail": "Entries saved."})


@require_http_methods(["GET", "PUT"])
def preferences(request):
    user = authenticated_user(request)
    if not user:
        return error_response("Authentication required.", 401)

    preference, _ = UserPreferences.objects.get_or_create(user=user)
    if request.method == "GET":
        return JsonResponse(
            {
                "preferences": {
                    "background": preference.background,
                    "darkMode": preference.dark_mode,
                }
            }
        )

    payload = read_json(request)
    if payload is None:
        return error_response("Invalid JSON request.", 400)
    if "background" in payload:
        background = payload["background"]
        if not isinstance(background, str):
            return error_response("Background must be a string.", 400)
        preference.background = background
    if "darkMode" in payload:
        dark_mode = payload["darkMode"]
        if not isinstance(dark_mode, bool):
            return error_response("Dark mode must be a boolean.", 400)
        preference.dark_mode = dark_mode
    preference.save()
    return JsonResponse({"detail": "Preferences saved."})
