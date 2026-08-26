## 2024-08-24 - Plaintext Password Storage in Auto-Save Drafts
**Vulnerability:** A critical security vulnerability was identified where `CompanyOnboardingPage.tsx` saved entire form values (including plaintext passwords) to `localStorage` and `sessionStorage` in order to persist draft data if the user navigated away.
**Learning:** React Hook Form's `watch()` function returns all inputs. Blindly stringifying and saving this data to browser storage poses a significant risk if forms contain sensitive fields (passwords, tokens, financial data). Client-side storage is accessible to any script running on the page (XSS target).
**Prevention:** Always sanitize/destructure object representations of user forms to explicitly exclude sensitive inputs (e.g., `const { password, ...safeFormValues } = formValues`) before persisting to `localStorage`, `sessionStorage`, or external storage APIs.
## 2024-08-26 - Information Disclosure in Server Error Page
**Vulnerability:** Information Disclosure (CWE-209)
**Learning:** Exposing raw `error.message` and `error.name` in a global error boundary for production builds can leak sensitive system details or backend SQL/Prisma errors to end users.
**Prevention:** Use environment checks like `import.meta.env.DEV` to conditionally render sensitive error details, or remove them entirely for production user interfaces.
