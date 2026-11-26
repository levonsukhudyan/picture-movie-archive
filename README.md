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

- Movies: YTS API v2 (`list_movies.json` for search and pagination, `movie_details.json` for an individual movie). No API key required.
- Pictures: Wikimedia Commons MediaWiki API (`generator=search` and `imageinfo` for results; Commons file page for the source). No API key required.

Search happens after form submission. Each request is built from the current search term and page; a React effect fetches and parses JSON, while aborting stale requests when the query changes. Results open into individual detail views.
