# Sequence Diagrams - Hisaab Khata Frontend

This document contains sequence diagrams explaining all major user flows in the React.js application.

---

## 1. Application Initialization Flow

This flow shows how the application starts up and initializes all providers and routing.

```mermaid
sequenceDiagram
    participant Browser
    participant main.tsx
    participant ReactDOM
    participant ThemeProvider
    participant BrowserRouter
    participant App.tsx
    participant Routes

    Browser->>main.tsx: Load application
    main.tsx->>ReactDOM: createRoot(document.getElementById("root"))
    ReactDOM->>ReactDOM: Render React.StrictMode
    ReactDOM->>ThemeProvider: Wrap with ThemeProvider
    ThemeProvider->>ThemeProvider: Load theme.ts configuration
    ThemeProvider->>BrowserRouter: Wrap with BrowserRouter
    BrowserRouter->>App.tsx: Render App component
    App.tsx->>App.tsx: Define routes configuration
    App.tsx->>Routes: Render Routes component
    Routes->>Browser: Application ready
```

---

## 2. Login Flow

This flow shows the complete login process from user input to navigation to dashboard.

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant LocalStorage
    participant useNavigate Hook
    participant React Router
    participant RequireAuth
    participant AppLayout
    participant DashboardPage

    User->>LoginPage: Enter email & password
    User->>LoginPage: Click "Sign in" button
    LoginPage->>LoginPage: onSubmit(e.preventDefault())
    LoginPage->>LoginPage: Get email & password from state
    Note over LoginPage: TODO: Replace with real API call
    LoginPage->>LocalStorage: setItem("hk_token", "demo-token")
    LocalStorage-->>LoginPage: Token stored
    LoginPage->>useNavigate Hook: nav("/", { replace: true })
    useNavigate Hook->>React Router: Navigate to "/"
    React Router->>RequireAuth: Check authentication
    RequireAuth->>LocalStorage: getItem("hk_token")
    LocalStorage-->>RequireAuth: "demo-token" (exists)
    RequireAuth->>RequireAuth: isAuthenticated() returns true
    RequireAuth->>AppLayout: Render AppLayout
    AppLayout->>DashboardPage: Render DashboardPage (index route)
    DashboardPage-->>User: Display dashboard
```

---

## 3. Register Flow

This flow shows the shop registration process.

```mermaid
sequenceDiagram
    participant User
    participant RegisterPage
    participant LocalStorage
    participant useNavigate Hook
    participant React Router
    participant RequireAuth
    participant AppLayout
    participant DashboardPage

    User->>RegisterPage: Enter shop details (shopName, ownerName, email, password)
    User->>RegisterPage: Click "Register" button
    RegisterPage->>RegisterPage: onSubmit(e.preventDefault())
    RegisterPage->>RegisterPage: Validate form fields (required)
    Note over RegisterPage: TODO: Replace with real API call
    RegisterPage->>LocalStorage: setItem("hk_token", "demo-token")
    LocalStorage-->>RegisterPage: Token stored
    RegisterPage->>useNavigate Hook: nav("/", { replace: true })
    useNavigate Hook->>React Router: Navigate to "/"
    React Router->>RequireAuth: Check authentication
    RequireAuth->>LocalStorage: getItem("hk_token")
    LocalStorage-->>RequireAuth: "demo-token" (exists)
    RequireAuth->>AppLayout: Render AppLayout
    AppLayout->>DashboardPage: Render DashboardPage
    DashboardPage-->>User: Display dashboard
```

---

## 4. Protected Route Access Flow

This flow shows what happens when a user tries to access a protected route.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React Router
    participant RequireAuth
    participant LocalStorage
    participant AppLayout
    participant TargetPage

    User->>Browser: Navigate to protected route (e.g., /products)
    Browser->>React Router: Route change detected
    React Router->>RequireAuth: Check if route requires auth
    RequireAuth->>LocalStorage: getItem("hk_token")
    
    alt Token exists
        LocalStorage-->>RequireAuth: "hk_token" value
        RequireAuth->>RequireAuth: isAuthenticated() returns true
        RequireAuth->>AppLayout: Render AppLayout
        AppLayout->>TargetPage: Render target page via Outlet
        TargetPage-->>User: Display protected content
    else Token missing
        LocalStorage-->>RequireAuth: null
        RequireAuth->>RequireAuth: isAuthenticated() returns false
        RequireAuth->>React Router: Navigate to "/login" (replace)
        React Router-->>User: Redirect to login page
    end
```

