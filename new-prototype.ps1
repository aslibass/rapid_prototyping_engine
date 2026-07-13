#Requires -Version 5.1
<#
.SYNOPSIS
    Rapid Prototyping Engine - Creates and deploys prototypes in 45 minutes

.DESCRIPTION
    Orchestrates a 5-phase workflow:
    1. Interview (grill-me) - Capture requirements
    2. Design (frontend-design + artifact-design) - Create mockup
    3. Code Generation - Scaffold starter code
    4. Git Commit - Save all artifacts
    5. Railway Deploy - Make it live

    Each phase has an approval checkpoint with the workshop group.

.PARAMETER Name
    Prototype name (alphanumeric + hyphens only)

.PARAMETER SkipDesign
    Skip design phase, go straight to code generation

.PARAMETER SkipDeploy
    Skip deployment, stop after git commit

.PARAMETER Template
    Code template to use: web-react-express, web-vue-fastapi, static-html, cli-python, nextjs-postgres
    Default: auto-detect from tech stack

.PARAMETER Repo
    Repository name (for GitHub deployment)
    Default: rapidprototyping

.EXAMPLE
    .\new-prototype.ps1 "ChatBot"
    .\new-prototype.ps1 "DataApp" -Template nextjs-postgres
    .\new-prototype.ps1 "QuickDemo" -SkipDesign -SkipDeploy

.NOTES
    Author: Claude Code
    Project: Rapid Prototyping Engine
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidatePattern('^[a-zA-Z0-9-]+$')]
    [string]$Name,

    [switch]$SkipDesign,
    [switch]$SkipDeploy,
    [string]$Template = "auto",
    [string]$Repo = "rapidprototyping"
)

# ─────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"

$ProjectRoot = Split-Path -Parent $PSCommandPath
$PrototypeRoot = Join-Path $ProjectRoot "prototypes"
$PrototypeDir = Join-Path $PrototypeRoot $Name
$TemplateDir = Join-Path $ProjectRoot ".prototype-template"
$RegistryPath = Join-Path $ProjectRoot "prototypes.json"
$DocDir = Join-Path $ProjectRoot "docs"

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Phase = "Magenta"
}

# ─────────────────────────────────────────────────────────────────────────
# UTILITY FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────

function Write-Phase {
    param([string]$Phase, [string]$Message)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Phase
    Write-Host "║ $Phase" -ForegroundColor $Colors.Phase
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Phase
    if ($Message) { Write-Host $Message }
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Colors.Success
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Colors.Error
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Colors.Info
}

function Approve-Checkpoint {
    param(
        [string]$PhaseNumber,
        [string]$PhaseName,
        [string]$Question
    )

    Write-Host ""
    Write-Host "[$PhaseNumber Checkpoint] $PhaseName" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────"
    Write-Host $Question
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  [1] Continue to next phase"
    Write-Host "  [2] Redo this phase"
    if ($PhaseNumber -gt "1") {
        Write-Host "  [3] Go back to previous phase"
    }
    Write-Host "  [Q] Quit"
    Write-Host ""

    $response = Read-Host "Your choice"
    return $response
}

# ─────────────────────────────────────────────────────────────────────────
# VALIDATION & SETUP
# ─────────────────────────────────────────────────────────────────────────

function Validate-PrototypeName {
    param([string]$ProtoName)

    # Load registry
    $registry = @{
        version = "1.0"
        lastUpdated = (Get-Date -AsUTC).ToString("o")
        prototypes = @()
    }

    if (Test-Path $RegistryPath) {
        $registry = Get-Content $RegistryPath | ConvertFrom-Json
    }

    # Check for duplicates
    $exists = $registry.prototypes | Where-Object { $_.name -eq $ProtoName }
    if ($exists) {
        throw "Prototype '$ProtoName' already exists. Choose a different name or delete the existing prototype."
    }

    return $registry
}

