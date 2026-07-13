---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
license: Complete terms in LICENSE.txt
---

# Web Application Testing

To test local web applications, write native Python Playwright scripts. This skill guides you through:
1. Writing Playwright test scripts for dynamic web apps
2. Handling server lifecycle management
3. Capturing screenshots and debugging UI behavior

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start servers manually, OR spawn them from the test script (see "Server Management Options")
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Server Management Options

**Option 1: Servers already running** (simplest)

Start your backend and frontend servers manually, then run the Playwright script:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL: Wait for JS to execute
    # ... your automation logic
    browser.close()
```

**Option 2: Programmatic server startup**

Spawn servers from your test script using subprocess:

```python
import subprocess
import time
import requests
from playwright.sync_api import sync_playwright

# Start backend
backend = subprocess.Popen(
    ["python", "-m", "uvicorn", "app.main:app", "--port", "8000"],
    cwd="./backend"
)

# Start frontend
frontend = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd="./frontend"
)

# Wait for servers to be ready
time.sleep(3)  # Give servers time to start
for attempt in range(10):
    try:
        requests.get('http://localhost:5173')
        break
    except:
        time.sleep(1)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        # ... your automation logic
        browser.close()
finally:
    backend.terminate()
    frontend.terminate()
    backend.wait()
    frontend.wait()
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Common Pitfall

Do NOT inspect the DOM before waiting for `networkidle` on dynamic apps. Always call `page.wait_for_load_state('networkidle')` first.

## Best Practices

- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`
- Screenshot first, then act — never guess at selectors in a dynamic app

## Golden Path to Test for the Booking Platform

Run these after each phase:

1. **Phase 3 (public pages):** Landing → click "Browse retreats" → see retreat card → click → see detail page
2. **Phase 4 (quiz + consultation):** Take dosha quiz → see recommendations → submit consultation form
3. **Phase 5 (booking):** Login → select dates → fill health intake → reach Stripe checkout
4. **Phase 7 (center admin):** Login as center_admin → see own retreats → not see other centers' data
5. **Phase 8 (platform admin):** Login as platform_admin → see pending centers → approve one
