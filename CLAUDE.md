# Claude Development Guidelines

## Critical Testing Practices to Prevent Runtime Errors

### 1. Client Component Validation

**Issue**: Event handlers cannot be passed to Client Components without 'use client' directive
**Solution**: Always check components with interactive elements

#### Before implementing any component with event handlers:
```tsx
// ❌ WRONG - Will cause runtime error
export function Header({ locale }: HeaderProps) {
  return (
    <button onClick={() => console.log('clicked')}>
      Click me
    </button>
  )
}

// ✅ CORRECT - Properly marked as client component
'use client'

export function Header({ locale }: HeaderProps) {
  return (
    <button onClick={() => console.log('clicked')}>
      Click me
    </button>
  )
}
```

#### Testing Checklist:
1. **Scan for event handlers**: Search for `onClick`, `onChange`, `onSubmit`, etc.
2. **Verify 'use client' directive**: Ensure it's at the top of files with event handlers
3. **Check component imports**: Verify parent components can handle client components

### 2. Running and Testing the Application

#### Always test the application after making changes:
```bash
# 1. Start the development server
npm run dev

# 2. Check for compilation errors in the terminal
# 3. Open browser and verify no console errors
# 4. Test all interactive elements
```

#### Monitor for common errors:
- Client/Server component mismatches
- Missing translations
- Import errors
- Type mismatches

### 3. Translation Key Validation

**Issue**: Missing translation keys cause runtime errors
**Solution**: Always verify all translation keys exist

#### When adding new UI text:
```tsx
// 1. Check the translation key exists
const t = useTranslations('donation')
t('donateNow') // Verify this key exists in messages/en.json and messages/pt.json

// 2. Add to all locale files:
// messages/en.json
{
  "donation": {
    "donateNow": "Donate Now"
  }
}

// messages/pt.json
{
  "donation": {
    "donateNow": "Doar Agora"
  }
}
```

### 4. Pre-Commit Testing Protocol

Before committing any changes, run this testing sequence:

```bash
# 1. Type checking
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Start dev server and check for errors
npm run dev
# Watch for compilation errors
# Open http://localhost:3000 and check console

# 4. Build test
npm run build
# Ensure build completes without errors

# 5. Test critical user flows:
# - Navigate to homepage
# - Click interactive elements
# - Switch languages
# - Test forms
```

### 5. Component Architecture Best Practices

#### Server vs Client Components Decision Tree:
```
Does the component have:
- onClick, onChange, or other event handlers? → Use 'use client'
- useState, useEffect, or other React hooks? → Use 'use client'
- Browser-only APIs (window, document)? → Use 'use client'
- Only static content or server data fetching? → Keep as Server Component
```

### 6. Error Prevention Strategies

#### Use TypeScript Strictly:
```tsx
// Always type props
interface ComponentProps {
  locale: string
  data: SomeType
}

// Use proper return types
export function Component({ locale, data }: ComponentProps): JSX.Element {
  // ...
}
```

#### Validate Data Before Use:
```tsx
// Check for null/undefined
if (!data) {
  return <div>Loading...</div>
}

// Verify required fields
if (!t('requiredKey')) {
  console.error('Missing translation key: requiredKey')
}
```

### 7. Testing Commands Reference

```bash
# Development
npm run dev              # Start dev server (check for runtime errors)

# Validation
npm run lint            # Check code quality
npx tsc --noEmit       # Type checking
npm run build          # Production build test

# Testing specific routes
curl http://localhost:3000          # Test redirect
curl http://localhost:3000/en       # Test English route
curl http://localhost:3000/pt       # Test Portuguese route
curl http://localhost:3000/admin    # Test admin route
```

### 8. Common Pitfalls to Avoid

1. **Never assume a component works without testing**
   - Always run the dev server after creating components
   - Test all interactive elements

2. **Don't skip translation validation**
   - Check all locale files have matching keys
   - Test language switching

3. **Avoid mixing server and client logic**
   - Keep data fetching in server components
   - Keep interactivity in client components

4. **Don't ignore TypeScript errors**
   - Fix all type errors before committing
   - Use proper types, avoid 'any'

### 9. Debug Workflow

When encountering an error:

1. **Read the error message carefully**
   - Note the file and line number
   - Understand what type of error it is

2. **Check the browser console**
   - Look for additional error details
   - Check network tab for failed requests

3. **Review recent changes**
   - What files were modified?
   - What new components were added?

4. **Test incrementally**
   - Revert recent changes one by one
   - Test after each reversion

5. **Fix and verify**
   - Apply the fix
   - Test thoroughly
   - Check for side effects

### 10. Quality Assurance Checklist

Before considering any feature complete:

- [ ] Dev server runs without errors
- [ ] No console errors in browser
- [ ] All interactive elements work
- [ ] Language switching works
- [ ] Forms validate and submit correctly
- [ ] API endpoints return expected data
- [ ] Build completes successfully
- [ ] TypeScript has no errors
- [ ] Linter passes
- [ ] All routes are accessible

## Summary

The key to avoiding runtime errors is:
1. **Always test your changes** by running the dev server
2. **Check for errors** in both terminal and browser console
3. **Validate all interactive components** have 'use client' directive
4. **Ensure all translations** are present in all locale files
5. **Test user flows** before committing

Remember: It's better to catch errors during development than to have them appear at runtime!