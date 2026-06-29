# Weekly Report

Application web personnelle pour générer automatiquement le rapport hebdomadaire
d'activités, en remplacement de la saisie manuelle du PowerPoint.

On saisit les actions de la semaine (par jour, par projet/module), les
non-conformités et les prévisions, puis l'application produit un `.pptx` fidèle
au modèle existant et le convertit en `.pdf`.

## Fonctionnalités

- **Tableau de bord** — semaine ISO courante, dates, et historique des rapports
  (visualiser, télécharger en PPTX/PDF, supprimer).
- **Création / édition** — formulaire par jour (Lundi → Vendredi), plusieurs
  blocs `[Projet][Module]` par jour avec leurs tâches, bouton « Préremplir la
  semaine », zones libres non-conformités et prévisions.
- **Reformulation IA** — réécrit une tâche brute en phrase professionnelle prête
  pour le CTO. Couche d'abstraction (`services/ai`) : OpenAI aujourd'hui,
  remplaçable par Claude sans toucher aux appelants.
- **Génération PowerPoint** — reproduit le modèle à l'identique (logo, bandeaux,
  thème, polices) puis génère le PDF correspondant.
- **Historique JSON** — chaque rapport est rouvrable, modifiable, régénérable et
  exportable.
- **Bonus** — modèles de projets réutilisables, glisser-déposer des blocs entre
  les jours, import des commits Git, mode sombre, responsive.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · TailwindCSS v4 · shadcn/ui
(Base UI) · React Hook Form · Zod · Zustand · TanStack Query · date-fns ·
JSZip (PPTX) · LibreOffice (PDF) · OpenAI.

## Prérequis

- **Node.js 20+** et **npm**.
- **LibreOffice** installé et accessible (`soffice` dans le `PATH`) pour la
  conversion PDF. Vérifier avec `soffice --version`.