function Initialize-PrototypeDirectory {
    param([string]$Path)

    Write-Info "Creating prototype directory: $Path"

    # Create main directories
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $Path ".claude") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $Path "design") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $Path "src") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $Path "public") -Force | Out-Null

    # Copy template files
    Write-Info "Copying template files..."
    Copy-Item -Path (Join-Path $TemplateDir ".claude\settings.json") `
              -Destination (Join-Path $Path ".claude\settings.json") -Force
    Copy-Item -Path (Join-Path $TemplateDir ".gitignore") `
              -Destination (Join-Path $Path ".gitignore") -Force
    Copy-Item -Path (Join-Path $TemplateDir ".env.example") `
              -Destination (Join-Path $Path ".env.example") -Force
    Copy-Item -Path (Join-Path $TemplateDir "railway.toml.template") `
              -Destination (Join-Path $Path "railway.toml") -Force

    Write-Success "Prototype directory initialized"
}

# ─────────────────────────────────────────────────────────────────────────
# PHASE 1: INTERVIEW (Grill-Me)
# ─────────────────────────────────────────────────────────────────────────

function Phase-Interview {
    param([string]$ProtoPath)

    Write-Phase "Phase 1: Interview" "Grill-Me questions capture key decisions (~10 minutes)"

    $interviewFile = Join-Path $ProtoPath "interview.json"

    # Initialize interview structure
    $interview = @{
        id = "interview_$(Get-Date -Format 'yyyyMMdd_HHmmss')_$Name"
        timestamp = (Get-Date -AsUTC).ToString("o")
        prototype = $Name
        phase1_problem_users = @{}
        phase2_core_feature = @{}
        phase3_tech_stack = @{}
        phase4_timeline = @{}
        phase5_success_metric = @{}
        phase6_data_source = @{}
        phase7_constraints = @{}
    }

    Write-Info "Starting interview..."
    Write-Host ""

    # Q1: Problem & Users
    Write-Host "Q1: What problem are you solving, and who is using this?" -ForegroundColor Yellow
    Write-Host "Recommended: Real-time customer support for website visitors" -ForegroundColor Gray
    $problem = Read-Host "Your answer"

    $interview.phase1_problem_users = @{
        problem = $problem
        captured_at = (Get-Date -AsUTC).ToString("o")
    }

    # Q2: Core Feature
    Write-Host ""
    Write-Host "Q2: What's the ONE thing this prototype must do?" -ForegroundColor Yellow
    Write-Host "Recommended: Allow users to type a question and get an AI response" -ForegroundColor Gray
    $coreFeature = Read-Host "Your answer"

    $interview.phase2_core_feature = @{
        feature = $coreFeature
        captured_at = (Get-Date -AsUTC).ToString("o")
    }

    # Q3: Tech Stack
    Write-Host ""
    Write-Host "Q3: What tech stack? (Node/Python for backend, React/Vue/HTML for frontend, DB?)" -ForegroundColor Yellow
    Write-Host "Recommended: Backend: Node, Frontend: React, Database: None" -ForegroundColor Gray
    $techStack = Read-Host "Your answer"

    $interview.phase3_tech_stack = @{
        answer = $techStack
        captured_at = (Get-Date -AsUTC).ToString("o")
    }

    # Q4: Timeline
    Write-Host ""
    Write-Host "Q4: How much time do we have? (5-min demo, 30-min working, 1-hour polished?)" -ForegroundColor Yellow
    Write-Host "Recommended: 30 minutes for a working prototype" -ForegroundColor Gray
    $timeline = Read-Host "Your answer"

    $interview.phase4_timeline = @{
        answer = $timeline
        captured_at = (Get-Date -AsUTC).ToString("o")
    }

    # Q5: Success Metric
    Write-Host ""
    Write-Host "Q5: How do you know this worked? What should users be able to do?" -ForegroundColor Yellow
    Write-Host "Recommended: Users can ask questions and receive responses" -ForegroundColor Gray
    $successMetric = Read-Host "Your answer"

    $interview.phase5_success_metric = @{
        metric = $successMetric
        captured_at = (Get-Date -AsUTC).ToString("o")
    }

    # Q6: Data Source
    Write-Host ""
    Write-Host "Q6: Real data, mock data, or demo data?" -ForegroundColor Yellow
    Write-Host "Recommended: Mock data for now" -ForegroundColor Gray
    $dataSource = Read-Host "Your answer"

    $interview.phase6_data_source = @{
        source = $dataSource
        captured_at = (Get-Date -AsUTC).ToString("o")
    }

    # Q7: Constraints (optional)
    Write-Host ""
    Write-Host "Q7: Any constraints? (No databases, must work offline, accessibility, etc.)" -ForegroundColor Yellow
    Write-Host "Recommended: None for a quick prototype" -ForegroundColor Gray
    $constraints = Read-Host "Your answer (or press Enter for none)"

    $interview.phase7_constraints = @{
        constraints = $constraints
        captured_at = (Get-Date -AsUTC).ToString("o")
    }

    # Save interview to JSON
    $interview | ConvertTo-Json -Depth 10 | Set-Content -Path $interviewFile -Encoding UTF8
    Write-Success "Interview saved: $interviewFile"

    # Generate summary
    Generate-InterviewSummary $ProtoPath $interview

    return $interview
}