---

## 5. Navigation Flow (User Clicks Nav Link)

This flow shows how navigation works when a user clicks a navigation link in the sidebar.

```mermaid
sequenceDiagram
    participant User
    participant AppLayout
    participant NavLink
    participant React Router
    participant Routes
    participant TargetPage
    participant Outlet

    User->>AppLayout: Click navigation link (e.g., "Products")
    AppLayout->>NavLink: NavLink component handles click
    NavLink->>NavLink: Check if route matches (active state)
    NavLink->>React Router: Navigate to "/products"
    React Router->>Routes: Match route path
    Routes->>Routes: Find matching Route component
    Routes->>TargetPage: Render ProductsPage component
    TargetPage->>Outlet: Render via Outlet in AppLayout
    Outlet->>AppLayout: Display ProductsPage content
    AppLayout-->>User: Updated page content displayed
    Note over NavLink: Active link styling applied
```

---

## 6. Logout Flow

This flow shows the logout process.

```mermaid
sequenceDiagram
    participant User
    participant AppLayout
    participant LocalStorage
    participant Browser
    participant React Router
    participant LoginPage

    User->>AppLayout: Click "Logout" button
    AppLayout->>AppLayout: onClick handler triggered
    AppLayout->>LocalStorage: removeItem("hk_token")
    LocalStorage-->>AppLayout: Token removed
    AppLayout->>Browser: window.location.href = "/login"
    Browser->>React Router: Navigate to "/login"
    React Router->>LoginPage: Render LoginPage
    LoginPage-->>User: Display login form
```

---

## 7. Form Input Change Flow (Controlled Components)

This flow shows how form inputs are handled using controlled components pattern.

```mermaid
sequenceDiagram
    participant User
    participant TextField (MUI)
    participant LoginPage
    participant useState Hook
    participant React

    User->>TextField: Type in input field (e.g., email)
    TextField->>LoginPage: onChange event fired
    LoginPage->>LoginPage: onChange={(e) => setEmail(e.target.value)}
    LoginPage->>useState Hook: setEmail(newValue)
    useState Hook->>React: Update component state
    React->>React: Trigger re-render
    React->>TextField: Re-render with new value prop
    TextField-->>User: Display updated input value
    Note over LoginPage: State is single source of truth
```

---

## 8. Mobile Drawer Toggle Flow

This flow shows how the mobile navigation drawer is toggled.

```mermaid
sequenceDiagram
    participant User
    participant AppLayout
    participant IconButton
    participant useState Hook
    participant React
    participant Drawer Component

    User->>AppLayout: Click menu icon (mobile view)
    AppLayout->>IconButton: onClick event
    IconButton->>AppLayout: toggleDrawer() called
    AppLayout->>AppLayout: setMobileOpen((v) => !v)
    AppLayout->>useState Hook: Update mobileOpen state
    useState Hook->>React: State change detected
    React->>React: Trigger re-render
    React->>Drawer Component: Re-render with new open prop
    alt Drawer was closed
        Drawer Component->>Drawer Component: open={true}
        Drawer Component-->>User: Drawer slides in (visible)
    else Drawer was open
        Drawer Component->>Drawer Component: open={false}
        Drawer Component-->>User: Drawer slides out (hidden)
    end
```

---

## 9. API Request Flow (With Interceptor)

This flow shows how API requests would work with the axios interceptor (currently configured but not actively used in pages).

```mermaid
sequenceDiagram
    participant Component
    participant apiClient
    participant Request Interceptor
    participant LocalStorage
    participant Backend API
    participant Response

    Component->>apiClient: apiClient.get("/products")
    apiClient->>Request Interceptor: Intercept request
    Request Interceptor->>LocalStorage: getItem("hk_token")
    LocalStorage-->>Request Interceptor: "hk_token" value
    Request Interceptor->>Request Interceptor: Add Authorization header
    Note over Request Interceptor: config.headers.Authorization = "Bearer {token}"
    Request Interceptor-->>apiClient: Modified config
    apiClient->>Backend API: HTTP GET /products (with Bearer token)
    Backend API->>Backend API: Validate token & process request
    Backend API-->>apiClient: Response (200 OK + data)
    apiClient-->>Component: Response data
    Component->>Component: Update state with data
    Component-->>User: UI updated with new data
```

