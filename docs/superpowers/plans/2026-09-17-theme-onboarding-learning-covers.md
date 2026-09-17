# Theme, Onboarding, and Learning Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver persistent Light, Dark, and System themes across every current flow, a one-time per-user investment-familiarity onboarding, and polished per-image presentation for learning covers 1, 2, 3, and 7.

**Architecture:** A root `ThemeProvider` resolves a persisted preference into a semantic palette consumed by theme-aware style factories. A separate onboarding service stores a versioned result per Firebase `userId`, while a root gate owns navigation to auth, onboarding, or tabs. Learning covers retain their source images but gain explicit presentation metadata consumed by a reusable layered cover component.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router 57, React 19, AsyncStorage 2.2, Expo Image 57, Reanimated 4, TypeScript 6.

**Spec:** `docs/superpowers/specs/2026-09-17-theme-onboarding-learning-covers-design.md`

## Global Constraints

- Read and follow the exact Expo SDK 57 documentation before implementation.
- Preserve the existing Light theme appearance.
- Keep yellow brand colors, typography, spacing, radii, and visual hierarchy.
- Do not collect sensitive financial data or implement suitability.
- Store onboarding locally per `userId`; do not sync it to Firestore in this sprint.
- All existing routes, modules, sheets, cards, charts, inputs, and buttons must work in Light and Dark themes.
- Learning remains voluntary and completed modules remain reviewable.
- Preserve unrelated user changes in the dirty worktree.

---

## File Structure

### New theme files

- `src/theme/palettes.ts`: Light and Dark semantic color definitions.
- `src/contexts/ThemeContext.tsx`: preference persistence, System resolution, and provider.
- `src/hooks/useAppTheme.ts`: stable public hook for palette consumption.
- `src/components/ThemeSelector.tsx`: accessible three-option control used by Profile.

### New onboarding files

- `src/domain/onboarding.ts`: versioned onboarding types.
- `src/services/onboarding.service.ts`: per-user AsyncStorage persistence.
- `src/contexts/OnboardingContext.tsx`: load/save/retry state for the authenticated user.
- `src/hooks/useOnboarding.ts`: public onboarding hook.
- `src/screens/OnboardingScreen.tsx`: single-screen familiarity choice.
- `app/onboarding.tsx`: thin Expo Router route.
- `src/components/AppEntryGate.tsx`: central auth/onboarding/tabs redirect decision.

### Modified theme consumers

- Root/navigation: `app/_layout.tsx`, `app/index.tsx`, `app/(auth)/_layout.tsx`, `app/(tabs)/_layout.tsx`
- Shared UI: every file in `src/components` importing `src/theme/tokens`
- Screens: every file in `src/screens` importing `src/theme/tokens`
- Profile: `src/screens/ProfileScreen.tsx`
- Auth redirects: `src/screens/LoginScreen.tsx`, `src/screens/RegisterScreen.tsx`

### Modified learning files

- `src/domain/learning.ts`
- `src/services/learning.service.ts`
- `src/screens/LearningCover.tsx`
- `src/screens/LearningScreen.tsx`
- `src/screens/LearningModuleScreen.tsx`

---

### Task 1: Theme domain, palettes, and persistence

**Files:**
- Create: `src/theme/palettes.ts`
- Create: `src/contexts/ThemeContext.tsx`
- Create: `src/hooks/useAppTheme.ts`
- Modify: `src/theme/tokens.ts`

**Interfaces:**
- Produces: `ThemePreference = 'light' | 'dark' | 'system'`
- Produces: `ResolvedTheme = 'light' | 'dark'`
- Produces: `AppColors`
- Produces: `useAppTheme(): { preference; resolvedTheme; colors; setPreference; isLoading }`

- [ ] **Step 1: Define palette types and preserve the current palette verbatim**

```ts
export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const lightColors = {
  primary: '#F0B429',
  primaryDark: '#C49214',
  black: '#0D0D0D',
  background: '#EFEDE8',
  surface: '#FBFBF9',
  text: '#0D0D0D',
  textMuted: '#6B7280',
  border: '#E8E6E0',
  borderSubtle: '#F0EEE9',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F5F3EE',
  surfaceWarm: '#F7F1E3',
  surfaceFeature: '#EDE0C4',
  danger: '#B42318',
  success: '#067647',
  warning: '#B54708',
  neutral: '#79716B',
} as const;

export type AppColors = { [K in keyof typeof lightColors]: string };
```

- [ ] **Step 2: Add a Dark palette using the same semantic keys**

