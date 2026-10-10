# DiaryWriter

A React diary app with a Django backend for user accounts, diary entries, and
preferences. Django stores the data in `db.sqlite3` and hashes passwords using
its built-in password hashers; passwords are never stored as plain text.

## Local development

Open two terminals in this directory.

In the first terminal, install and start Django:
```powershell
$python = "$env:LOCALAPPDATA\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\python.exe"
& $python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
& .\.venv\Scripts\python.exe manage.py migrate
& .\.venv\Scripts\python.exe manage.py runserver
```

The Python path above is the interpreter shown in the reported error. If
`Test-Path $python` returns `False`, locate the Python executable associated
with `pip3` and replace the value of `$python` with that executable's path.
Use `pip3 install ...` to install packages directly; do not pass `-m` to
`pip3`—the `-m pip` option is passed to `python.exe`, as in the commands above.

In the second terminal, install and start the React app:
```sh
npm install
npm run dev
```

Open the Vite URL printed in the second terminal. Vite forwards `/api` requests
to Django at `http://127.0.0.1:8000`. New accounts require a password of at
least 8 characters. Sign out from the settings menu.

The SQLite database file is local and excluded from Git. Existing accounts and
entries previously stored in this browser are not migrated automatically.

## Checks

```sh
npm run lint
npm run build
npm run backend:test
```

For deployment, set a private `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`,
`DJANGO_ALLOWED_HOSTS`, and `DJANGO_CSRF_TRUSTED_ORIGINS`. Serve the app and API
over HTTPS with a same-origin reverse proxy. Diary text is stored in the
database without application-level encryption, so use protected storage and
backups for the database.
