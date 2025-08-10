# CAR11 – nasazení na Render (bez programování)

## 1) Import projektu
- Nahraj repozitář do GitHubu (obsah ZIPu) **nebo** v Renderu zvol `New → Blueprint` a ukaž na `render.yaml` v kořeni.

## 2) První nasazení (Blueprint)
Blueprint vytvoří:
- **car11-backend** (Python, Gunicorn)
- **car11-frontend** (Static Site, Vite build)
- **car11-db** (PostgreSQL)

## 3) Nastavení adres (po prvním deploy)
- Otevři službu **car11-frontend** → zkopíruj URL (např. `https://car11-frontend-xxx.onrender.com`).
- Otevři **car11-backend → Environment** a nastav `FRONTEND_URL` = ta URL → *Save* → **Redeploy** backend.
- Otevři **car11-frontend → Environment** a nastav `VITE_API_URL` = URL backendu (např. `https://car11-backend-xxx.onrender.com`) → **Redeploy** frontend.

> V render.yaml je default placeholder, ale po prvním deploy doplň skutečné URL.

## 4) Přihlášení
- `admin@car11.com` / `adminpass` (změň heslo).

## 5) Kontroly
- Backend healthcheck: `GET /healthz` musí vracet `{"status":"ok"}`.
- Přihlášení přes frontend musí vytvořit cookie; v produkci je `SameSite=None; Secure`.

## 6) Tipy
- Pokud chceš migrace DB: přidej Alembic; aktuálně se používá `db.create_all()` při startu.
- Pro větší provoz použij Redis + Flask-Session.
