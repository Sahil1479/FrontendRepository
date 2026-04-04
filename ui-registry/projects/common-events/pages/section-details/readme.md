# Section Details Page — Implementation Guide

## Overview

The **Section Details** page is a comprehensive UI for managing geographical sections with their associated settings (timezone, measurement units, and behavior flags). This page includes:

- **Create Form** — Add new sections with full configuration
- **Data Table** — View, search, sort, edit, and delete sections
- **Edit Modal** — Modify existing section details
- **Delete Modal** — Confirm and remove sections

This document guides developers on integration and customization.

---

## Page Structure

### 1. **Create Form Card** (`sc-form-card`)

The form is organized into 4 logical sections with responsive grid layouts:

#### **Section Details Row**
- **Section Code** (required) — Unique identifier, auto-uppercased, filtered to alphanumeric + hyphens
- **Section Name** (required) — User-friendly display name

**Layout**: 2 columns on desktop → 1 column on mobile

```html
<div class="sc-grid-row sc-grid-row--2col">
  <!-- Code field -->
  <!-- Name field -->
</div>
```

#### **Geography Row**
- **Geography** (required, select) — Region selection
- **Country** (required, select) — Auto-populated based on geography
- **Time Zone** (required, select) — UTC offset with timezone names

**Layout**: 3 columns on desktop → 2 columns on tablet → 1 column on mobile

```html
<div class="sc-grid-row sc-grid-row--3col">
  <!-- Geography, Country, Time Zone -->
</div>
```

#### **Measurement Units Row**
- **Weight Unit** — Auto-set by geography
- **Area Unit** — Auto-set by geography
- **Distance Unit** — Auto-set by geography

**Layout**: 3 columns on desktop → 2 columns on tablet → 1 column on mobile

```html
<div class="sc-grid-row sc-grid-row--3col">
  <!-- Weight, Area, Distance Units -->
</div>
```

#### **Behaviour Row**
- **Is Active** (toggle) — Section availability for selection
- **Multiple Events** (toggle) — Allow multiple events support

**Layout**: 2 columns on desktop → Stack vertically on mobile

```html
<div class="sc-grid-row sc-grid-row--2col">
  <!-- Is Active toggle -->
  <!-- Multiple Events toggle -->
</div>
```

---

## DOM References & Their Purposes

### Create Form Inputs

```javascript
// Alert container for page-level messages
const alertsEl = document.getElementById('scAlerts');

// Field wrappers (for error state management)
const fldCode        = document.getElementById('fldCode');
const fldName        = document.getElementById('fldName');
const fldGeography   = document.getElementById('fldGeography');
const fldTimezone    = document.getElementById('fldTimezone');
const fldCountry     = document.getElementById('fldCountry');

// Input fields (user data)
const inCode         = document.getElementById('scCode');
const inName         = document.getElementById('scName');
const inGeography    = document.getElementById('scGeography');
const inAreaUnit     = document.getElementById('scAreaUnit');
const inDistUnit     = document.getElementById('scDistUnit');
const inWeightUnit   = document.getElementById('scWeightUnit');
const inTimezone     = document.getElementById('scTimezone');
const inCountry      = document.getElementById('scCountry');

// Toggle inputs & labels
const inActive              = document.getElementById('scActive');
const activeLabel           = document.getElementById('scActiveLabel');
const inMultipleEvents      = document.getElementById('scMultipleEvents');
const multipleEventsLabel   = document.getElementById('scMultipleEventsLabel');

// Buttons
const submitBtn = document.getElementById('scSubmitBtn');
const resetBtn  = document.getElementById('scResetBtn');
```

| Variable | Type | Purpose |
|----------|------|---------|
| `alertsEl` | Container | Display form validation/success messages |
| `fld*` | Field wrapper | Apply error states (red border, error text) |
| `in*` | Input/Select | Collect user data |
| `*Label` | Span | Display toggle state as readable text |
| `submitBtn`, `resetBtn` | Button | Trigger submit/reset actions |

---

## Key Features

### 1. **Auto-Uppercase Section Code**

```javascript
inCode.addEventListener('input', e => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
});
```

- Automatically converts to uppercase
- Filters out special characters (only alphanumeric + hyphens allowed)
- Real-time validation feedback

### 2. **Geography-Based Defaults**

When a geography is selected, measurement units automatically update:

```javascript
const GEO_DEFAULTS = {
  'south-asia':     { area: 'sqm',   dist: 'km',    weight: 'kg'  },
  'north-america':  { area: 'sqft',  dist: 'miles', weight: 'lbs' },
  // ... more mappings
};

inGeography.addEventListener('change', () => {
  applyGeoDefaults(inGeography.value, inAreaUnit, inDistUnit, inWeightUnit, inCountry);
});
```

**What happens**:
- User selects geography → units auto-set
- Country dropdown populates based on geography
- Example: "North America" → sq feet, miles, lbs

### 3. **Dynamic Country Population**

```javascript
function populateCountries(selectEl, geoValue, selectedCountry = '') {
  const countries = GEO_COUNTRIES[geoValue] || [];
  selectEl.innerHTML = '<option value="">— Select country —</option>';
  countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    selectEl.appendChild(opt);
  });
}
```

- Countries dropdown updates based on selected geography
- Empty if no geography selected

### 4. **Field Validation**

**Create Form Validation Rules**:

```javascript
function validateCreate() {
  // Section Code: required, alphanumeric + hyphens, must be unique
  // Section Name: required, non-empty
  // Geography: required, must have value
  // Timezone: required, must have value
  // Country: required, must have value
}
```

**Edit Form Validation Rules**:
- Same as create, but code is read-only

### 5. **Toggle Label Sync**

Labels update in real-time when toggle state changes:

