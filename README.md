# Picture / Movie Archive

A responsive React app for searching films and photographs, then opening a detail view for an individual result. The UI is inspired by the supplied Picture Movie Database reference.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

The repository includes a GitHub Actions workflow that builds and deploys the app to GitHub Pages on pushes to `main`.

## Public APIs

- Movies: Testing APIs Movies (`/api/Movies` for search and pagination, `/api/Movies/{id}` for one film). No API key required. This learning API has a small sample catalog and placeholder poster images.
- Pictures: Wikimedia Commons MediaWiki API (`generator=search` and `imageinfo` for results; Commons file page for the source). No API key required.

The movie API is intended for practice projects; it has a limited sample catalog rather than a full commercial movie database. Its poster URLs are sample images.

Search happens after form submission. Each request is built from the current search term and page; a React effect fetches and parses JSON, while aborting stale requests when the query changes. Results open into individual detail views.
