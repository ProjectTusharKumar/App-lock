# App Lock - Design Guidelines

## 1. Brand Identity

**Purpose**: A security app that protects users' privacy by locking sensitive apps behind authentication.

**Aesthetic Direction**: **Refined Security** - Professional, trustworthy, and minimalist. Uses dark surfaces with high-contrast accents to convey protection and seriousness. The design should feel like a vault: secure, precise, and unbreachable.

**Memorable Element**: Lock state transitions with smooth micro-animations. When an app is locked/unlocked, a satisfying "vault door" animation reinforces the feeling of security.

**Tone**: Confident, protective, premium - never playful or casual. This is serious privacy protection.

## 2. Navigation Architecture

**Root Navigation**: Tab Navigation (3 tabs)
- **Protected Apps** (Home) - Main screen showing locked/unlocked apps
- **Lock** (Center) - Quick lock toggle for all apps with biometric prompt
- **Settings** - Authentication, security features, and preferences

**Screen List**:
1. Protected Apps (tab 1) - Select and manage which apps to lock
2. Lock Toggle (tab 2) - Quick action to enable/disable all locks
3. Settings (tab 3) - Security configuration, intruder alerts, recovery options
4. Authentication Setup (modal) - First-time PIN/pattern/biometric setup
5. Intruder Logs (stack) - View failed unlock attempts with photos
6. Recovery Options (stack) - Email recovery and security questions

## 3. Screen-by-Screen Specifications

### Protected Apps Screen
**Purpose**: Browse and select apps to protect

**Layout**:
- Header: Transparent, title "Protected", search icon (right)
- Content: Scrollable list of installed apps with lock toggles
- Bottom inset: tabBarHeight + 24px

**Components**:
- Search bar (expandable from header icon)
- App list items: app icon (48px), app name, lock toggle switch
- Section headers: "Locked Apps" and "All Apps"
- Empty state (when no apps locked): illustration + "Tap to lock your first app"
- Floating Action Button (bottom-right): "Lock All Apps" - appears when 2+ apps unlocked

**Visual Feedback**: Toggle switches animate with spring bounce. Locked apps have subtle lock icon overlay on app icon.

### Lock Toggle Screen
**Purpose**: Quick biometric lock/unlock all protected apps

**Layout**:
- No header (full screen experience)
- Content: Centered card with lock status and biometric prompt
- Safe area: all insets + 24px

**Components**:
- Large animated lock icon (120px) - rotates when toggling
- Status text: "Apps Locked" or "Apps Unlocked"
- Biometric prompt button (primary action)
- Current time display (top)
- "3 apps protected" count (below status)

**Interaction**: Tap anywhere triggers biometric prompt. Success animates lock icon with haptic feedback.

### Settings Screen
**Purpose**: Configure security and recovery options

**Layout**:
- Header: Default, title "Settings"
- Content: Scrollable grouped list
- Bottom inset: tabBarHeight + 24px

**Components**:
- Grouped settings sections with dividers:
  1. Authentication: Change PIN/Pattern, Biometric toggle, Lock timeout
  2. Security: Screenshot prevention, Root detection warning, Uninstall protection status
  3. Intruder Detection: Enable alerts, View intruder logs (navigates to stack screen)
  4. Recovery: Email for recovery, Security questions
  5. About: Version, Premium upgrade CTA
- Each setting row: icon (left), label, value/toggle (right), chevron if navigable

### Authentication Setup Screen (Modal)
**Purpose**: First-time setup of lock method

**Layout**:
- Header: Default, title "Set Up Lock", X close (left)
- Content: Scrollable form with bottom padding
- Submit button: In header (right) as "Done"

**Components**:
- Large lock icon (centered, 80px)
- Instruction text: "Choose how to unlock your apps"
- Option cards (radio selection): PIN, Pattern, Biometric
- For PIN: numeric keypad (custom design)
- For Pattern: 3x3 dot grid
- Confirmation step (re-enter PIN/pattern)

### Intruder Logs Screen
**Purpose**: Review unauthorized access attempts

**Layout**:
- Header: Default, title "Intruder Logs", back (left)
- Content: Scrollable list
- Top inset: 24px, bottom inset: insets.bottom + 24px

**Components**:
- Empty state: "No intruders detected" with shield illustration
- Log list items: timestamp, failed attempts count, thumbnail photo (if available), tap to expand
- Expanded view shows: full photo, device info, location (if enabled)
- Clear logs button (bottom)

## 4. Color Palette

**Primary**: #1A73E8 (Trust Blue) - main actions, toggles in on state
**Secondary**: #34A853 (Safe Green) - success states, locked status
**Accent**: #EA4335 (Alert Red) - failed attempts, critical warnings

**Backgrounds**:
- Surface: #121212 (Dark base)
- Elevated Surface: #1E1E1E (Cards, modals)
- Overlay: #2C2C2C (Selected states)

**Text**:
- Primary: #FFFFFF (100% opacity)
- Secondary: #B3B3B3 (70% opacity)
- Disabled: #666666 (40% opacity)

**Semantic**:
- Success: #34A853
- Warning: #FBBC04
- Error: #EA4335

## 5. Typography

**Font**: System default (SF Pro for iOS, Roboto for Android) for maximum legibility in security context

**Type Scale**:
- Headline: 28px Bold (screen titles)
- Title: 20px Semibold (section headers)
- Body: 16px Regular (main content)
- Caption: 14px Regular (secondary info)
- Label: 12px Medium (input labels, metadata)

## 6. Visual Design

**Touchable Feedback**: All interactive elements darken by 20% on press. Toggles and switches animate with 200ms spring easing.

**Lock Icon Treatment**: Use Feather "lock" and "unlock" icons. Locked state uses filled version with #34A853 tint. Unlocked uses outline with #B3B3B3.

**Shadows**: Floating elements only (FAB):
- shadowOffset: {width: 0, height: 2}
- shadowOpacity: 0.10
- shadowRadius: 2

## 7. Assets to Generate

**Required**:
- `icon.png` - App icon: Minimalist lock symbol on blue gradient background (512x512px)
- `splash-icon.png` - Simplified lock icon for launch screen (512x512px)
- `empty-protected-apps.png` - Shield with checkmark, used on Protected Apps screen when no apps locked
- `empty-intruder-logs.png` - Shield with eye icon, used on Intruder Logs screen when no attempts logged
- `authentication-success.png` - Unlocked vault illustration, shown on successful setup modal

**Style**: Flat, geometric illustrations with 2-color maximum (primary blue + white/gray). Clean lines, no gradients except app icon.