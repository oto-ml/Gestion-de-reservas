<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0736e669-e001-4b58-bc31-d89868cc23d1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Azure (Static Web Apps)

This project is a Vite + React SPA, so the recommended Azure target is **Azure Static Web Apps**.

### 1) Build locally (quick sanity check)

```powershell
npm install
npm run build
```

### 2) Create the Static Web App in your existing resource group

Use your current resource group (`LuminaResources`) and connect this GitHub repository:

```powershell
az login
az extension add --name staticwebapp --upgrade
az staticwebapp create `
   --name lumina-reservas-web `
   --resource-group LuminaResources `
   --location "East US 2" `
   --source "https://github.com/oto-ml/Gestion-de-reservas" `
   --branch main `
   --app-location "/" `
   --output-location "dist"
```

Azure will create a GitHub Actions workflow automatically and deploy on each push to `main`.

> **Note:** If Azure asks for a GitHub access token, create a GitHub Personal Access Token for the same account/repository.
> For a classic token, `repo` and `workflow` scopes are usually enough.
> For a fine-grained token, grant access to this repository with `Contents: Read and write`, `Workflows: Read and write`, and `Metadata: Read-only`.
> If you prefer not to use a token, you can connect the repo from the Azure Portal instead of the CLI.

### 3) Configure environment variables in Azure

If your build needs `GEMINI_API_KEY`, set it in the Static Web App Configuration as an application setting:

- Name: `GEMINI_API_KEY`
- Value: your real key

Then re-run the workflow from GitHub Actions.

### 4) SPA routing support

This repository includes `public/staticwebapp.config.json` so routes like `/staff/dashboard` and `/book` work correctly when opened directly.

## Deploy from GitHub Actions

This repo now includes `.github/workflows/deploy-lumina.yml` to deploy automatically to the Azure App Service `Lumina` on every push to `main`.

### Required GitHub secret

Add this secret in your GitHub repository settings:

- `AZURE_WEBAPP_PUBLISH_PROFILE`: download the publish profile from the Azure Portal for the `Lumina` Web App and paste the XML contents here.

### What the workflow does

- Installs dependencies with `npm ci`
- Builds the Vite app with `npm run build`
- Packs only `server.js`, `package.json`, and `dist/`
- Deploys that package to Azure App Service

### One-time Azure check

If the app does not start automatically after deployment, set the Startup Command in Azure App Service to:

```bash
node server.js
```
