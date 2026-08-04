# Deployment Runbook

How this site (EnDesign — Next.js + Payload CMS + Postgres) is deployed and
operated in production, and what's needed to move it to a different server.
Written after a live deployment session so the gotchas are documented, not
just the happy path.

## 1. Current production server

- Host: `185.181.165.99` (domain `en-design.pp.ua`)
- SSH user: `vety`, has passwordless-prompt `sudo` (needs the password piped
  in non-interactively, see below)
- Repo location on server: `/home/admin/docker/en-design.pp.ua` (owned by
  `root`, so all git/file operations there need `sudo`)
- Server also hosts several unrelated Docker projects (`ar-cafe`,
  `webar-menu`, `vety-site`, `portainer`) — don't touch those.

Credentials (host/user/password) are saved in this machine's Claude memory
(`endesign_ssh_credentials`), not in this file or in git.

## 2. Connecting from Windows (PuTTY CLI)

No interactive SSH client available in this environment — use PuTTY's
`plink`/`pscp` non-interactively:

```bash
echo y | "/c/Program Files/PuTTY/plink.exe" -ssh -pw 'PASSWORD' vety@185.181.165.99 "command"
echo y | "/c/Program Files/PuTTY/pscp.exe" -pw 'PASSWORD' localfile vety@185.181.165.99:/remote/path/
```

`echo y |` auto-accepts the host key prompt on first connect.

Since the repo directory is root-owned, most commands need:
```bash
echo 'PASSWORD' | sudo -S <command>
```
Passing `-S` makes sudo read the password from stdin instead of a tty.

**Gotcha — `sudo` isn't cached across separate `plink` invocations.** Each
`plink` call is a brand new SSH session; a bare `sudo rm -f x` in a later
call (without `-S` and a piped password) will just fail with "a password is
required" and no explanation unless you check the output. Always pipe the
password to every sudo call, or wrap the whole multi-step command in a
single `sudo -S bash -c '...'`.

**Gotcha — backgrounding a remote command with `nohup ... &` is unreliable.**
A `plink` exec that starts a background job on the remote end and then
returns can let that job get killed via SIGHUP when the SSH channel closes,
even under `nohup`, especially with `sudo` in the mix. What actually works:
run the full command in the foreground of a single `plink` call, and use
your own tool's background-execution feature (not a remote `&`) to avoid
blocking locally while the SSH session stays open for the whole duration.

**Gotcha — output redirection ordering with sudo.** `sudo -S cmd > file`
redirects `file` as the *calling* user, before sudo even runs — if `file`
already exists owned by root from a previous attempt, this fails with
"Permission denied" and silently no-ops (if chained with `&&`, nothing after
it runs either). Always put the redirect *inside* the sudo'd shell:
`sudo -S bash -c 'cmd > file 2>&1'`.

## 3. Stack layout

- `docker-compose.yml` on the server has diverged from the one in git (the
  original repo version was a bare-bones dev compose file; production's was
  hand-edited to add `build: .`, container names, the media/pgdata named
  volumes, `.env.production`, and `restart: unless-stopped`). **Don't
  `git pull` blindly and assume this file matches** — it's a tracked file
  with local-only edits; check `git diff docker-compose.yml` before pulling
  if you need to touch it, and don't overwrite it.
- Named volumes: `en-designppua_endesign_media` (uploaded files, mounted at
  `/app/public/media`) and `en-designppua_endesign_pgdata` (Postgres data).
  Losing these = losing all uploads/content.
- Network: `en-designppua_default` (bridge) — the `postgres` hostname
  resolves inside this network via Docker's embedded DNS.
- `.env.production` (root-owned, in the repo dir, **not in git**) holds
  `DATABASE_URI` (points at `postgres:5432` via the compose network, not
  `localhost`), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `CRON_SECRET`,
  `PREVIEW_SECRET`, `NODE_ENV=production`. If moving servers, this file has
  to be recreated by hand — see §7.

## 4. Deploying a code change

1. Commit and push locally as normal.
2. On the server:
   ```bash
   cd /home/admin/docker/en-design.pp.ua && sudo git pull origin main
   ```
3. Rebuild the image (this takes a few minutes for `npm run build`; layer
   caching makes repeat builds much faster if only late steps changed):
   ```bash
   sudo bash -c 'docker compose build > /tmp/build.log 2>&1; echo EXITCODE:$?'
   ```
   Run this as ONE foreground command (see the backgrounding gotcha above),
   and independently verify completion by checking `/tmp/build.log` for
   `Successfully tagged endesign:latest` — don't trust a task tracker alone.
4. Recreate the container:
   ```bash
   sudo docker compose up -d app
   ```
5. Check it came up clean:
   ```bash
   sudo docker logs endesign-app --tail 50
   ```
   The container's `CMD` is `npx payload migrate && npm run start` — the
   migrate step runs automatically on every container start. **If it prints
   a Postgres "column does not exist" error and the site 500s, see §5 —
   you forgot to generate a migration for a schema change.**

## 5. ⚠️ The most important gotcha: Payload schema changes need a migration

