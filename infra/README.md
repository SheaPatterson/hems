# HEMS Ops Center — Azure Infrastructure

Bicep templates for provisioning all Azure resources.

## Resources Provisioned

- Azure Key Vault (Standard)
- Azure Application Insights + Log Analytics
- Azure SQL Database (Standard S1, 20 DTU)
- Azure Cosmos DB (autoscale 400–4000 RU/s, 3 containers)
- Azure Blob Storage (GPv2, Hot tier) + CDN (Standard Microsoft)
- Azure Functions Premium Plan (EP1, Node.js 20)
- Azure SignalR Service (Standard, autoscale at 500 connections)
- Azure API Management (Consumption tier)
- Azure OpenAI Service (GPT-4o deployment)
- Azure Speech Service (Standard S0)

## Deployment

```bash
# Staging
az group create -n rg-hemsops-staging -l eastus
az deployment group create \
  -g rg-hemsops-staging \
  -f main.bicep \
  -p @parameters/staging.bicepparam

# Production
az group create -n rg-hemsops-production -l eastus
az deployment group create \
  -g rg-hemsops-production \
  -f main.bicep \
  -p @parameters/production.bicepparam
```

Set `SQL_ADMIN_PASSWORD` as an environment variable before deploying.