```ts
export const darkColors: AppColors = {
  primary: '#F0B429',
  primaryDark: '#E0A51F',
  black: '#F7F5F0',
  background: '#0D0D0D',
  surface: '#151515',
  text: '#F7F5F0',
  textMuted: '#A9A59E',
  border: '#34322F',
  borderSubtle: '#292724',
  surfaceElevated: '#1D1D1D',
  surfaceMuted: '#242321',
  surfaceWarm: '#292318',
  surfaceFeature: '#342B1A',
  danger: '#F97066',
  success: '#47CD89',
  warning: '#FDB022',
  neutral: '#A9A29D',
};
```

- [ ] **Step 3: Implement persistence and System resolution**

```ts
const THEME_KEY = '@mercado-fiis/theme-preference';

function resolveTheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): ResolvedTheme {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}
```

Use `useColorScheme()`, load `THEME_KEY` once, validate stored values, default to
`system`, persist through `AsyncStorage.setItem`, and expose the resolved palette.

- [ ] **Step 4: Verify theme foundation**

Run: `npm.cmd run typecheck`

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit**

```powershell
git add src/theme/palettes.ts src/theme/tokens.ts src/contexts/ThemeContext.tsx src/hooks/useAppTheme.ts
git commit -m "feat: add persistent semantic themes"
```

---

### Task 2: Root shell, navigation, and shared primitives

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`
- Modify: `app/(auth)/_layout.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `src/components/Button.tsx`
- Modify: `src/components/Container.tsx`
- Modify: `src/components/Typography.tsx`
- Modify: `src/components/Input.tsx`
- Modify: `src/components/ScreenHeader.tsx`
- Modify: remaining `src/components/*.tsx` files importing static colors

**Interfaces:**
- Consumes: `useAppTheme()` from Task 1.
- Produces: all shared UI primitives responding immediately to palette changes.

- [ ] **Step 1: Mount ThemeProvider above AuthProvider**

```tsx
<ThemeProvider>
  <AuthProvider>
    <ThemedRootNavigation />
  </AuthProvider>
</ThemeProvider>
```

`ThemedRootNavigation` must set `StatusBar` to `light` in Dark and `dark` in
Light, and use `colors.background` for Stack content.

- [ ] **Step 2: Convert each shared component to a palette style factory**

```ts
function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
    },
  });
}

const { colors } = useAppTheme();
const styles = useMemo(() => createStyles(colors), [colors]);
```

Retain typography, spacing, radii, layout, and all Light values.

- [ ] **Step 3: Audit primitives for contrast**

Verify explicitly:

- Primary button: yellow background with dark readable label in both themes.
- Secondary button: high-contrast surface and label.
- Outline button: theme text/border, no hard-coded black.
- Input: themed surface, text, placeholder, focus, error, and password action.
- Container fades: gradient begins at current `colors.background`.
- Typography defaults to `colors.text`, not static `colors.text`.

- [ ] **Step 4: Verify root and shared UI**

Run: `npm.cmd run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add app src/components
git commit -m "feat: apply themes to navigation and shared UI"
```

---

### Task 3: Migrate every current feature flow to semantic themes

**Files:**
- Modify: all files returned by `rg -l "from '@/src/theme/tokens'" src/screens src/components app`
- Modify: chart and badge components containing hard-coded Light-only colors.

**Interfaces:**
- Consumes: themed primitives and `useAppTheme()`.
- Produces: all existing screens visually complete in both resolved themes.

- [ ] **Step 1: Migrate authentication and profile screens**

Convert `LoginScreen`, `RegisterScreen`, and `ProfileScreen` to style factories.
Replace explicit `colors.black` used as text with `colors.text` unless the
element is intentionally on a yellow brand surface.

- [ ] **Step 2: Migrate all tab screens**

Convert:

- `HomeScreen.tsx`
- `PortfolioScreen.tsx`
- `FundsScreen.tsx`
- `LearningScreen.tsx`
- `ProfileScreen.tsx`

Keep Light output unchanged.

- [ ] **Step 3: Migrate all stack and detail screens**

Convert:

- fund and holding details;
- planner;
- rankings;
- news;
- Tesouro comparison;
- learning module route;
- generic module/empty states.

- [ ] **Step 4: Audit charts, badges, overlays, and sheets**

Replace Light-only literals such as `#FFFFFF`, `#2A2A2A`, and translucent black
fills where they represent semantic surfaces. Keep asset colors and brand colors
unchanged. Confirm chart axes, legends, tooltips, scrims, and sheet handles remain visible.

- [ ] **Step 5: Confirm no static palette consumers remain**

