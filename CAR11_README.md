# CAR11 - Systém pro správu vozového parku

CAR11 je kompletní webová aplikace pro správu vozového parku vytvořená podle specifikace z dokumentu. Aplikace umožňuje efektivní správu vozidel, rezervací, uživatelů, servisních záznamů a poskytuje detailní reporty.

## Funkce aplikace

### Základní funkce
- **Autentifikace a autorizace** - Bezpečné přihlašování s rolemi (Administrator, Uživatel)
- **Správa vozidel** - Kompletní evidence vozidel včetně technických údajů
- **Rezervace vozidel** - Systém rezervací s kontrolou dostupnosti
- **Správa uživatelů** - Administrace uživatelských účtů a rolí
- **Servisní záznamy** - Evidence údržby a oprav vozidel
- **Záznamy o poškození** - Sledování poškození a jejich oprav
- **Reporty a analýzy** - Detailní přehledy o využití vozidel a nákladech

### Technické specifikace
- **Backend**: Flask (Python) s podporou PostgreSQL (pro produkci) a SQLite (pro lokální vývoj)
- **Frontend**: React s moderním UI (shadcn/ui)
- **Databáze**: PostgreSQL (doporučeno pro produkci), SQLite (pro lokální vývoj)
- **Autentifikace**: Session-based s bezpečným hashováním hesel

## Instalace a spuštění (Lokální vývoj)

### Požadavky
- Python 3.11+
- Node.js 20+
- npm nebo pnpm

### Backend (Flask API)
```bash
cd car11-backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# nebo
virtualenv\Scripts\activate     # Windows
pip install -r requirements.txt
# Pro lokální vývoj s SQLite není potřeba nastavovat DATABASE_URL
python src/main.py
```

Backend bude dostupný na: http://localhost:5000

### Frontend (React)
```bash
cd car11-frontend
npm install
npm run dev
```

Frontend bude dostupný na: http://localhost:5173

### Produkční nasazení (Lokální test)
Pro lokální test produkční verze:
1. Spusťte `build.sh` skript z kořenového adresáře projektu (`/home/ubuntu/build.sh`)
2. Spusťte pouze backend server: `cd car11-backend && source venv/bin/activate && python src/main.py`

## Nasazení na Render.com

Pro nasazení na Render.com postupujte podle detailního návodu v souboru `RENDER_DEPLOYMENT_GUIDE.md`.

## Přihlašovací údaje

### Výchozí administrátorský účet
- **Uživatelské jméno**: admin
- **Heslo**: adminpass

### Výchozí uživatelský účet
- **Uživatelské jméno**: user
- **Heslo**: userpass

## Struktura projektu

```
CAR11/
├── car11-backend/          # Flask API server
│   ├── src/
│   │   ├── main.py        # Hlavní aplikace
│   │   ├── models/        # Databázové modely
│   │   ├── routes/        # API endpointy
│   │   └── static/        # Statické soubory (frontend)
│   ├── venv/              # Python virtuální prostředí
│   ├── requirements.txt   # Python závislosti
│   ├── render.yaml        # Konfigurace pro Render.com
│   └── .env.example       # Příklad proměnných prostředí
├── car11-frontend/         # React frontend
│   ├── src/
│   │   ├── components/    # React komponenty
│   │   ├── contexts/      # React kontexty
│   │   ├── hooks/         # Custom hooks
│   │   └── config.js      # Konfigurace API URL
│   ├── dist/              # Sestavený frontend
│   └── package.json       # Node.js závislosti
├── build.sh               # Skript pro sestavení a kopírování frontendu
├── CAR11_README.md        # Tato dokumentace
└── RENDER_DEPLOYMENT_GUIDE.md # Návod pro nasazení na Render.com
```

## API Endpointy

### Autentifikace
- `POST /api/login` - Přihlášení uživatele
- `POST /api/logout` - Odhlášení uživatele
- `GET /api/check-auth` - Kontrola přihlášení

### Vozidla
- `GET /api/vehicles` - Seznam vozidel
- `POST /api/vehicles` - Přidání vozidla
- `PUT /api/vehicles/{id}` - Aktualizace vozidla
- `PUT /api/vehicles/{id}/archive` - Archivace vozidla

### Rezervace
- `GET /api/reservations` - Seznam rezervací
- `POST /api/reservations` - Vytvoření rezervace
- `PUT /api/reservations/{id}` - Aktualizace rezervace
- `PUT /api/reservations/{id}/cancel` - Zrušení rezervace

### Uživatelé a role
- `GET /api/users` - Seznam uživatelů
- `POST /api/users` - Přidání uživatele
- `PUT /api/users/{id}` - Aktualizace uživatele
- `GET /api/roles` - Seznam rolí
- `POST /api/roles` - Přidání role

### Servisní záznamy
- `GET /api/service-records` - Seznam servisních záznamů
- `POST /api/service-records` - Přidání záznamu
- `PUT /api/service-records/{id}` - Aktualizace záznamu
- `DELETE /api/service-records/{id}` - Smazání záznamu

### Záznamy o poškození
- `GET /api/damage-records` - Seznam záznamů o poškození
- `POST /api/damage-records` - Přidání záznamu
- `PUT /api/damage-records/{id}` - Aktualizace záznamu
- `DELETE /api/damage-records/{id}` - Smazání záznamu

### Reporty
- `GET /api/vehicle-utilization` - Využití vozidel
- `GET /api/cost-analysis` - Analýza nákladů
- `GET /api/reservation-statistics` - Statistiky rezervací
- `GET /api/export/{type}` - Export dat do CSV

## Databázová struktura

Aplikace používá PostgreSQL (pro produkci) nebo SQLite (pro lokální vývoj) databázi s následujícími tabulkami:
- `roles` - Uživatelské role
- `users` - Uživatelé systému
- `vehicles` - Vozidla
- `reservations` - Rezervace vozidel
- `service_records` - Servisní záznamy
- `damage_records` - Záznamy o poškození

## Bezpečnost

- Hesla jsou hashována pomocí bcrypt
- Session-based autentifikace
- CORS podpora pro frontend-backend komunikaci
- Validace vstupních dat na backend straně
- Kontrola oprávnění podle uživatelských rolí

## Rozšíření a customizace

Aplikace je navržena modulárně a lze ji snadno rozšířit o:
- Další typy vozidel a jejich specifické vlastnosti
- Pokročilé reporty a analýzy
- Integrace s externími systémy
- Mobilní aplikace
- Push notifikace
- GPS tracking

## Podpora a údržba

Pro správnou funkci aplikace doporučujeme:
- Pravidelné zálohování databáze
- Monitoring logů aplikace
- Aktualizace závislostí
- Testování nových funkcí v testovacím prostředí

## Licence

Tento software byl vytvořen podle specifikace uživatele a je poskytován "jak je" bez jakýchkoli záruk.

---

**Vytvořeno pomocí Manus AI - 7. srpna 2025**

