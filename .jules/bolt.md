## 2024-08-24 - Memoizing Expensive Computations in Render Body
**Learning:** Found an instance in `ClientExplorePage` where a `Map` was being built from an array of appointments, converted back to an array, and filtered by a search string on every single render cycle. This is a common React anti-pattern when dealing with lists and search inputs.
**Action:** Always check component bodies for data transformation operations (like `forEach`, `filter`, `map`, or `Map`/`Set` instantiations) that occur before the return statement. Wrap these in `useMemo` with appropriate dependency arrays to prevent unnecessary recalculations on re-renders, especially when tied to frequent state updates like text inputs.
## 2023-10-27 - Memoizing Expensive Computations before Early Returns
**Learning:** Found another instance in `StorefrontPage` where nested `map` and `filter` operations were being run on every render. To wrap this in `useMemo`, it had to be moved *before* the early return (`if (isLoading) return ...`). This required adding optional chaining (`company?.serviceGroups`) to avoid runtime crashes when `company` is undefined during loading.
**Action:** Always verify that state and props used inside a newly hoisted `useMemo` handle undefined/null states gracefully (using optional chaining) when moving computations above early returns.
## 2024-05-19 - [Cache Intl.NumberFormat instance]
**Learning:** Instantiating `Intl.NumberFormat` repeatedly in a helper function (`formatCurrency` in `src/lib/utils.ts`) is very expensive and can cause performance issues when rendering large lists of financial data.
**Action:** Always cache instances of `Intl.NumberFormat` or similar formatting objects when possible instead of recreating them on every call.