Run:

```powershell
rg -n "import .*colors.*from '@/src/theme/tokens'" app src
rg -n "backgroundColor: '#(FFF|FFFFFF|FBFBF9|EFEDE8)'" app src
npm.cmd run typecheck
```

Expected: no static color imports in rendered components, no unexplained
Light-only surface literals, and typecheck PASS.

- [ ] **Step 6: Commit**

```powershell
git add app src
git commit -m "feat: theme all application flows"
```

---

### Task 4: Add the Profile theme selector

**Files:**
- Create: `src/components/ThemeSelector.tsx`
- Modify: `src/components/index.ts`
- Modify: `src/screens/ProfileScreen.tsx`

**Interfaces:**
- Consumes: `preference` and `setPreference` from `useAppTheme()`.
- Produces: accessible options `light`, `dark`, and `system`.

- [ ] **Step 1: Build the selector**

```ts
const options: Array<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];
```

Each option uses `accessibilityRole="radio"`,
`accessibilityState={{ selected }}`, a minimum 44-point touch target, and the
current theme palette.

- [ ] **Step 2: Add an “Aparência” section to Profile**

Show the selector below account information and add explanatory copy:
“Sistema acompanha automaticamente a aparência do seu dispositivo.”

- [ ] **Step 3: Verify immediate switching and persistence**

Manually switch Claro → Escuro → Sistema, navigate across tabs, restart the web
bundle, and confirm the selected preference remains.

- [ ] **Step 4: Commit**

```powershell
git add src/components/ThemeSelector.tsx src/components/index.ts src/screens/ProfileScreen.tsx
git commit -m "feat: add profile theme selector"
```

---

### Task 5: Onboarding domain, storage, and authenticated gate

**Files:**
- Create: `src/domain/onboarding.ts`
- Create: `src/services/onboarding.service.ts`
- Create: `src/contexts/OnboardingContext.tsx`
- Create: `src/hooks/useOnboarding.ts`
- Create: `src/components/AppEntryGate.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`

**Interfaces:**
- Produces: `InvestmentFamiliarity = 'beginner' | 'experienced'`
- Produces: `OnboardingResult = { version: 1; familiarity; completedAt }`
- Produces: `getOnboardingResult(userId): Promise<OnboardingResult | null>`
- Produces: `saveOnboardingResult(userId, familiarity): Promise<OnboardingResult>`
- Produces: `useOnboarding(): { result; isLoading; error; complete; retry }`

- [ ] **Step 1: Define versioned types**

```ts
export type InvestmentFamiliarity = 'beginner' | 'experienced';

export interface OnboardingResult {
  version: 1;
  familiarity: InvestmentFamiliarity;
  completedAt: string;
}
```

- [ ] **Step 2: Implement per-user storage**

```ts
function onboardingKey(userId: string): string {
  return `@mercado-fiis/onboarding/v1/${userId}`;
}
```

Validate parsed JSON strictly. Invalid or absent values return `null`.

- [ ] **Step 3: Implement OnboardingProvider**

Reload when `user?.uid` changes. Reset state on logout. Expose retry on read
failure and leave `result` null until a successful save.

- [ ] **Step 4: Centralize entry decisions**

`AppEntryGate` renders loading while auth/theme/onboarding loads, login when
unauthenticated, onboarding when authenticated without a result, and tabs when
complete. Redirects must use `replace` semantics.

- [ ] **Step 5: Verify account isolation**

Exercise these service-level cases in a temporary development invocation:

- user A saves `beginner`;
- user B returns `null`;
- user B saves `experienced`;
- user A still returns `beginner`.

Then run `npm.cmd run typecheck`.

- [ ] **Step 6: Commit**

```powershell
git add src/domain/onboarding.ts src/services/onboarding.service.ts src/contexts/OnboardingContext.tsx src/hooks/useOnboarding.ts src/components/AppEntryGate.tsx app
git commit -m "feat: add per-user onboarding gate"
```

---

### Task 6: Onboarding screen and auth routing

**Files:**
- Create: `src/screens/OnboardingScreen.tsx`
- Create: `app/onboarding.tsx`
- Modify: `src/screens/LoginScreen.tsx`
- Modify: `src/screens/RegisterScreen.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/_layout.tsx`

**Interfaces:**
- Consumes: `complete(familiarity)` from `useOnboarding()`.
- Produces: a one-screen selection and confirmation flow.

- [ ] **Step 1: Build the familiarity choice**

Render:

