# Script de Sincronização de Regras e Agentes para o Backend (api-sinalizego)
# Execução: powershell -ExecutionPolicy Bypass -File .\scripts\sync-backend-agents.ps1

$ErrorActionPreference = "Stop"

$frontendAgentsDir = "$PSScriptRoot\..\.agents"
$backendPath = "C:\Users\Antonio Gabriel\Desktop\api-sinalizego"
$backendAgentsDir = "$backendPath\.agents"
$backendDocsDir = "$backendPath\docs"

Write-Host "Iniciando sincronizacao de governanca de agentes para o backend..." -ForegroundColor Cyan

if (-Not (Test-Path $backendPath)) {
    Write-Warning "Diretorio do backend nao encontrado em: $backendPath"
    exit 1
}

# 1. Sincroniza .agents
if (-Not (Test-Path $backendAgentsDir)) {
    New-Item -ItemType Directory -Path $backendAgentsDir -Force | Out-Null
}

Copy-Item -Path "$frontendAgentsDir\*" -Destination $backendAgentsDir -Recurse -Force
Write-Host "[OK] Pasta .agents sincronizada com sucesso para $backendAgentsDir" -ForegroundColor Green

# 2. Sincroniza templates de docs para o backend
$docSubdirs = @("specs", "reviews", "qa")
foreach ($dir in $docSubdirs) {
    $targetDir = "$backendDocsDir\$dir"
    if (-Not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    $sourceDir = "$PSScriptRoot\..\docs\$dir"
    if (Test-Path $sourceDir) {
        Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force
    }
}
Write-Host "[OK] Pastas docs/ (specs, reviews, qa) sincronizadas com sucesso para $backendDocsDir" -ForegroundColor Green

Write-Host "`nEquipe de desenvolvimento sincronizada com sucesso para ambos os repositorios!" -ForegroundColor Cyan
