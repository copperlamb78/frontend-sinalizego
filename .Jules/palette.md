## 2023-10-24 - Accessible Input Error Handling
**Learning:** Using `aria-invalid` and `aria-describedby` provides critical context for screen reader users when forms have error states or helper text. The ID must be consistently applied on the descriptive element and the input field.
**Action:** Always map the `aria-describedby` attribute to unique generated IDs based on `useId` or the element's existing ID to securely associate error or helper text without risk of ID collisions.## 2024-02-23 - Missing aria-labels in layouts
**Learning:** Found several icon-only action buttons (Logout, Install App) in layout files (`ClientLayout`, `AdminLayout`) that were lacking `aria-label`s, causing accessibility issues.
**Action:** Always verify `aria-label` presence for buttons that contain only icons when modifying components in this repo.