- eyebrow “SUA EXPERIÊNCIA”;
- title “Como podemos começar com você?”;
- a short privacy-safe explanation;
- two large selectable cards;
- disabled CTA until a choice is made.

Card copy:

- “Estou começando agora” — “Quero aprender os conceitos desde a base.”
- “Já conheço investimentos” — “Já entendo os fundamentos e quero explorar FIIs.”

- [ ] **Step 2: Save and enter the app**

The CTA calls `complete(selection)`. On success, use
`router.replace('/(tabs)')`. On failure, show an inline error and keep the
selection available for retry.

- [ ] **Step 3: Route login and registration through the root gate**

After successful sign-in/sign-up, replace to `/`, never directly to tabs.
Tabs redirect authenticated users with missing onboarding back through the gate.

- [ ] **Step 4: Verify onboarding scenarios**

Check new registration, existing login, returning user, failed storage retry,
logout, and a second account on the same device.

- [ ] **Step 5: Commit**

```powershell
git add app/onboarding.tsx app src/screens/LoginScreen.tsx src/screens/RegisterScreen.tsx src/screens/OnboardingScreen.tsx
git commit -m "feat: add investment familiarity onboarding"
```

---

### Task 7: Individually polish learning covers 1, 2, 3, and 7

**Files:**
- Modify: `src/domain/learning.ts`
- Modify: `src/services/learning.service.ts`
- Modify: `src/screens/LearningCover.tsx`
- Modify: `src/screens/LearningScreen.tsx`
- Modify: `src/screens/LearningModuleScreen.tsx`

**Interfaces:**
- Produces: `LearningCoverPresentation` metadata consumed by `LearningCover`.

- [ ] **Step 1: Add presentation metadata**

```ts
export interface LearningCoverPresentation {
  previewMaxHeight: number;
  detailMaxHeight: number;
  backdropScale: number;
  backdropPosition?: string;
  foregroundPosition?: string;
}
```

Assign tuned values to covers 1, 2, 3, and 7; use the current balanced default
for the remaining covers.

- [ ] **Step 2: Apply per-cover rendering**

`LearningCover` accepts `presentation`, keeps the foreground on `contain`,
and applies scale/position only to the blurred backdrop. It must consume the
current theme for the frame fallback and overlay.

- [ ] **Step 3: Verify both placements**

Inspect each of the four covers in:

- the learning timeline card;
- the learning detail hero;
- Light theme;
- Dark theme.

Acceptance: no cut text or character, no raw side bars, no excessive card height,
and no visible hard edge between foreground and backdrop.

- [ ] **Step 4: Commit**

```powershell
git add src/domain/learning.ts src/services/learning.service.ts src/screens/LearningCover.tsx src/screens/LearningScreen.tsx src/screens/LearningModuleScreen.tsx
git commit -m "fix: polish learning cover presentation"
```

---

### Task 8: Full visual validation and Dark polish

**Files:**
- Modify: only files with verified visual conflicts.

**Interfaces:**
- Consumes: every deliverable from Tasks 1–7.
- Produces: release-ready Light/Dark/System UX.

- [ ] **Step 1: Run static verification**

```powershell
npm.cmd run typecheck
git diff --check
```

Expected: both PASS.

- [ ] **Step 2: Compile the Expo web bundle**

```powershell
npx.cmd expo start --web --port 8082
curl.exe --silent --fail http://localhost:8082/
curl.exe --silent --fail http://localhost:8082/onboarding
curl.exe --silent --fail http://localhost:8082/learn/start
```

Expected: routes return HTML and Metro reports successful bundles.

- [ ] **Step 3: Perform the Light regression pass**

Compare the current approved Light appearance across auth, onboarding, all tabs,
details, tools, learning, and overlays. Only fix deviations introduced by token
migration.

- [ ] **Step 4: Perform the Dark refinement pass**

Inspect the same flows and fix:

- white or light orphan surfaces;
- insufficient text/placeholder contrast;
- borders that disappear or become too prominent;
- buttons whose labels lose contrast;
- chart labels, axes, tooltips, and empty states;
- modal/sheet scrims and internal surfaces;
- tab bar, safe areas, status bar, and scroll fades;
- learning covers and completion celebration.

- [ ] **Step 5: Validate System behavior**

With preference set to System, switch the host appearance between Light and Dark
and confirm the app updates without reload.

- [ ] **Step 6: Re-run verification**

```powershell
npm.cmd run typecheck
git diff --check
```

Expected: PASS.

- [ ] **Step 7: Commit final polish**

```powershell
git add app src
git commit -m "fix: refine dark theme across app"
```
