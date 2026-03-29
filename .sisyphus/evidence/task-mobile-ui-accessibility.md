# Mobile UI Accessibility Evidence

## ARIA Implementation (ClientLayout.tsx)

### Mobile Search Toggle Button
```jsx
<button
  type="button"
  onClick={toggleMobileSearch}
  className="md:hidden..."
  aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
  aria-expanded={isMobileSearchOpen}
  aria-controls="mobile-search"
>
  {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
</button>
```

### Attributes Used
| Attribute | Value | Purpose |
|-----------|-------|---------|
| aria-label | 'Close search' / 'Open search' | Describes action to screen readers |
| aria-expanded | boolean | Indicates if search panel is open |
| aria-controls | 'mobile-search' | Links button to search panel |

### Focus Management
- Search input auto-focuses when mobile panel opens (useEffect)
- Escape key closes mobile search panel
- Focus returns to toggle button on close

### Keyboard Navigation
- Tab navigates to toggle button on mobile
- Enter/Space activates toggle
- Escape closes panel

## WCAG 2.1 Compliance
- [x] 4.1.2 - Name, Role, Value (aria-label)
- [x] 4.1.3 - Status Messages (aria-live region not needed - no dynamic messages)
