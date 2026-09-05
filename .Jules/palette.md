## 2023-10-24 - Accessible Input Error Handling
**Learning:** Using `aria-invalid` and `aria-describedby` provides critical context for screen reader users when forms have error states or helper text. The ID must be consistently applied on the descriptive element and the input field.
**Action:** Always map the `aria-describedby` attribute to unique generated IDs based on `useId` or the element's existing ID to securely associate error or helper text without risk of ID collisions.## 2024-02-23 - Missing aria-labels in layouts
**Learning:** Found several icon-only action buttons (Logout, Install App) in layout files (`ClientLayout`, `AdminLayout`) that were lacking `aria-label`s, causing accessibility issues.
**Action:** Always verify `aria-label` presence for buttons that contain only icons when modifying components in this repo.

## 2026-08-26 - Missing aria-labels in icon-only layout navigation buttons
**Learning:** Discovered icon-only buttons (like the mobile menu close and desktop sidebar toggle) in `src/layouts/OwnerLayout.tsx` that were missing s, which is critical for screen reader users to understand navigation structure.
**Action:** Always verify  and  attributes are present for sidebar layout toggle buttons and mobile menu close buttons.

## 2024-02-23 - Missing aria-labels in icon-only layout navigation buttons
**Learning:** Discovered icon-only buttons (like the mobile menu close and desktop sidebar toggle) in `src/layouts/OwnerLayout.tsx` that were missing `aria-label`s, which is critical for screen reader users to understand navigation structure.
**Action:** Always verify `aria-label` and `aria-expanded` attributes are present for sidebar layout toggle buttons and mobile menu close buttons.

## 2024-05-15 - Icon-only functional buttons missing aria-labels
**Learning:** Found multiple icon-only action buttons across various components (`OwnerWorkingHoursPage`, `OwnerServicesPage`, `PwaInstallPrompt`) that lacked `aria-label`s, only relying on `title` attributes. `title` tooltips alone are insufficient for robust screen reader accessibility.
**Action:** Ensure all interactive elements, especially icon-only buttons, consistently implement `aria-label`s to clearly communicate their function to assistive technologies.
## 2024-03-01 - Missing aria-label for password visibility toggles
**Learning:** The eye/eye-off toggle button used in password fields across auth pages (e.g., ResetPasswordPage) was missing an `aria-label`, leaving screen reader users without context.
**Action:** Ensure all icon-only buttons used for input adornments (like rightIcon in Input) have a descriptive `aria-label` based on their dynamic state.

## 2026-08-29 - Missing focus outlines and aria-pressed on custom selection states
**Learning:** Custom interactive elements (like the date and time selection buttons in `CheckoutPage.tsx`) were built using standard `<button>` tags but lacked `focus-visible` styling and `aria-pressed` states, making them difficult for keyboard users to navigate and for screen readers to convey the current selection.
**Action:** When styling custom selection grids or lists, always include explicit `focus-visible` utility classes for clear keyboard focus indicators, and pair them with `aria-pressed` or `aria-selected` depending on the context.

## 2026-08-30 - Tab Component Accessibility
**Learning:** Custom tab interfaces often lack proper ARIA roles and keyboard interactions. In `WithdrawalModal.tsx`, tabs were implemented with basic `<div>` and `<button>` elements, which screen readers couldn't interpret as a tabbed interface.
**Action:** Always implement the `[role="tablist"]`, `[role="tab"]` (with `aria-selected` and `aria-controls`), and `[role="tabpanel"]` (with `aria-labelledby`) pattern for custom tab components. Ensure `focus-visible` states are present for keyboard navigation clarity.

## 2024-05-20 - Custom Toggle Switch Accessibility
**Learning:** When building custom toggle switches using standard `<button>` elements, screen readers often fail to announce their toggle state, and keyboard users may not see a clear focus indicator.
**Action:** Always implement `role="switch"`, an accurate `aria-checked` state, a descriptive `aria-label`, and clear `focus-visible` utility classes for any custom toggle buttons.