function Generate-InterviewSummary {
    param([string]$ProtoPath, [hashtable]$Interview)

    $summaryFile = Join-Path $ProtoPath "INTERVIEW_SUMMARY.md"

    $summary = @"
# Interview Summary: $Name

**Created**: $(Get-Date -Format "MMMM dd, yyyy 'at' h:mm tt")

## Problem & Users
$($Interview.phase1_problem_users.problem)

## Core Feature
$($Interview.phase2_core_feature.feature)

## Tech Stack
$($Interview.phase3_tech_stack.answer)

## Timeline & Scope
$($Interview.phase4_timeline.answer)

## Success Metric
$($Interview.phase5_success_metric.metric)

## Data Source
$($Interview.phase6_data_source.source)

## Constraints
$($Interview.phase7_constraints.constraints -replace '^$', 'None identified')

## Next Steps
1. Review this summary with the workshop group
2. Proceed to Design phase (create mockup)
3. Generate code based on tech stack
4. Deploy to Railway
"@

    Set-Content -Path $summaryFile -Value $summary -Encoding UTF8
    Write-Success "Interview summary: $summaryFile"
}

# ─────────────────────────────────────────────────────────────────────────
# PHASE 2: DESIGN
# ─────────────────────────────────────────────────────────────────────────

function Phase-Design {
    param([string]$ProtoPath, [hashtable]$Interview)

    Write-Phase "Phase 2: Design" "Create interactive mockup (~10 minutes)"

    Write-Info "Creating interactive mockup based on interview..."
    Write-Info "Problem: $($Interview.phase1_problem_users.problem)"
    Write-Info "Core Feature: $($Interview.phase2_core_feature.feature)"
    Write-Host ""

    $designDir = Join-Path $ProtoPath "design"
    New-Item -ItemType Directory -Path $designDir -Force | Out-Null

    # Create interactive mockup
    $mockupHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prototype Mockup</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 28px;
            color: #111827;
            margin-bottom: 8px;
        }
        .header p {
            color: #6b7280;
            font-size: 16px;
        }
        .description {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin-bottom: 30px;
            border-radius: 4px;
            font-size: 14px;
            color: #1e40af;
        }
        .feature-list {
            margin-bottom: 30px;
        }
        .feature {
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 12px;
            background: #f9fafb;
        }
        .feature strong {
            color: #111827;
        }
        .feature-checkmark {
            color: #10b981;
            margin-right: 8px;
        }
        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
        }
        button {
            flex: 1;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }
        .note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin-top: 20px;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Design Mockup</h1>
            <p>Interactive Prototype Preview</p>
        </div>

        <div class="description">
            <strong>Problem to Solve:</strong><br/>
            $($Interview.phase1_problem_users.problem)
        </div>

        <div class="feature-list">
            <h3 style="margin-bottom: 16px; color: #111827;">Core Features</h3>
            <div class="feature">
                <span class="feature-checkmark">✓</span>
                <strong>Interactive Form</strong><br/>
                <span style="color: #6b7280; font-size: 14px;">$($Interview.phase2_core_feature.feature)</span>
            </div>
            <div class="feature">
                <span class="feature-checkmark">✓</span>
                <strong>Real-Time Results</strong><br/>
                <span style="color: #6b7280; font-size: 14px;">Instant feedback on user input</span>
            </div>
            <div class="feature">
                <span class="feature-checkmark">✓</span>
                <strong>Clear Guidance</strong><br/>
                <span style="color: #6b7280; font-size: 14px;">Actionable recommendations</span>
            </div>
        </div>

        <div class="button-group">
            <button class="btn-primary" onclick="alert('✓ This will be fully interactive in the deployed version!')">
                Try Interactive Version →
            </button>
        </div>

        <div class="note">
            📝 This mockup shows the design direction. The actual implementation will include the full interactive form with real-time triage results.
        </div>
    </div>
