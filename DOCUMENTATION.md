# My Notion — Documentation technique

Un clone minimaliste de Notion : créer des pages, les éditer avec un éditeur de blocs riche, leur attribuer un statut (à faire / en cours / fini), les organiser dans un tableau Kanban en glisser-déposer, et les supprimer en lot. Le tout enrobé d'animations soignées et d'un fond animé en WebGL.

---

## 1. Stack technique

| Domaine | Technologie | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | `16.2.9` |
| UI | [React](https://react.dev) | `19.2.4` |
| Langage | TypeScript | `^5` |
| Styles | [Tailwind CSS](https://tailwindcss.com) | `^4` |
| ORM | [Prisma](https://www.prisma.io) (+ adapter `@prisma/adapter-pg`) | `^7.8.0` |
| Base de données | PostgreSQL | — |
| Éditeur de texte | [BlockNote](https://www.blocknotejs.org) (core / mantine / react) | `^0.51.4` |
| Animations | [Motion](https://motion.dev) (ex-Framer Motion) | `^12.41.0` |
| Fond 3D | [Three.js](https://threejs.org) | `^0.184.0` |
| Police | Space Grotesk (`next/font/google`) | — |

> ⚠️ **Note (`AGENTS.md`)** : ce projet utilise une version récente de Next.js (16) avec des conventions qui peuvent différer des versions antérieures. Consulter `node_modules/next/dist/docs/` avant d'écrire du code.

---

## 2. Démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

Scripts disponibles (`package.json`) :

| Script | Action |
|---|---|
| `npm run dev` | Serveur de développement Next.js |
| `npm run build` | Build de production |
| `npm run start` | Démarre le build de production |
| `npm run lint` | Lint via ESLint |

### Variables d'environnement

Une variable est requise (lue dans `lib/prisma.ts` et `prisma.config.ts`) :

```env
# .env
DATABASE_URL="postgresql://user:password@host:5432/ma_base"
```

---

## 3. Architecture générale

```
my-notion/
├── app/                        # App Router (pages + composants + Server Actions)
│   ├── layout.tsx              # Layout racine : sidebar + fond animé + police
│   ├── template.tsx            # Animation de transition entre pages
│   ├── page.tsx                # Accueil "/"
│   ├── actions.ts              # Server Actions (CRUD des pages)
│   ├── globals.css             # Tailwind + animations CSS
│   │
│   ├── board/page.tsx          # Route "/board"   → vue Kanban
│   ├── all/page.tsx            # Route "/all"     → liste + suppression en lot
│   ├── pages/[id]/page.tsx     # Route "/pages/:id" → détail / édition d'une page
│   │
│   ├── Sidebar.tsx             # Navigation latérale (liste des pages)
│   ├── AnimatedBackground.tsx  # Fond WebGL (shader Three.js)
│   ├── Board.tsx               # Kanban drag & drop (client)
│   ├── AllPagesList.tsx        # Liste cochable + suppression en lot (client)
│   ├── CreatePageModal.tsx     # Modale de création de page (client)
│   ├── DeletePageButton.tsx    # Bouton + modale de confirmation suppression
│   ├── StatusSelector.tsx      # Boutons de changement de statut
│   ├── Editor.tsx              # Éditeur BlockNote (client, autosave debounce)
│   ├── EditorWrapper.tsx       # Charge l'éditeur en dynamic import (ssr:false)
│   └── generated/prisma/       # Client Prisma généré (ne pas éditer à la main)
│
├── lib/
│   └── prisma.ts               # Singleton du client Prisma
│
├── prisma/
│   ├── schema.prisma           # Modèles User & Page
│   └── migrations/             # Historique des migrations SQL
│
├── prisma.config.ts            # Config Prisma (chargement .env)
├── next.config.ts              # Config Next.js
└── eslint.config.mjs           # Config ESLint
```

### Modèle de rendu

- **Server Components** par défaut (`layout.tsx`, les `page.tsx` des routes) : ils interrogent directement la base via Prisma.
- **Client Components** (`"use client"`) pour tout ce qui est interactif : drag & drop, modales, éditeur, animations pilotées par l'état.
- **Server Actions** (`"use server"` dans `actions.ts`) pour les mutations, appelées directement depuis les composants client ou via `<form action={...}>`.

---

## 4. Base de données (Prisma)

Fichier : [prisma/schema.prisma](prisma/schema.prisma)

### Modèle `User`

| Champ | Type | Notes |
|---|---|---|
| `id` | `String` | clé primaire, `cuid()` |
| `email` | `String` | unique |
| `name` | `String?` | optionnel |
| `pages` | `Page[]` | relation 1-N |
| `createdAt` | `DateTime` | `now()` par défaut |

### Modèle `Page`

| Champ | Type | Notes |
|---|---|---|
| `id` | `String` | clé primaire, `cuid()` |
| `title` | `String` | défaut `"Sans titre"` |
| `icon` | `String?` | emoji, optionnel |
| `content` | `Json?` | document BlockNote sérialisé |
| `status` | `String` | défaut `"todo"` — valeurs : `todo`, `doing`, `done` |
| `parentId` | `String?` | auto-relation `PageTree` (sous-pages) |
| `parent` / `children` | `Page` / `Page[]` | arborescence, `onDelete: Cascade` |
| `userId` | `String` | propriétaire, `onDelete: Cascade` |
| `createdAt` / `updatedAt` | `DateTime` | horodatage |

Index sur `userId` et `parentId`.

> 💡 Le champ `status` n'est pas un enum Prisma mais une simple chaîne ; les valeurs valides sont conventionnellement `todo` / `doing` / `done` et sont gérées côté composants.

> 💡 La relation `PageTree` (sous-pages) existe au niveau du schéma mais n'est pas encore exploitée par l'interface.

### Migrations

| Migration | Contenu |
|---|---|
| `20260623082252_init` | Création des tables `User` et `Page` |
| `20260624091214_add_status` | Ajout de la colonne `status` (défaut `todo`) |

### Client Prisma — [lib/prisma.ts](lib/prisma.ts)

Singleton classique pour éviter de recréer un client à chaque hot-reload en développement. Utilise l'adapter PostgreSQL (`PrismaPg`) avec `DATABASE_URL`. Le client est généré dans `app/generated/prisma` (configuré dans `schema.prisma`).

---

## 5. Server Actions — [app/actions.ts](app/actions.ts)

Toutes les mutations passent par ces fonctions serveur. Tant qu'il n'y a **pas d'authentification**, un utilisateur de test fixe (`test@exemple.com`) est créé/récupéré via `upsert`.

| Fonction | Signature | Rôle |
|---|---|---|
| `createPage()` | `() => void` | Crée une page « Nouvelle page » pour l'utilisateur de test, revalide `/`. Utilisée par le `<form>` de la sidebar. |
| `createPageWithDetails(title, icon, status)` | `(string, string, string) => string` | Crée une page avec titre/icône/statut, **renvoie l'`id`** pour rediriger juste après. |
| `updatePageContent(id, content)` | `(string, unknown) => void` | Sauvegarde le document BlockNote. Passe par `JSON.parse(JSON.stringify(content))` pour neutraliser les `undefined` que Prisma 7 refuse dans les tableaux. |
| `updatePageTitle(id, title)` | `(string, string) => void` | Renomme une page, revalide `/pages/:id` et `/`. |
| `updatePageStatus(id, status)` | `(string, string) => void` | Change le statut, revalide `/` (pastilles de la sidebar). |
| `deletePage(id)` | `(string) => void` | Supprime une page. |
| `deletePages(ids)` | `(string[]) => void` | Suppression en lot (`deleteMany`). |

> ⚠️ **Sécurité / limites actuelles** : aucune vérification de propriété n'est faite sur `id` (n'importe quelle page peut être lue/modifiée/supprimée si on connaît l'id). À renforcer lors de l'ajout de l'authentification.

---

## 6. Routes (pages)

### `/` — Accueil — [app/page.tsx](app/page.tsx)
Client Component. Écran de bienvenue animé (emoji 👋, titre en dégradé) avec le bouton **Créer une page** (`CreatePageModal`).

### `/pages/[id]` — Détail d'une page — [app/pages/[id]/page.tsx](app/pages/[id]/page.tsx)
Server Component asynchrone. Récupère la page par `id` (404 via `notFound()` si absente). Affiche :
- un lien retour + `DeletePageButton` ;
- l'icône + un formulaire de renommage (Server Action inline `handleRename` → `updatePageTitle`) ;
- le `StatusSelector` ;
- l'éditeur via `EditorWrapper`.

`params` est une **Promise** (`await params`), conformément aux conventions récentes de Next.js.

### `/board` — Tableau Kanban — [app/board/page.tsx](app/board/page.tsx)
Server Component. Charge les pages (champs `id/title/icon/status`) et les passe au composant client `Board`.

### `/all` — Toutes mes pages — [app/all/page.tsx](app/all/page.tsx)
Server Component. Charge la liste et la passe à `AllPagesList` pour la sélection/suppression en lot.

---

## 7. Composants

### Layout & navigation

- **[app/layout.tsx](app/layout.tsx)** — Layout racine (Server Component). Charge/crée l'utilisateur de test, récupère ses pages, monte le fond animé, la sidebar, et le conteneur des `children` (avec `perspective: 1200px` pour les transitions 3D). Définit la police Space Grotesk et les métadonnées.
- **[app/template.tsx](app/template.tsx)** — `template.tsx` est re-monté à chaque navigation (contrairement à `layout.tsx`). Anime l'entrée de chaque page : balayage `clip-path`, rotation Y, flou et luminosité décroissants (effet « volet lumineux »).
- **[app/Sidebar.tsx](app/Sidebar.tsx)** — Client Component. Logo, bouton « Nouvelle page » (`<form action={createPage}>`), liens Accueil/Tableau/Toutes mes pages (état actif via `usePathname`), et liste des pages avec leur icône et une **pastille de couleur selon le statut** (`dotColor` : bleu/ambre/émeraude). Entrées animées en cascade.

### Création / édition / statut

- **[app/CreatePageModal.tsx](app/CreatePageModal.tsx)** — Modale de création : champ nom (validation `Enter`), sélecteur d'emoji (10 choix), sélecteur de statut. Appelle `createPageWithDetails` puis redirige vers la nouvelle page.
- **[app/StatusSelector.tsx](app/StatusSelector.tsx)** — Trois boutons (à faire / en cours / fini). État local optimiste + `updatePageStatus`.
- **[app/DeletePageButton.tsx](app/DeletePageButton.tsx)** — Bouton supprimer + modale de confirmation. Après suppression (`deletePage`), redirige vers `/`.

### Éditeur de blocs

- **[app/EditorWrapper.tsx](app/EditorWrapper.tsx)** — Charge `Editor` en `dynamic(..., { ssr: false })` car BlockNote dépend du DOM navigateur. Affiche un état de chargement.
- **[app/Editor.tsx](app/Editor.tsx)** — Instancie l'éditeur BlockNote (`useCreateBlockNote`) avec le contenu initial s'il existe. **Autosave avec debounce de 1 s** : à chaque `onChange`, un timer (`useRef`) déclenche `updatePageContent` 1 seconde après la dernière frappe.

### Vues

- **[app/Board.tsx](app/Board.tsx)** — Kanban à 3 colonnes (`todo`/`doing`/`done`) défini par la constante `COLUMNS` (couleurs par colonne). Drag & drop HTML5 natif (`draggable`, `onDragStart/Over/Leave/Drop`). État local optimiste (`setPages`) + persistance via `updatePageStatus`. Clic sur une carte → navigation vers la page. Animations Motion (`layout`, `AnimatePresence`, survol/tap).
- **[app/AllPagesList.tsx](app/AllPagesList.tsx)** — Liste cochable (state `Set<string>`), « tout sélectionner », badge de statut par ligne. Barre d'action flottante quand ≥ 1 sélection, modale de confirmation, puis `deletePages` + `router.refresh()`.

### Fond animé

- **[app/AnimatedBackground.tsx](app/AnimatedBackground.tsx)** — Fond plein écran en WebGL via Three.js (`position: fixed; -z-10`). Un quad plein écran peint par un **fragment shader GLSL** : volutes indigo/violet/bleu déformées en boucle, pulsation lumineuse pilotée par `u_time`. Boucle `requestAnimationFrame`, gestion du redimensionnement, et **nettoyage complet** (dispose renderer/geometry/material, retrait du canvas) au démontage.

> 💡 `globals.css` contient aussi des classes CSS d'« aurora » (`.animated-bg`, `.tech-grid`) ; le fond effectivement utilisé est la version Three.js.

---

## 8. Styles — [app/globals.css](app/globals.css)

- `@import "tailwindcss";` (Tailwind v4, configuré via PostCSS).
- Police de base système ; la police d'affichage Space Grotesk est exposée en variable CSS `--font-display` (utilisée par exemple dans le titre de `/all`).
- Keyframes `aurora` + classes utilitaires `.animated-bg` / `.tech-grid` (dégradé animé et grille technique).

---

## 9. Conventions de couleur des statuts

| Statut | Libellé | Couleur dominante |
|---|---|---|
| `todo` | À faire | bleu (`blue-500`) |
| `doing` | En cours | ambre (`amber-500`) |
| `done` | Fini | émeraude (`emerald-500`) |

Ces correspondances sont dupliquées dans plusieurs composants (`Sidebar`, `Board`, `AllPagesList`, `StatusSelector`, `CreatePageModal`). Centraliser ce mapping serait une amélioration possible.

---

## 10. Limites connues & pistes d'amélioration

- **Pas d'authentification** : un utilisateur de test unique (`test@exemple.com`) est partagé. Les Server Actions ne vérifient pas la propriété des pages.
- **Sous-pages** : la relation `PageTree` existe en base mais n'est pas utilisée dans l'UI.
- **Mapping des statuts dupliqué** dans plusieurs fichiers.
- **Revalidation** : certaines actions revalident `/` mais pas `/board` ni `/all` (les vues client se reposent sur l'état local optimiste et `router.refresh()`).
