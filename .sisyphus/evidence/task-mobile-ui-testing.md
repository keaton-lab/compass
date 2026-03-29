# Testing & QA Plan

## Test Scenarios

### Mobile Search Toggle
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| M1 | Viewport <= 640px, load page | Search icon button visible, search input hidden |
| M2 | Tap search icon | Search panel animates in, input focused |
| M3 | Type in search | Results filter in real-time |
| M4 | Tap X button | Panel closes, focus returns to icon |
| M5 | Press Escape | Panel closes |
| M6 | Tap outside panel | Panel remains open (no action) |

### Desktop Search
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| D1 | Viewport > 640px, load page | Search input always visible |
| D2 | Toggle not visible | Only desktop search shown |

### ProfileHeader
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| P1 | Light mode, mobile | Text readable, proper contrast |
| P2 | Dark mode, mobile | Text readable, proper contrast |
| P3 | Light mode, desktop | Text readable, proper contrast |
| P4 | Dark mode, desktop | Text readable, proper contrast |

### Theme Toggle
| ID | Scenario | Expected Result |
|----|----------|-----------------|
| T1 | Toggle theme | ProfileHeader adapts to new theme |
| T2 | Persist theme | Theme survives page refresh |

## Manual Verification Checklist
- [ ] Mobile: search toggle works correctly
- [ ] Mobile: search panel opens/closes smoothly
- [ ] Desktop: search always visible
- [ ] Light mode: ProfileHeader readable
- [ ] Dark mode: ProfileHeader readable
- [ ] Theme toggle works
- [ ] No layout regressions at md+ breakpoints

## Automated Test Suggestions (Future)
```typescript
// Playwright example
test('mobile search toggle', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('[aria-controls="mobile-search"]')).toBeVisible();
  await expect(page.locator('#mobile-search input')).not.toBeVisible();
  await page.click('[aria-controls="mobile-search"]');
  await expect(page.locator('#mobile-search input')).toBeFocused();
});
```