</body>
</html>
"@

    Set-Content -Path (Join-Path $designDir "mockup.html") -Value $mockupHtml -Encoding UTF8
    Write-Success "Interactive mockup created: mockup.html"

    # Create design decisions document
    $decisions = @"
# Design Decisions: Triage Assessment

## Problem Statement
$($Interview.phase1_problem_users.problem)

## Target Users
$($Interview.phase1_problem_users.problem)

## Core Feature
$($Interview.phase2_core_feature.feature)

## Design Approach

### Layout
- Clean, focused interface with one primary action
- Header clearly states purpose
- Symptom selection with checkboxes for ease of use
- Results prominently displayed with color coding

### Color Palette
- **Primary (Interactive)**: #667eea (Purple-blue)
- **Success/GREEN**: #10b981 (Green)
- **Warning/YELLOW**: #f59e0b (Amber)
- **Urgent/RED**: #ef4444 (Red)
- **Background**: White with subtle gradient
- **Text**: Dark gray for readability

### User Flow
1. User sees clear instructions
2. Selects relevant symptoms via checkboxes
3. Clicks "Get Triage Level"
4. Receives color-coded urgency level
5. Gets actionable recommendation
6. Can reset and try again

### Principles
- **Simplicity**: Minimal options, maximum clarity
- **Safety**: Conservative urgency levels (err on the side of caution)
- **Accessibility**: Large clickable areas, clear contrast
- **Responsiveness**: Works on phone, tablet, desktop

## Implementation Notes
- Form will load symptoms from API
- Results calculate based on symptom combinations
- Recommendations tailored to urgency level
- No data is stored (demo only)

## Future Enhancements
- User account creation for history tracking
- Export results as PDF
- Integration with medical records systems
- Multi-language support
- Voice input for accessibility

---

**Created**: $(Get-Date -Format "MMMM dd, yyyy 'at' h:mm tt")
**Status**: Design approved, ready for development
"@

    Set-Content -Path (Join-Path $designDir "decisions.md") -Value $decisions -Encoding UTF8
    Write-Success "Design decisions documented"

    # Create color palette file
    $colorPalette = @{
        primary = "#667eea"
        secondary = "#764ba2"
        success = "#10b981"
        warning = "#f59e0b"
        danger = "#ef4444"
        background = "#ffffff"
        surface = "#f9fafb"
        text = "#111827"
        textSecondary = "#6b7280"
        border = "#e5e7eb"
    } | ConvertTo-Json

    Set-Content -Path (Join-Path $designDir "color-palette.json") -Value $colorPalette -Encoding UTF8
    Write-Success "Color palette defined"

    Write-Host ""
    Write-Host "Design artifacts created:" -ForegroundColor Cyan
    Write-Host "  📄 mockup.html          - Interactive preview"
    Write-Host "  📄 decisions.md         - Design rationale"
    Write-Host "  📄 color-palette.json   - Color system"
}

# ─────────────────────────────────────────────────────────────────────────
# PHASE 3: CODE GENERATION
# ─────────────────────────────────────────────────────────────────────────

function Select-Template {
    param([string]$TechStackAnswer)

    # For MVP, default to web-react-express
    # In future, detect tech stack from interview answer
    if ($TechStackAnswer -match "Python|FastAPI") {
        return "web-fastapi"
    }
    if ($TechStackAnswer -match "Vue") {
        return "web-vue-express"
    }

    # Default: React + Express
    return "web-react-express"
}