```javascript
inActive.addEventListener('change', () => {
  activeLabel.textContent = inActive.checked ? 'Active' : 'Inactive';
});

inMultipleEvents.addEventListener('change', () => {
  multipleEventsLabel.textContent = inMultipleEvents.checked 
    ? 'Supported' 
    : 'Not Supported';
});
```

---

## Alert System

Uses **UIAlert** component for consistent notifications:

```javascript
// Success alert (auto-dismisses after 5 seconds)
UIAlert.showInContainer(alertsEl, 'success', 'Section created successfully.', undefined, 5000);

// Error alert (persistent)
UIAlert.showInContainer(alertsEl, 'error', 'Please fix highlighted fields before submitting.');
```

**Alert Types**:
- `success` — Green, with auto-dismiss
- `error` — Red, persistent until manually cleared

---

## Data Table

### Columns

| Column | Key | Sortable | Render |
|--------|-----|----------|--------|
| Code | `code` | ✓ | Code pill (monospace background) |
| Name | `name` | ✓ | Plain text |
| Geography | `geography` | ✓ | Title-cased (e.g., "South Asia") |
| Country | `country` | ✓ | Country name |
| Multiple Events | `multipleEvents` | ✓ | Badge ("Yes" / "No") |
| Status | `active` | ✓ | Badge ("Active" / "Inactive") |

### Actions

Each row has edit/delete buttons:
- **Edit** — Opens modal to modify section
- **Delete** — Opens confirmation modal

### Search

- **Keys**: `code`, `name`, `country`, `geography`
- Real-time filtering as user types

---

## Modals

### Edit Modal (`editModal`)

**Purpose**: Update existing section details

**Fields**:
- Code (read-only) — "Code cannot be changed after creation"
- Name (required)
- Geography (required) — Auto-updates units & countries
- Timezone (required)
- Country (required)
- Area/Distance/Weight Units (optional)
- Is Active & Multiple Events (toggles)

**Layout**: Same responsive grid as create form

### Delete Modal (`deleteModal`)

**Purpose**: Confirm section deletion

**Shows**:
- Icon + warning message
- Section name & code in description
- Cancel / Delete buttons

**Behavior**:
- Cannot be undone
- Removes from table and database

---

## Responsive Breakpoints

| Breakpoint | View | Changes |
|-----------|------|---------|
| **1200px+** | Desktop | 2-3 column grids, full-width layout |
| **900-1200px** | Tablet | 4-col → 2-col, 3-col → 2-col grids |
| **768-900px** | Tablet (small) | Form max-width adjusts, padding reduced |
| **640-768px** | Mobile | All grids → single column, toggles stack |
| **<640px** | Mobile (small) | Modal actions stack vertically |

**Layout**:
- Form always appears **above** table
- Form has max-width constraint on desktop
- Table becomes full-width on mobile

---

## API Integration

The page includes 3 simulated API calls. Replace with real backend endpoints:

```javascript
// CREATE
const apiCreate = data => new Promise(r => 
  setTimeout(() => r({ id: nextId++, ...data }), 700)
);

// UPDATE
const apiUpdate = (id, data) => new Promise((res, rej) => 
  setTimeout(() => {
    // Your logic here
    res({ id, ...data });
  }, 800)
);

// DELETE
const apiDelete = id => new Promise((res, rej) => 
  setTimeout(() => {
    // Your logic here
    res({ deleted: true });
  }, 600)
);
```

### Expected Payloads

**CREATE/UPDATE Payload**:
```javascript
{
  code:           "SEC-01",              // string (unique on create)
  name:           "North Region",        // string
  geography:      "south-asia",          // string
  country:        "India",               // string
  timezone:       "UTC+5:30",            // string
  areaUnit:       "sqm",                 // string
  distUnit:       "km",                  // string
  weightUnit:     "kg",                  // string
  active:         true,                  // boolean
  multipleEvents: true                   // boolean
}
```

**CREATE Response**:
```javascript
{
  id: 6,                  // new ID assigned by backend
  ...payload              // echo payload back
}
```

---

## Reference Data

### Geographies & Countries

```javascript
const GEO_COUNTRIES = {
  'south-asia':     ['India','Pakistan','Bangladesh','Sri Lanka','Nepal','Bhutan','Maldives','Afghanistan'],
  'southeast-asia': ['Thailand','Vietnam','Indonesia','Philippines','Malaysia','Singapore','Myanmar','Cambodia','Laos','Brunei','Timor-Leste'],
  'middle-east':    ['Saudi Arabia','UAE','Qatar','Kuwait','Bahrain','Oman','Jordan','Lebanon','Iraq','Iran','Syria','Yemen','Israel'],
  // ... more regions
};
```

### Timezones

Supports 16 timezones across regions:
- UTC+5:30 (India, Sri Lanka)
- UTC-8:00 (Pacific US)
- UTC+1:00 (Central Europe)
- etc.

---

## State Management

### Seed Data

Page loads with 5 sample sections (update `seedData` array):

```javascript
const seedData = [
  { id:1, code:'SEC-01', name:'North Region', ... },
  { id:2, code:'SEC-02', name:'South Region', ... },
  // ...
];
```

### ID Generation

```javascript
let nextId = seedData.length + 1;  // Starts at 6 for new records
```

---

## Error Handling

### Validation Errors

Shown inline on fields:
```javascript
function setErr(fieldEl, inputEl, msg) {
  fieldEl.classList.add('ui-field--error');  // Red border
  const errEl = fieldEl.querySelector('.ui-field__err');
  if (errEl) errEl.textContent = msg;
}
```

### API Errors

Shown in alert container (page or modal):
```javascript
catch (err) {
  UIAlert.showInContainer(alertsEl, 'error', err.message);
}
```

**Example**: "Server error: failed to save. Please try again."

---