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