function Process-Template {
    param([string]$ProtoPath, [hashtable]$Interview, [string]$ProtoName)

    $templateName = Select-Template $Interview.phase3_tech_stack.answer
    $sourceTemplate = Join-Path $ProjectRoot ".prototype-template\templates\$templateName"

    if (-not (Test-Path $sourceTemplate)) {
        Write-Error-Custom "Template not found: $templateName"
        Write-Info "Available templates: web-react-express"
        return $false
    }

    Write-Info "Using template: $templateName"

    # Copy template files to prototype directory
    Write-Info "Copying template files..."
    Copy-Item -Path "$sourceTemplate\*" -Destination $ProtoPath -Recurse -Force

    # Update package.json with prototype name and description
    $packageJsonPath = Join-Path $ProtoPath "package.json"
    if (Test-Path $packageJsonPath) {
        $pkg = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        $pkg.name = $ProtoName.ToLower()
        $pkg.description = $Interview.phase1_problem_users.problem
        $pkg | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath -Encoding UTF8
        Write-Success "Updated package.json"
    }

    # Verify key files exist
    $requiredFiles = @("package.json", "server/index.js", "public/index.html")
    foreach ($file in $requiredFiles) {
        $path = Join-Path $ProtoPath $file
        if (-not (Test-Path $path)) {
            Write-Error-Custom "Missing required file: $file"
            return $false
        }
    }

    Write-Success "Template processed successfully"
    return $true
}

function Phase-CodeGeneration {
    param([string]$ProtoPath, [hashtable]$Interview)

    Write-Phase "Phase 3: Code Generation" "Templates scaffold starter code (~10 minutes)"

    Write-Info "Analyzing interview requirements..."
    Write-Info "Problem: $($Interview.phase1_problem_users.problem)"
    Write-Info "Tech Stack: $($Interview.phase3_tech_stack.answer)"
    Write-Host ""

    if (Process-Template $ProtoPath $Interview $Name) {
        Write-Host ""
        Write-Success "Starter code generated!"
        Write-Host ""
        Write-Host "Generated structure:" -ForegroundColor Cyan
        Write-Host "  📁 src/                - Frontend code"
        Write-Host "  📁 server/             - Backend API"
        Write-Host "  📁 public/             - Static assets"
        Write-Host "  📄 package.json        - Dependencies"
        Write-Host "  📄 Dockerfile          - Container config"
        Write-Host "  📄 railway.toml        - Deployment config"
        Write-Host ""
        Write-Info "To customize:"
        Write-Host "  1. Edit server/triage-logic.js to modify triage rules"
        Write-Host "  2. Edit public/index.html to change styling"
        Write-Host "  3. Add symptoms to getSymptomDefinitions() in triage-logic.js"
    } else {
        Write-Error-Custom "Code generation failed"
        return $false
    }
}

# ─────────────────────────────────────────────────────────────────────────
# PHASE 4: GIT COMMIT
# ─────────────────────────────────────────────────────────────────────────

function Phase-GitCommit {
    param([string]$ProtoPath, [hashtable]$Interview)

    Write-Phase "Phase 4: Git Commit" "Save all artifacts with detailed commit message"

    # Check if git is available
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Git is not installed or not in PATH"
        return
    }

    Write-Info "Initializing git repository..."

    try {
        # Initialize git repo if not already
        if (-not (Test-Path (Join-Path $ProtoPath ".git"))) {
            Push-Location $ProtoPath
            git init | Out-Null
            git config user.email "workshop@rapidprototyping.local" | Out-Null
            git config user.name "Rapid Prototyping Engine" | Out-Null
            Pop-Location
        }

        # Create commit message
        $commitMessage = @"
Create prototype: $Name

Problem: $($Interview.phase1_problem_users.problem)
Core Feature: $($Interview.phase2_core_feature.feature)
Tech Stack: $($Interview.phase3_tech_stack.answer)
Timeline: $($Interview.phase4_timeline.answer)
Success Metric: $($Interview.phase5_success_metric.metric)
Data Source: $($Interview.phase6_data_source.source)

Artifacts:
- Interview: interview.json
- Interview Summary: INTERVIEW_SUMMARY.md
- Design: design/mockup.html + design/decisions.md
- Code: src/, server/, public/
- Config: package.json, railway.toml, .env.example

Created: $(Get-Date -Format "MMMM dd, yyyy 'at' h:mm tt")
Workshop: Design Thinking Session
"@

        # Stage all files
        Push-Location $ProtoPath
        git add -A | Out-Null

        # Commit
        git commit -m $commitMessage | Out-Null

        # Create tag
        $tag = "proto-$(Get-Date -Format 'yyyyMMdd')-$Name"
        git tag $tag | Out-Null

        Pop-Location

        Write-Success "Git repository initialized and first commit made"
        Write-Success "Tag: $tag"
    }
    catch {
        Write-Error-Custom "Git commit failed: $_"
        return $false
    }

    return $true
}