---

## 10. Dynamic Route Parameter Access Flow

This flow shows how dynamic route parameters (like `/suppliers/:id`) are accessed.

```mermaid
sequenceDiagram
    participant User
    participant AppLayout
    participant NavLink
    participant React Router
    participant Routes
    participant SupplierLedgerPage
    participant useParams Hook

    User->>AppLayout: Click supplier link or navigate to /suppliers/123
    AppLayout->>NavLink: NavLink handles navigation
    NavLink->>React Router: Navigate to "/suppliers/123"
    React Router->>Routes: Match route pattern "/suppliers/:id"
    Routes->>Routes: Extract id parameter (123)
    Routes->>SupplierLedgerPage: Render SupplierLedgerPage
    SupplierLedgerPage->>useParams Hook: useParams<{ id: string }>()
    useParams Hook->>React Router: Get route parameters
    React Router-->>useParams Hook: { id: "123" }
    useParams Hook-->>SupplierLedgerPage: { id: "123" }
    SupplierLedgerPage->>SupplierLedgerPage: Use id in component logic
    Note over SupplierLedgerPage: const { id } = useParams()
    SupplierLedgerPage-->>User: Display supplier ledger for ID 123
```

---

## 11. 404 Not Found Flow

This flow shows what happens when a user navigates to a non-existent route.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React Router
    participant Routes
    participant NotFoundPage
    participant useNavigate Hook

    User->>Browser: Navigate to invalid route (e.g., /invalid-page)
    Browser->>React Router: Route change detected
    React Router->>Routes: Try to match route
    Routes->>Routes: No matching route found
    Routes->>Routes: Match catch-all route "*"
    Routes->>NotFoundPage: Render NotFoundPage
    NotFoundPage->>NotFoundPage: Display 404 message
    NotFoundPage-->>User: Show "Page not found" message
    User->>NotFoundPage: Click "Go Home" button
    NotFoundPage->>useNavigate Hook: nav("/")
    useNavigate Hook->>React Router: Navigate to "/"
    React Router->>Routes: Match "/" route
    Routes-->>User: Display dashboard
```

---

## 12. Theme Application Flow

This flow shows how the Material-UI theme is applied throughout the application.

```mermaid
sequenceDiagram
    participant Browser
    participant main.tsx
    participant ThemeProvider
    participant theme.ts
    participant MUI Components
    participant User

    Browser->>main.tsx: Application loads
    main.tsx->>ThemeProvider: Wrap app with ThemeProvider
    ThemeProvider->>theme.ts: Load theme configuration
    theme.ts->>theme.ts: createTheme({ palette, typography, components })
    theme.ts-->>ThemeProvider: Theme object
    ThemeProvider->>ThemeProvider: Provide theme context
    ThemeProvider->>MUI Components: Theme available via context
    MUI Components->>MUI Components: Access theme values (colors, spacing, etc.)
    MUI Components->>MUI Components: Apply sx prop with theme-aware values
    Note over MUI Components: sx={{ color: "primary.main", p: 2 }}
    MUI Components-->>User: Styled components rendered
```

---

## Notes on Current Implementation

### Implemented Flows
- ✅ Application initialization
- ✅ Login (demo token storage)
- ✅ Register (demo token storage)
- ✅ Protected route access
- ✅ Navigation
- ✅ Logout
- ✅ Form input handling (controlled components)
- ✅ Mobile drawer toggle
- ✅ Dynamic route parameters
- ✅ 404 handling
- ✅ Theme application

### Not Yet Implemented (Placeholders)
- ❌ Real API calls (currently using localStorage demo tokens)
- ❌ Data fetching from backend
- ❌ CRUD operations (Create, Read, Update, Delete)
- ❌ Form submissions to backend
- ❌ Error handling for API calls
- ❌ Loading states
- ❌ Data tables with real data

### Future Flows (When Implemented)
When the backend integration is complete, additional flows will include:
- Product CRUD operations
- Supplier CRUD operations
- Customer CRUD operations
- Purchase creation and listing
- Sale creation and listing
- Ledger entry management
- Staff management
- Dashboard data fetching

---

*Last Updated: Based on codebase analysis as of current state*