Locally, `next dev` runs Payload's Postgres adapter in **push mode** — it
silently adds new columns/tables to your local DB the moment you add a
field to a collection/global config. There is no equivalent in production;
the Dockerfile's `CMD` runs `npx payload migrate`, which only applies
committed migration files from `src/migrations/`.

**Any time you add/rename/remove a field on a collection, global, or
block** (this includes things that feel small, like one new text field),
you MUST generate a migration before deploying, or the production DB schema
drifts from what the code expects and every query touching that
collection/global fails with a Postgres `missing column` error — which
manifests as the *entire site returning 500*, not just the new feature.

```bash
# locally, against your local dev DB (which already has the new columns
# from dev's push mode) — this diffs the last migration snapshot against
# the current live schema and generates the SQL to catch it up:
npx cross-env NODE_OPTIONS=--no-deprecation payload migrate:create some_descriptive_name
```

Commit the generated `src/migrations/<timestamp>_some_descriptive_name.ts`
file, then deploy as in §4 — the container's automatic `npx payload
migrate` on startup will apply it.

If you've already deployed and hit this: generate the migration, commit,
`git pull` on the server, rebuild (fast — cached), `docker compose up -d
app` again. The container's restart re-runs the migration step and recovers
immediately.

## 6. Running one-off content/data migration scripts against production

This project's `migration/scripts/*.ts` (gitignored, not in the image) are
one-off Payload Local API scripts — content fixes, translations, seed data.
To run one against the production DB:

1. Build a `builder`-stage image (has full devDependencies — `tsx`, etc. —
   that the pruned production image lacks):
   ```bash
   sudo docker build --target builder -t endesign:builder .
   ```
2. Copy the script(s) (plus `migration/lib/*` and any assets they read) to
   a scratch directory on the server, e.g. `/home/vety/migration/...`,
   via `pscp`.
3. Run via `docker run`, mounting that scratch directory to `/app/migration`
   inside the container (the scripts' relative imports like
   `../../src/payload.config` assume they sit next to the real `src/` —
   mounting fixes that up), plus the media volume if the script uploads
   files, on the compose network, with the production env file:
   ```bash
   sudo docker run --rm \
     --network en-designppua_default \
     --env-file .env.production \
     -v en-designppua_endesign_media:/app/public/media \
     -v /home/vety/migration:/app/migration \
     endesign:builder \
     npx tsx migration/scripts/your-script.ts
   ```
4. **Before trusting any script that references hardcoded document/block
   IDs** (e.g. a script written against your local dev DB that patches a
   specific block by its Payload-generated id): verify local and production
   actually share those ids first, e.g.
   `curl .../api/services/1?depth=0&locale=uk` against both and diff the
   block ids. If the two databases were seeded independently rather than
   from a shared dump, the ids will differ and the script will silently
   match nothing (no error, no effect) rather than fail loudly.
5. Some collection/global `afterChange` hooks call `revalidatePath()`,
   which throws outside a real Next.js request context (which every
   migration script runs outside of). Pass
   `context: { disableRevalidate: true }` in the `payload.update(...)` /
   `payload.updateGlobal(...)` call to skip it; check the collection's hook
   file if you hit `Invariant: static generation store missing`.

## 7. Cleaning up after a deploy

Disk fills up fast with old image layers — always clean up:
```bash
sudo docker rmi endesign:builder      # if you built one for scripts
sudo docker image prune -f
rm -rf /home/vety/migration           # scratch script upload dir, if used
df -h /
```

## 8. Moving to a brand-new server

1. Install Docker + Docker Compose plugin.
2. `git clone` this repo somewhere (e.g. mirror the current
   `/home/admin/docker/en-design.pp.ua` layout, or wherever fits the new
   host's conventions).
3. Recreate `docker-compose.yml`'s production edits (see §3 — it's NOT the
   version in git as of this writing; diff against the server's copy
   first if you still have access to the old server, or reconstruct from
   this file's description of what changed: `build: .`, container names,
   named volumes `endesign_media`/`endesign_pgdata`, env_file, ports).
4. Create `.env.production` by hand with fresh secrets:
   - `DATABASE_URI=postgresql://<user>:<pass>@postgres:5432/endesign`
     (hostname `postgres` = the compose service name, not `localhost`)
   - `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET` — generate new random
     values (e.g. `openssl rand -hex 32`), don't reuse the old server's
   - `NEXT_PUBLIC_SERVER_URL` — the new domain
   - `NODE_ENV=production`
5. Migrate data:
   - **Media files**: copy the contents of the old `endesign_media` volume
     to the new one (`docker cp` from a running container, or
     `docker run --rm -v old_vol:/from -v new_vol:/to alpine cp -a /from/. /to/`
     if both are reachable, or tar+scp between hosts otherwise).
   - **Database**: `pg_dump` the old `endesign_pgdata`-backed Postgres and
     restore into the new one — do NOT try to copy the raw volume between
     different Postgres major versions or hosts; use `pg_dump`/`pg_restore`
     to be safe.
6. `docker compose up -d` — the app container's `npx payload migrate` will
   apply the full migration history against the fresh (or restored) DB.
7. Point DNS at the new server, update `NEXT_PUBLIC_SERVER_URL` if the
   domain changed.
8. Re-run through §4 once to confirm a normal deploy still works end to end
   on the new host before considering the migration done.