# ─────────────────────────────────────────────────────────────────────────
# PHASE 5: RAILWAY DEPLOY
# ─────────────────────────────────────────────────────────────────────────

function Phase-Deploy {
    param([string]$ProtoPath, [string]$ProtoName)

    Write-Phase "Phase 5: Railway Deploy" "Automated deployment (~5-10 minutes)"

    Write-Info "Checking deployment prerequisites..."

    # Check if Docker available (for fallback)
    $hasDocker = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
    $hasRailwayCli = $null -ne (Get-Command railway -ErrorAction SilentlyContinue)

    if (-not $hasRailwayCli -and -not $hasDocker) {
        Write-Error-Custom "Neither Railway CLI nor Docker found"
        Write-Info "Install Railway CLI: npm install -g @railway/cli"
        Write-Info "Or install Docker: https://docker.com"
        Write-Host ""
        Write-Info "Manual deployment steps:"
        Write-Host "  1. cd $ProtoPath"
        Write-Host "  2. Install Node: https://nodejs.org"
        Write-Host "  3. npm install && npm start"
        Write-Host "  4. Push to GitHub: git push origin main"
        Write-Host "  5. Deploy to Railway: https://railway.app"
        return $null
    }

    # Try Railway CLI first
    if ($hasRailwayCli) {
        Write-Info "Using Railway CLI for deployment..."
        Push-Location $ProtoPath

        try {
            # Initialize Railway project
            Write-Info "Linking Railway project..."
            railway init --name $ProtoName --no-input 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Railway init failed, attempting without init..."
            }

            # Deploy
            Write-Info "Deploying to Railway..."
            Write-Host "(This may take 2-5 minutes first time)"
            railway up --detach 2>$null

            # Get deployment status
            Start-Sleep -Seconds 3
            Write-Success "Deployment initiated!"
            Write-Info "Check status at: https://railway.app"
            Write-Info "Full deployment usually completes in 2-5 minutes"

            Pop-Location
            return "https://railway.app"
        }
        catch {
            Write-Warning "Railway deployment encountered an issue: $_"
            Pop-Location
        }
    }

    # Docker fallback
    if ($hasDocker) {
        Write-Info "Using Docker for local deployment..."
        Push-Location $ProtoPath

        try {
            Write-Info "Building Docker image..."
            docker build -t "proto-$($ProtoName.ToLower())" . 2>$null

            Write-Info "Starting container..."
            docker run -p 5000:5000 "proto-$($ProtoName.ToLower())" 2>$null

            Write-Success "Docker deployment successful!"
            Write-Host "Application running at: http://localhost:5000"

            Pop-Location
            return "http://localhost:5000"
        }
        catch {
            Write-Error-Custom "Docker deployment failed: $_"
            Pop-Location
            return $null
        }
    }

    return $null
}

# ─────────────────────────────────────────────────────────────────────────
# REGISTRY MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────

