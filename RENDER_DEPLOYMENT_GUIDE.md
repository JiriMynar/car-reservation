# CAR11 - Návod pro nasazení na Render.com

Tento návod vás provede nasazením CAR11 aplikace na Render.com bez nutnosti programování.

## Příprava před nasazením

1. **Registrace na Render.com**
   - Jděte na https://render.com
   - Zaregistrujte se pomocí GitHub účtu (doporučeno) nebo emailu

2. **Nahrání kódu na GitHub**
   - Vytvořte nový repository na GitHub
   - Nahrajte obsah složky `car11-backend` do root složky vašeho repository

## Nasazení na Render.com

### Krok 1: Vytvoření PostgreSQL databáze

1. V Render.com dashboardu klikněte na **"New +"**
2. Vyberte **"PostgreSQL"**
3. Vyplňte:
   - **Name**: `car11-db`
   - **Database**: `car11`
   - **User**: `car11user`
   - **Region**: Vyberte nejbližší (Europe - Frankfurt)
   - **Plan**: Free
4. Klikněte **"Create Database"**
5. Počkejte, až se databáze vytvoří (může trvat několik minut)

### Krok 2: Nasazení webové aplikace

1. Klikněte na **"New +"** → **"Web Service"**
2. Připojte váš GitHub repository
3. Vyplňte nastavení:
   - **Name**: `car11-app` (nebo jakékoli jméno)
   - **Region**: Europe - Frankfurt (stejná jako databáze)
   - **Branch**: `main` (nebo název vaší hlavní větve)
   - **Root Directory**: nechte prázdné
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python src/main.py`
   - **Plan**: Free

### Krok 3: Nastavení proměnných prostředí

V sekci **Environment Variables** přidejte:

1. **SECRET_KEY**
   - Klikněte **"Generate"** pro automatické vygenerování
   
2. **DATABASE_URL**
   - Klikněte **"Add from Database"**
   - Vyberte vaši `car11-db` databázi
   - Vyberte **"External Database URL"**

### Krok 4: Dokončení nasazení

1. Klikněte **"Create Web Service"**
2. Render.com automaticky začne build proces
3. Počkejte, až se aplikace nasadí (může trvat 5-10 minut)
4. Po dokončení získáte URL adresu typu: `https://car11-app.onrender.com`

## Po nasazení

### Přihlašovací údaje
Aplikace automaticky vytvoří výchozí účty:

- **Administrator**:
  - Uživatelské jméno: `admin`
  - Heslo: `adminpass`

- **Uživatel**:
  - Uživatelské jméno: `user`
  - Heslo: `userpass`

### První spuštění
1. Otevřete URL adresu vaší aplikace
2. Přihlaste se pomocí admin účtu
3. Aplikace je připravena k použití!

## Důležité poznámky

- **Free tier omezení**: Render.com free tier má omezení - aplikace se po 15 minutách nečinnosti uspí
- **Databáze**: PostgreSQL free tier má limit 1GB dat
- **Zálohování**: Doporučujeme pravidelně exportovat data přes aplikaci
- **SSL**: Render.com automaticky poskytuje HTTPS certifikát

## Řešení problémů

### Aplikace se nenačítá
1. Zkontrolujte logs v Render.com dashboardu
2. Ujistěte se, že DATABASE_URL je správně nastavena
3. Ověřte, že build proces proběhl úspěšně

### Databázové chyby
1. Zkontrolujte, že PostgreSQL databáze běží
2. Ověřte připojovací údaje v Environment Variables
3. Restartujte web service

### Pomalé načítání
- To je normální u free tier - aplikace se "probouzí" po nečinnosti
- První načtení může trvat 30-60 sekund

## Aktualizace aplikace

Pro aktualizaci aplikace:
1. Nahrajte nové soubory do GitHub repository
2. Render.com automaticky detekuje změny a znovu nasadí aplikaci

---

**Aplikace je nyní připravena k produkčnímu použití na Render.com!**



## Notes from Lory Fix
- Added Flask-SQLAlchemy to requirements.
- Fixed CORS for credentials with FRONTEND_URL env var.
- Switched backend start to gunicorn for Render.
- Ensure Render service build copies frontend `dist` to backend `src/static` (see build.sh). If Node is unavailable, deploy frontend as a separate Static Site on Render and set FRONTEND_URL to that URL.
