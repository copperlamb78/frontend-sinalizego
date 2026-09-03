## 2024-08-24 - Plaintext Password Storage in Auto-Save Drafts
**Vulnerability:** A critical security vulnerability was identified where `CompanyOnboardingPage.tsx` saved entire form values (including plaintext passwords) to `localStorage` and `sessionStorage` in order to persist draft data if the user navigated away.
**Learning:** React Hook Form's `watch()` function returns all inputs. Blindly stringifying and saving this data to browser storage poses a significant risk if forms contain sensitive fields (passwords, tokens, financial data). Client-side storage is accessible to any script running on the page (XSS target).
**Prevention:** Always sanitize/destructure object representations of user forms to explicitly exclude sensitive inputs (e.g., `const { password, ...safeFormValues } = formValues`) before persisting to `localStorage`, `sessionStorage`, or external storage APIs.
## 2024-08-26 - Information Disclosure in Server Error Page
**Vulnerability:** Information Disclosure (CWE-209)
**Learning:** Exposing raw `error.message` and `error.name` in a global error boundary for production builds can leak sensitive system details or backend SQL/Prisma errors to end users.
**Prevention:** Use environment checks like `import.meta.env.DEV` to conditionally render sensitive error details, or remove them entirely for production user interfaces.
## 2024-08-27 - Information Disclosure via Toast Notifications
**Vulnerability:** Information Disclosure (CWE-209) in client-side error handling where `err.message` from generic JavaScript or backend exceptions was displayed directly to end users inside toast notifications.
**Learning:** Returning unhandled or raw `err.message` strings directly to the UI layer in global catches (e.g. `const msg = err.response?.data?.message || err.message`) can potentially expose database query failures, internal file paths, network issues, or infrastructure internals to external users if the backend fails in an unexpected way without sanitizing error payloads.
**Prevention:** Avoid rendering raw `Error.message` directly in user-facing toasts or UI elements unless you strictly control its source and format. Rely primarily on structured, sanitized backend error payloads (like `err.response?.data?.message`) or fallback to generic user-friendly strings like "Ocorreu um erro inesperado."
## 2024-08-28 - Weak Password Validation
**Vulnerability:** Weak Password Requirements
**Learning:** Zod schemas for password creation/update across the application (`RegisterPage`, `CompanyOnboardingPage`, `ResetPasswordPage`, `ClientProfilePage`) only required a minimum of 6 characters, allowing weak, easily guessable passwords.
**Prevention:** Always enforce strong password complexity rules (e.g., minimum length, uppercase, numbers, special characters) using `.regex()` on Zod string validation schemas.
