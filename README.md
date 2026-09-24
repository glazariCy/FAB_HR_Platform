# Zalex Inc. – Employee Certificate Portal (MVP)

A React web application that lets Zalex Inc. employees **request a certificate of employment** and **view, sort and filter their requests**, as an add-on to the FAB Human Resources Management platform.

**Live site:** https://fabhrportal26.z1.web.core.windows.net/ (the interface only: the mock APIs accept calls from `localhost:3000` only, so run it locally for the full experience; see [Deployment](#deployment-t-01)).

### Setup
```bash
git clone https://github.com/glazariCy/FAB_HR_Platform.git
cd FAB_HR_Platform
npm install
```

Create a **`.env`** file in the project root (next to `package.json`) by copying `.env.example`, then fill in the keys:

| Variable | Used for |
|---|---|
| `VITE_API_BASE_URL` | `https://zalexinc.azure-api.net` |
| `VITE_PRIMARY_API_KEY` | `POST /request-certificate` |
| `VITE_SECONDARY_API_KEY` | `GET /request-list` |

### Run
```bash
npm run dev
```
Open **http://localhost:3000**. The port is fixed to 3000 because the API only accepts requests from `http://localhost:3000` (CORS).

---

## Project structure

```
src/
├── main.jsx                        # Entry point: renders <App /> into index.html
├── App.jsx                         # Routes (createBrowserRouter)
├── index.css                       # Global styles, shared buttons and messages
├── api/
│   └── certificateApi.js           # All API calls (POST request, GET list), date conversion
├── utils/
│   ├── validateCertificate.js      # Pure validation function for the form
│   └── requests.js                 # Pure helpers: sort, filter, date parsing/formatting
├── pages/
│   ├── RequestCertificatePage.jsx
│   └── CertificateRequestsListPage.jsx   # Loads data; loading / error / empty / table states
└── components/
    ├── layout/                     # AppLayout, Topbar, Sidebar (responsive menu)
    ├── certificates/               # Request form, FormField (✓/✕ + error), leave-page dialog
    └── requests/                   # Requests table (sorting, filter row), AutoGrowInput

scripts/
└── deploy-to-storage.mjs           # Used by the pipeline: uploads dist/ to the Azure Storage static website
```

---

## Assumptions and decisions

The case study leaves some details open. These are the choices made:

**Request form**
- **Address to, "Alphanumeric":** letters, numbers and spaces are allowed, plus basic address punctuation `, . -` and line breaks.
- **Issued on, "Future dates only":** today and later are accepted.
- **Employee ID, "Numeric only":** digits only, kept as text so leading zeros are preserved.
- **Date format sent to the API:** `M/D/YYYY` without leading zeros (e.g. `9/4/2026`), matching the dates returned by the list endpoint (e.g. `11/16/2022`).
- **Submit** is disabled until every field is valid.

**Requests list**
- **Status sort order:** the status workflow isn't specified, so a workflow order was chosen: ascending *New → Under Review → Pending → Done*, descending the reverse. Unknown statuses are placed after these.
- **Issued on** sorts by real date. The default view is **latest first**.
- **Reference No. filter** is an exact match (`5` does not match `50`).
- **Address to** matches when *every* typed word appears.
- **Status** is an exact match, and its options come from the data.
- **Reference numbers are not unique** in the API data (50 appears twice), so each row gets its own internal id for React.

---

## API key

The keys are kept out of Git (`.env` is git-ignored).

---

## CI/CD: Azure Pipelines

`azure-pipelines.yml` runs on every push to `main` and every pull request into `main`:

1. Use Node.js 24 (`UseNode@1`)
2. `npm ci`: install the exact versions from `package-lock.json`
3. `npm run lint`
4. `npm run build`
5. Publish `dist/` as the pipeline artifact `web`
6. **On `main` only:** deploy `dist/` to the Azure Storage static website (skipped for pull requests)

New Azure DevOps organisations don't get free Microsoft-hosted agents until Microsoft approves a request, so the pipeline currently runs on a **self-hosted agent** (`pool: name: Default`). Once hosted agents are granted, switching back is a one-line change to `vmImage: ubuntu-latest` (see the comment in the file). The agent only needs to be running while a pipeline runs; the deployed site is hosted by Azure and is always online.

**Pipeline variables** (set in Azure DevOps, not in the repo):

| Variable | Secret | Used by |
|---|---|---|
| `VITE_API_BASE_URL` | no | Build |
| `AZURE_STORAGE_CONNECTION_STRING` | yes | Deploy step |

---

## Deployment (T-01)

**Live site:** https://fabhrportal26.z1.web.core.windows.net/

The site is hosted as an **Azure Storage static website**, and the pipeline deploys it automatically after every merge to `main`:

- `scripts/deploy-to-storage.mjs` uploads `dist/` to the storage account's `$web` container, using the official `@azure/storage-blob` SDK. It sets the correct content type for each file and caching headers (`index.html` is never cached; the hashed files in `assets/` are cached for a year), and it removes files left over from earlier deployments.
- The static website's **error document is `index.html`**.
- Why Azure Storage and not Azure Static Web Apps: Static Web Apps is not available in the regions allowed by the Azure for Students subscription used here.

### Known limitation: the API calls don't work on the live site

The mock APIs only accept browser requests from **`http://localhost:3000`** (their CORS policy returns `Access-Control-Allow-Origin: http://localhost:3000`). On the hosted URL, the browser blocks the responses, so the live site shows its error states (*"We couldn't load your requests"*, and an error message on submit). The navigation, layout, form validation and responsive design can all be checked on the live site.

Because the API calls can't succeed there anyway, the **deployed build is made without the API keys**, so they are not published on a public website.

---

## Git workflow

One branch per feature, named after the requirement IDs (e.g. `feature/F02-request-certificate`, `feature/F04-requests-list`). Each branch was merged into `main` through a pull request, and commit messages reference the requirement they implement (e.g. `F02-R02: …`).
