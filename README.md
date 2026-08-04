# Static Web Project

## Run locally

Simply open `index.html` in your browser.

Or use VS Code Live Server.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload all files to the repository root.
3. Commit and push:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

4. Open:

Settings → Pages

5. Configure:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

6. Save.

Your site will be available at:

```
https://YOUR_USERNAME.github.io/REPOSITORY_NAME/
```

No build tools, bundlers, or frameworks are required.