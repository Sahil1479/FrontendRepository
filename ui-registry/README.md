# UI Registry

A reusable frontend component library for any web project.  
**Plain HTML · CSS · JavaScript — zero frameworks, zero build tools, zero external dependencies.**

Open `index.html` directly in any browser. No server needed.

---

## Directory Structure

```
ui-registry/
├── index.html                              ← Component registry & live demos
├── README.md
│
├── assets/
│   └── theme.css                           ← Design tokens (CSS custom properties)
│
├── components/
│   ├── textbox/
│   │   ├── textbox.html                    ← Copy-paste snippet
│   │   ├── textbox.css
│   │   └── textbox.js                      → exposes UITextbox
│   │
│   ├── password-input/
│   │   ├── password-input.html
│   │   ├── password-input.css
│   │   └── password-input.js               → exposes UIPassword
│   │
│   ├── multiselect-dropdown/
│   │   ├── multiselect-dropdown.html
│   │   ├── multiselect-dropdown.css
│   │   └── multiselect-dropdown.js         → exposes UIMultiselect
│   │
│   ├── button/
│   │   ├── button.html
│   │   ├── button.css
│   │   └── button.js                       → exposes UIButton
│   │
│   └── alert/
│       ├── alert.html
│       ├── alert.css
│       └── alert.js                        → exposes UIAlert
│
└── projects/
    └── common-events/                      ← Example project
        └── pages/
            └── login/
                └── login.html              ← Self-contained login page
```

---

## Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| CSS classes | `ui-` prefix | `.ui-btn`, `.ui-field`, `.ui-alert` |
| CSS variables | `--ui-` prefix | `--ui-primary`, `--ui-border` |
| JS globals | `UI` prefix | `UITextbox`, `UIButton`, `UIAlert` |
| data attributes | descriptive, no prefix | `data-field`, `data-pw-toggle`, `data-ms-opt` |

---

## Using a Component

### 1 — Link stylesheets in `<head>`
```html
<link rel="stylesheet" href="../../assets/theme.css" />
<link rel="stylesheet" href="../../components/textbox/textbox.css" />
```

### 2 — Copy the HTML from the component's `.html` snippet file

### 3 — Load scripts before `</body>`
```html
<script src="../../components/textbox/textbox.js"></script>
```

For self-contained pages (no server, opened as `file://`) inline the CSS inside a `<style>` tag and the JS inside a `<script>` tag — see `projects/common-events/pages/login/login.html` for a complete example.

---

## JavaScript APIs

### UITextbox
```js
UITextbox.validate(fieldEl, { required, minLength, maxLength, pattern, patternMsg, label })
UITextbox.setError(fieldEl, 'message')
UITextbox.clearError(fieldEl)
UITextbox.getValue(fieldEl)     // → trimmed string
```

### UIPassword
```js
UIPassword.validate(fieldEl, { required, minLength })
UIPassword.getValue(fieldEl)    // → raw (untrimmed) string
UIPassword.show(fieldEl)
UIPassword.hide(fieldEl)
UIPassword.setError(fieldEl, 'message')
UIPassword.clearError(fieldEl)
```

### UIMultiselect
```js
UIMultiselect.validate(fieldEl, { required })
UIMultiselect.getValues(fieldEl)   // → string[]
UIMultiselect.setError(fieldEl, 'message')
UIMultiselect.clearError(fieldEl)
UIMultiselect.open(fieldEl)
UIMultiselect.close(fieldEl)
```

### UIButton
```js
UIButton.setLoading(btnEl, true | false)
UIButton.setDisabled(btnEl, true | false)
```

### UIAlert
```js
UIAlert.create(type, message, title?, dismissible?)   // → HTMLElement
UIAlert.showInContainer(containerEl, type, message, title?, autoDismissMs?)
UIAlert.show(alertEl)
UIAlert.hide(alertEl)
UIAlert.setMessage(alertEl, title, message)
// type: 'error' | 'warning' | 'success' | 'info'
```

---

## Theming

All design values are CSS custom properties in `assets/theme.css`.  
Override at `:root` in your project's stylesheet to retheme everything at once:

```css
:root {
  --ui-primary:       #0056d2;   /* change brand colour */
  --ui-primary-dark:  #0041a8;
  --ui-primary-light: #e6f0ff;
  --ui-primary-glow:  rgba(0,86,210,.18);
}
```

---

## Adding a New Project

1. Create `projects/<your-project>/` 
2. Add pages under `projects/<your-project>/pages/<page-name>/`
3. Each page is a self-contained `.html` file — inline the component CSS and JS, then write your page-specific styles and logic
4. Link back from `index.html` in the Projects section

---

## Browser Support

All modern browsers (Chrome, Firefox, Safari, Edge).