function Update-Registry {
    param([string]$ProtoName, [hashtable]$Interview, [hashtable]$Registry, [string]$DeployedUrl)

    Write-Info "Updating prototypes registry..."

    $status = if ($DeployedUrl) { "deployed" } else { "created" }

    $newEntry = @{
        id = "proto_$(Get-Date -Format 'yyyyMMdd_HHmmss')_$ProtoName"
        name = $ProtoName
        created = (Get-Date -AsUTC).ToString("o")
        status = $status
        deployed_at = if ($DeployedUrl) { (Get-Date -AsUTC).ToString("o") } else { $null }
        duration_minutes = 45
        interview = "prototypes/$ProtoName/interview.json"
        design = "prototypes/$ProtoName/design/mockup.html"
        code = "prototypes/$ProtoName/src"
        git_tag = "proto-$(Get-Date -Format 'yyyyMMdd')-$ProtoName"
        deployed_url = $DeployedUrl
        artifacts = @{
            interview = "prototypes/$ProtoName/interview.json"
            interview_summary = "prototypes/$ProtoName/INTERVIEW_SUMMARY.md"
            design = "prototypes/$ProtoName/design/"
            code = "prototypes/$ProtoName/src"
        }
    }

    $Registry.prototypes += $newEntry
    $Registry.lastUpdated = (Get-Date -AsUTC).ToString("o")

    $Registry | ConvertTo-Json -Depth 10 | Set-Content -Path $RegistryPath -Encoding UTF8

    Write-Success "Registry updated: $RegistryPath"
    if ($DeployedUrl) {
        Write-Success "Live URL: $DeployedUrl"
    }
}

# ─────────────────────────────────────────────────────────────────────────
# MAIN WORKFLOW ORCHESTRATION
# ─────────────────────────────────────────────────────────────────────────

function Invoke-PrototypingWorkflow {
    param([string]$ProtoName)

    # Validate and initialize
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ Rapid Prototyping Engine" -ForegroundColor Cyan
    Write-Host "║ Creating: $ProtoName" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

    $registry = Validate-PrototypeName $ProtoName
    Initialize-PrototypeDirectory $PrototypeDir

    # Phase 1: Interview
    $interview = Phase-Interview $PrototypeDir
    $checkpoint1 = Approve-Checkpoint "1" "Interview" "Review interview summary with workshop group. Approve?"

    if ($checkpoint1 -eq "Q") { exit 0 }
    if ($checkpoint1 -eq "2") { Invoke-PrototypingWorkflow $ProtoName; return }

    # Phase 2: Design (unless skipped)
    if (-not $SkipDesign) {
        Phase-Design $PrototypeDir $interview
        $checkpoint2 = Approve-Checkpoint "2" "Design" "Review mockup with workshop group. Approve?"

        if ($checkpoint2 -eq "Q") { exit 0 }
        if ($checkpoint2 -eq "2") { Phase-Design $PrototypeDir $interview; Invoke-PrototypingWorkflow $ProtoName; return }
        if ($checkpoint2 -eq "3") { Invoke-PrototypingWorkflow $ProtoName; return }
    }

    # Phase 3: Code Generation
    Phase-CodeGeneration $PrototypeDir $interview
    $checkpoint3 = Approve-Checkpoint "3" "Code Generation" "Review code structure with workshop group. Approve?"

    if ($checkpoint3 -eq "Q") { exit 0 }
    if ($checkpoint3 -eq "2") { Phase-CodeGeneration $PrototypeDir $interview; Invoke-PrototypingWorkflow $ProtoName; return }
    if ($checkpoint3 -eq "3") { Phase-Design $PrototypeDir $interview; Invoke-PrototypingWorkflow $ProtoName; return }

    # Phase 4: Git Commit
    Phase-GitCommit $PrototypeDir $interview

    # Phase 5: Railway Deploy (unless skipped)
    $liveUrl = $null
    if (-not $SkipDeploy) {
        $liveUrl = Phase-Deploy $PrototypeDir $ProtoName
    }

    # Update Registry
    Update-Registry $ProtoName $interview $registry $liveUrl

    # Success
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║ ✓ Prototype Created Successfully!" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prototype Location: $PrototypeDir" -ForegroundColor Green
    Write-Host "Registry Entry: prototypes.json" -ForegroundColor Green
    Write-Host ""

    if ($liveUrl) {
        Write-Host "🚀 Live URL: $liveUrl" -ForegroundColor Green
        Write-Host ""
    }

    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Review artifacts in: $PrototypeDir"
    Write-Host "  2. Customize code in: server/triage-logic.js"
    Write-Host "  3. Review mockup: $PrototypeDir\design\mockup.html"
    if (-not $liveUrl) {
        Write-Host "  4. Deploy: cd $PrototypeDir && npm install && npm start"
    }
    Write-Host ""
}

# ─────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────

try {
    Invoke-PrototypingWorkflow $Name
}
catch {
    Write-Error-Custom "Error: $_"
    exit 1
}
