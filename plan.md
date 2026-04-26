# Production-Level Features Implementation Plan

Enhance the product browsing experience with robust image handling, advanced filtering, sorting, and performance optimizations.

## 1. Robust Image Handling & Storage
- **Image Fallback**: Update `ProductCard.tsx` and `ProductDialog` in `AdminDashboard.tsx` to handle image loading errors using a placeholder.
- **Upload Resilience**: Enhance `uploadProductImage` in `src/lib/supabase.ts` with better error reporting.
- **Public URL**: Ensure the `products.image` field always stores the public URL from Supabase Storage.

## 2. Advanced Filtering & Search (`ProductGrid.tsx`)
- **Combined Search**: Update search logic to filter by `name`, `category`, and `event`.
- **Event Filter**: Add a dedicated UI section for filtering by event type (Birthday, Wedding, etc.).
- **Real-time Performance**: Optimize the `useMemo` hook for filtering to ensure smooth typing and interaction.
- **Dynamic Categories**: Ensure category filters are always in sync with the database.

## 3. Sorting Functionality
- **Sort Options**: Implement a dropdown or button group for:
    - Newest (default)
    - Price: Low to High
    - Price: High to Low
- **Logic**: Integrate sorting into the `useMemo` block in `ProductGrid.tsx`.

## 4. Performance & UX
- **Loading States**: Refine the loading skeleton/spinner for a smoother "luxury" feel.
- **Caching**: Ensure products are fetched efficiently and subscriptions only trigger necessary updates.
- **Empty States**: Improve the "No products found" UI with better visual cues.

## 5. Clean Data Flow
- Remove any remaining static data dependencies.
- Ensure all product interactions (Home, Shop, Admin) use the same centralized logic from `supabase.ts`.