- Un **fournisseur IA** (facultatif — seulement pour la reformulation). Gratuit
  possible via Ollama ou Groq — voir [Reformulation IA](#reformulation-ia--options-gratuites).

## Installation

```bash
npm install
cp .env.example .env.local   # puis configurer le fournisseur IA (facultatif)
npm run dev                  # http://localhost:3000
```

### Variables d'environnement

| Variable          | Rôle                                              | Défaut        |
| ----------------- | ------------------------------------------------- | ------------- |
| `AI_PROVIDER`     | Fournisseur IA actif                              | `openai`      |
| `OPENAI_API_KEY`  | Clé API (côté serveur uniquement)                 | —             |
| `OPENAI_MODEL`    | Modèle utilisé                                    | `gpt-4o-mini` |
| `OPENAI_BASE_URL` | Endpoint compatible OpenAI (Ollama, Groq…)        | —             |
| `LIBREOFFICE_BIN` | Binaire LibreOffice si non standard               | `soffice`     |

## Reformulation IA — options gratuites

La reformulation est **optionnelle** : sans configuration, toute l'app
fonctionne, seuls les boutons « Reformuler » renvoient une erreur propre.

Le fournisseur est **compatible OpenAI** : il suffit de pointer `OPENAI_BASE_URL`
vers un endpoint compatible pour utiliser une solution gratuite, sans changer le
code (voir `src/services/ai`).

### Option A — Ollama (100 % local, gratuit, hors-ligne, privé)

```bash
ollama pull llama3.1            # ou un modèle plus léger : llama3.2:1b
```

```dotenv
# .env.local
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.1
OPENAI_API_KEY=ollama           # valeur factice, non vérifiée en local
```

### Option B — Groq (cloud, clé gratuite, aucune installation)

Clé gratuite sur [console.groq.com](https://console.groq.com).

```dotenv
# .env.local
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.1-8b-instant
OPENAI_API_KEY=gsk_...
```

### Option C — OpenAI (payant)

```dotenv
# .env.local
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

> La clé reste toujours côté serveur (route `/api/ai/rephrase`) et n'est jamais
> exposée au navigateur. `.env.local` est ignoré par git.

## Scripts

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm start        # sert le build de production
npm run lint     # ESLint
npx tsc --noEmit # vérification des types
```

## Comment ça marche

### PPTX — fidélité au modèle

Le design (logo, bandeaux colorés, thème, polices) vit dans le masque/layout du
PowerPoint. Plutôt que de le reconstruire, l'application part du modèle
`templates/weekly-report.pptx` et **réinjecte uniquement le texte** des zones
dynamiques : elle ouvre le `.pptx` (un zip) avec JSZip, régénère les paragraphes
des formes ciblées (en réutilisant les styles exacts extraits du modèle) et
re-zippe. Le reste du fichier est préservé à l'octet près.

Nom de fichier généré : `AAAA-WXX_week_Weekly Report_Prénom NOM.pptx`
(ex. `2026-W17_week_Weekly Report_Abdoulaye COULIBALY.pptx`).

> Pour changer la mise en page, modifiez `templates/weekly-report.pptx` dans
> PowerPoint. Si vous renommez des formes, mettez à jour la table `SHAPE` de
> `src/services/pptx/template.ts`.

### PDF

`convertPptxToPdf` lance LibreOffice en mode headless
(`soffice --headless --convert-to pdf`) dans un dossier temporaire isolé.

### Stockage

Les rapports sont stockés dans une base **SQLite** (`DATABASE_PATH`, défaut
`data/reports.db`), une ligne par rapport (JSON complet validé par Zod). C'est la
source de vérité lue par la génération PPTX/PDF. La couche `services/storage` est
*swappable* (un autre backend, ex. Postgres, se branche sans toucher aux appels).

## Architecture

Organisation *feature-first* : on regroupe par domaine, pas par type technique.

```
src/
  app/                  # pages + route handlers (API)
    api/reports/...      # CRUD + /pptx + /pdf
    api/ai/rephrase      # reformulation IA
    api/git/commits      # import des commits
  features/
    dashboard/           # tableau de bord
    report/              # schéma Zod (source de vérité), formulaire, hooks
    ai/                  # contrats IA côté client
    templates/           # modèles de projets (store Zustand)
    git/                 # import des commits
  services/
    ai/                  # abstraction fournisseur IA (server-only)
    pptx/                # génération PowerPoint
    pdf/                 # conversion LibreOffice (server-only)
    storage/             # stockage JSON (server-only)
    git/                 # lecture git log (server-only)
  lib/                  # utilitaires (semaine ISO, helpers API)
  providers/            # thème + TanStack Query
templates/              # modèle .pptx (asset livré avec l'app)
```

Le schéma `reportSchema` (Zod) dans `src/features/report/types/report.schema.ts`
est la **source de vérité unique** : tous les types TypeScript en dérivent.

## Déploiement

> ⚠️ L'app **n'est pas compatible serverless** (Vercel/Netlify) : elle a besoin
> de LibreOffice et d'un disque persistant. On déploie un **conteneur Docker**
> (Railway, Render, Fly.io, VPS, NAS…).

L'image embarque LibreOffice, le binaire natif `better-sqlite3`, le modèle
`templates/weekly-report.pptx` et le serveur Next en mode `standalone`. Les
données vivent dans un volume monté sur `/app/data`.

### Docker (local ou VPS)

```bash
docker compose up -d --build       # http://localhost:3000
# ou sans compose :
docker build -t weekly-report .
docker run -d -p 3000:3000 -v weekly-data:/app/data \
  --env-file .env.local weekly-report
```

### Railway

1. Nouveau projet → *Deploy from GitHub repo* (Railway détecte le `Dockerfile`).
2. Ajouter un **Volume** monté sur `/app/data` (persistance de la base SQLite).
3. Variables d'environnement : config IA (`OPENAI_BASE_URL`, `OPENAI_MODEL`,
   `OPENAI_API_KEY`) si la reformulation est souhaitée. `PORT` est fourni par
   Railway et respecté automatiquement.
4. Déployer. La config est dans `railway.toml`.

> LibreOffice consomme de la RAM à la conversion : prévoir un plan avec assez de
> mémoire (≥ 1 Go conseillé).

## Limites connues

- Sous LibreOffice headless sans la police *Wingdings*, les puces carrées
  s'affichent comme un « q ». Le balisage reste conforme au modèle ; PowerPoint
  affiche bien le carré.
- L'import Git exécute `git log` sur un chemin local fourni par l'utilisateur :
  prévu pour un usage personnel/local.
