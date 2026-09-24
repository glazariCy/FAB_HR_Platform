# Zalex Inc. – Employee Certificate Portal (MVP)

A React web application that lets Zalex Inc. employees **request a certificate of employment** and **view, sort and filter their requests**, as an add-on to the FAB Human Resources Management platform.

Built for the *Junior FE Developer Case Study*.

**Live site:** https://fabhrportal26.z1.web.core.windows.net/ (the interface only: the mock APIs accept calls from `localhost:3000` only, so run it locally for the full experience; see [Deployment](#deployment-t-01)).

---

## Features

| Requirement | What was built |
|---|---|
| **F01-R01** Web app in React | React 19 + Vite single-page app with React Router, an HR-style layout (top bar + sidebar) and a responsive slide-in menu on small screens |
| **F02-R01** Request details | "Request Certificate" page with *Address to*, *Purpose*, *Issued on* and *Employee ID* (controlled inputs) |
| **F02-R02** Inline validation | Each field is validated as the user types (after they first leave it): ✓ + green border when valid, ✕ + red border and an error message when not. Submit stays disabled until the whole form is valid |
| **F02-R03** Submit to backend | `POST /request-certificate` with the API key; values are trimmed and the date is converted to the API format |
| **F02-R04** Confirmation | A success message (with a link to the list) when the API answers `"Ok"`; an error message that keeps the user's input if it fails |
| **F04-R01** List of requests | "Requests List" page with a table: Reference No., Address to, Purpose, Issued on, Status |
| **F04-R02** Sorting | Click the *Issued on* or *Status* header to sort ascending / descending |
| **F04-R03** Filtering *(optional)* | In-line filter row: Reference No. (full match), Address to (contains words), Status (full match); filters combine, and each can be cleared on its own |
| **F04-R04** Load from API | `GET /request-list` when the page opens, with loading, error (with *Try again*) and empty states |
| **CI/CD** (Azure Pipeline) | `azure-pipelines.yml`: install, lint, build and publish the built site on every push / PR to `main`, and deploy it on every merge to `main` |
| **T-01** Deploy online *(optional)* | Hosted as an Azure Storage static website, deployed by the pipeline. The mock APIs only allow `localhost:3000`, so API calls work locally only (see [Deployment](#deployment-t-01)) |

Extras: clear-form button, warning before leaving the form with unsaved input, status badges, accessible markup (labels, `aria-*` attributes, keyboard support), per-page browser titles.

---

## Tech stack

- **React 19** with **Vite** (dev server + build)
- **React Router** (data router, needed for the leave-page warning)
- Plain **`useState` / `useEffect` / `fetch`** and **plain CSS**, with no UI or state-management libraries, to keep the solution small and easy to follow
- **ESLint** for code quality
- **Git + GitHub** for source control, **Azure Pipelines** for CI/CD, **Azure Storage** static website for hosting

---

## Getting started

### Requirements
- **Node.js 20.19+** (developed with Node 24)
- The two API keys from the case study email

### Setup
```bash
git clone https://github.com/glazariCy/FAB_HR_Platform.git
cd FAB_HR_Platform
npm install
```

Create a **`.env`** file in the project root (next to `package.json`) by copying `.env.example`, then fill in the keys:

```bash
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

| Variable | Used for |
|---|---|
| `VITE_API_BASE_URL` | `https://zalexinc.azure-api.net` |
| `VITE_PRIMARY_API_KEY` | `POST /request-certificate` |
| `VITE_SECONDARY_API_KEY` | `GET /request-list` |

### Run
```bash
npm run dev
```
Open **http://localhost:3000**. The port is fixed to 3000 (`strictPort` in `vite.config.js`) because the API only accepts requests from `http://localhost:3000` (CORS).

> Restart `npm run dev` after changing `.env`, because Vite only reads it on startup.

### Other scripts
| Command | What it does |
|---|---|
| `npm run build` | Production build into `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

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

**Design choices**
- **Pages vs components:** a page is what a URL shows and owns its data; components only render what they are given.
- **API layer separated from UI:** components don't know URLs, keys or HTTP details.
- **Validation, sorting and filtering are pure functions** (no React), so they are easy to reason about and test.
- **Derived values are calculated, not stored:** errors, the sorted list and the filtered list are computed from state on every render, so they can never get out of sync.
- **Effects clean up after themselves:** the list request is cancelled with an `AbortController` if the page is left before it finishes. In development you will see the first request as *(canceled)*: that is React StrictMode mounting the page twice to test exactly this.

---

## Assumptions and decisions

The case study leaves some details open. These are the choices made:

**Request form**
- **Address to, "Alphanumeric":** letters, numbers and spaces are allowed, plus basic address punctuation `, . -` and line breaks. Taken literally, "alphanumeric" would reject the case study's own example ("Embassy of Neptun") because of its spaces.
- **Purpose, minimum 50 characters:** counted after trimming leading and trailing spaces, so 50 spaces don't pass. "Text area with styling" is implemented as a styled text area.
- **Issued on, "Future dates only":** today and later are accepted, and earlier days are disabled in the date picker. The same rule is also checked in code, because a date can still be typed by hand.
- **Employee ID, "Numeric only":** digits only, kept as text so leading zeros are preserved.
- **Date format sent to the API:** `M/D/YYYY` without leading zeros (e.g. `9/4/2026`), matching the dates returned by the list endpoint (e.g. `11/16/2022`).
- **Submit** is disabled until every field is valid; a hint explains why.

**Requests list**
- **Status sort order:** the status workflow isn't specified, so a workflow order was chosen: ascending *New → Under Review → Pending → Done*, descending the reverse. Unknown statuses are placed after these.
- **Issued on** sorts by real date. The default view is **latest first**. Dates are shown as `9 Dec 2022`, so they can't be misread as day/month vs month/day.
- **Reference No. filter** is an exact match (`5` does not match `50`). **Address to** matches when *every* typed word appears, in any order, ignoring case; partial words count (`emb` matches "Embassy"). **Status** is an exact match, and its options come from the data.
- **Reference numbers are not unique** in the API data (50 appears twice), so each row gets its own internal id for React.
- **The list is a mock:** it always returns the same 9 requests, so a request submitted through the form does not appear in the list.
- **Numbering:** the feature table calls the list feature **F03**, while its requirements are numbered **F04-R01…R04**. This project follows the requirement numbers.

**Out of scope (as stated in the case study)**
- Authentication: the user name in the top bar is a placeholder.
- Back-end APIs and security testing.

---

## API key and security note

The keys are kept out of Git (`.env` is git-ignored). However, **in a front-end-only app the keys are visible in the browser** when the app runs: Vite builds them into the JavaScript, and they appear in the request URL in the Network tab. For a real product, the API would be called through a small back end (proxy) that holds the key. That is outside the scope of this MVP, and the provided APIs are mocks.

For the same reason, **the publicly deployed build does not contain the API keys** (see [Deployment](#deployment-t-01)).

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
- The static website's **error document is `index.html`**, so deep links and refreshes (e.g. `/requests`) are served by the React app instead of an error page. (Technically those responses still carry HTTP status 404, which is how Storage serves its error document. Users don't notice, but monitoring tools or search engines would. A host with SPA routing rules, like Azure Static Web Apps, returns 200.)
- Why Azure Storage and not Azure Static Web Apps: Static Web Apps is not available in the regions allowed by the Azure for Students subscription used here. (The standard Static Web Apps deploy task also only runs on Linux agents, while the self-hosted agent is Windows.)

### Known limitation: the API calls don't work on the live site

The mock APIs only accept browser requests from **`http://localhost:3000`** (their CORS policy returns `Access-Control-Allow-Origin: http://localhost:3000`). On the hosted URL, the browser blocks the responses, so the live site shows its error states (*"We couldn't load your requests"*, and an error message on submit). The navigation, layout, form validation and responsive design can all be checked on the live site. **For the full experience, including the API calls, run the app locally** (see [Getting started](#getting-started)).

Because the API calls can't succeed there anyway, the **deployed build is made without the API keys**, so they are not published on a public website.

How this would be solved in a real project:
1. **Ask the API owners to allow the deployed origin** in the API's CORS policy (a configuration change in their Azure API Management). This is the normal fix.
2. **Or put a small back-end proxy in front of the API** (e.g. an Azure Function). The browser calls the proxy, and the proxy calls the API server-to-server, where CORS doesn't apply. This would also keep the API key off the client. It is not done here because building back-end APIs is out of scope for the case study.

---

## Git workflow

One branch per feature, named after the requirement IDs (e.g. `feature/F02-request-certificate`, `feature/F04-requests-list`). Each branch was merged into `main` through a pull request, and commit messages reference the requirement they implement (e.g. `F02-R02: …`).
