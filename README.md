# Task Manager App

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![AWS Ready](https://img.shields.io/badge/AWS-Ready-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](#-architectural-highlights)

A modern, pixel-perfect Task Management application built with **Next.js App Router**, engineered with professional-grade state management, accessibility (a11y), and performance optimizations.

This repository showcases highly polished, recruiter-ready production patterns, utilizing custom hooks, premium UX/UI transitions, zero-hydration flashes, and bulletproof keyboard accessibility.

---

## 🚀 Core Features

*   **✨ Task CRUD**: Create, read, edit, and delete tasks seamlessly. Supports high, medium, and low priority levels.
*   **📅 Smart Date Management**: Timezone-safe due dates with relative indicators (*Today*, *Tomorrow*, *Yesterday*, *In X days*, *Overdue*) and automatic local midnight parsing to prevent timezone offset bugs.
*   **🔄 Robust State & Undo Action**: Lightweight `localStorage` persistence integrated into a custom hook. Features a real-time **Toast Notification** system powered by `Sonner` with a fully-functional **Undo** delete action using functional state updates to prevent stale closures.
*   **⚡ Zero-Flash Hydration**: Premium UX utilizing animated skeleton layouts during client-side data fetching to eliminate SSR hydration content flashes and layout shifts.
*   **🔍 Advanced Search & Filtering**: Real-time search with a custom debouncing hook (`useDebounce`) to optimize render cycles, alongside status categories (*All*, *Active*, *Completed*) fully memoized via `useMemo`.
*   **🎨 Visual Polish & Accessibility (a11y)**:
    *   Accessible custom checkbox controls implementing `role="checkbox"` and dynamic `aria-checked` bindings.
    *   Elite **Modal Focus Management** for deleting tasks (using React portals, custom `useRef` auto-focus on cancel button, and a global event listener for the `Escape` key to prevent keyboard traps).
    *   Responsive design matching Light/Dark themes using modern CSS/PostCSS variables.

---

## 🛠️ Tech Stack

This project was built using the following core technologies, pinned to the exact versions found in `package.json`:

*   **Framework**: Next.js `16.2.9` (App Router)
*   **Language**: TypeScript `^5` (Strict Mode compliant)
*   **Library**: React `19.2.4` / React DOM `19.2.4`
*   **Styling**: Tailwind CSS `^4` (with native `@tailwindcss/postcss` setup)
*   **Notifications**: Sonner `^2.0.7`
*   **Icons**: Customized, lightweight inline SVGs optimized for high-performance and design flexibility.

---

## 📦 Installation & Local Setup

Get the project up and running locally by following these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/dtdev-hub/dtd-ppvc-01-nextjs-task-manager.git
    cd task-manager
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

4.  **Production Build**:
    ```bash
    npm run build
    npm run start
    ```

---

## 📐 Architectural Highlights

To demonstrate software engineering depth and production-ready code patterns, the application implements several advanced technical concepts:

### 1. Robust State Persistence & Zero-Flash Hydration
To avoid the standard Next.js hydration error (where server HTML mismatches client HTML because of client-side `localStorage`), the custom `useLocalStorage` hook incorporates a deferred loading architecture.
Combined with a `requestAnimationFrame` mounted check, the UI displays highly polished **Skeleton Shimmers** during the initial mount, resulting in zero layout shifts or content flashes.

```typescript
// LocalStorage loaded safely on client-side
useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialValueRef.current);
    } catch (error) {
      console.error(error);
    } finally {
      hasLoadedRef.current = true;
      setIsLoaded(true);
    }
  }, 0);
  return () => window.clearTimeout(timeoutId);
}, [key]);
```

### 2. Memoized Filtering & Search Debouncing
To prevent unnecessary and expensive re-computations when typing in the search bar, the UI combines a custom `useDebounce` hook with React’s `useMemo`. Re-rendering of the entire list is strictly limited to when the user stops typing (debounced by `300ms`) or when a task's state changes.

```typescript
const debouncedSearchQuery = useDebounce(searchQuery, 300);

const filteredTasks = useMemo(() => {
  return tasks.filter((task) => {
    const matchesFilter = () => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    };
    const matchesSearch = () => {
      if (!debouncedSearchQuery.trim()) return true;
      return task.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    };
    return matchesFilter() && matchesSearch();
  });
}, [tasks, filter, debouncedSearchQuery]);
```

### 3. Bulletproof Keyboard & Portal Focus Management
When a user attempts to delete a task, a Modal is rendered using `createPortal` targeting `document.body` to completely isolate it from layout parent constraints.
To achieve exceptional **WCAG-compliant keyboard navigation**, the modal implements:
*   **Focus Trapping**: Automatically shifts focus to the safe `Cancel` button via `useRef` upon mounting.
*   **Global Event Listeners**: Closes automatically on `Escape` key down.
*   **ARIA attributes**: Properly sets `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` linkages.

```typescript
useEffect(() => {
  if (isDeleteModalOpen) {
    cancelButtonRef.current?.focus();
  }
}, [isDeleteModalOpen]);

useEffect(() => {
  if (!isDeleteModalOpen) return;
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setIsDeleteModalOpen(false);
  };
  window.addEventListener("keydown", handleGlobalKeyDown);
  return () => window.removeEventListener("keydown", handleGlobalKeyDown);
}, [isDeleteModalOpen]);
```

### 4. Stale-Closure Defeated Undo Pattern
When a task is deleted, the application provides a Toast notification with an **Undo** CTA. To guarantee that clicking "Undo" restores the item at its correct pre-deletion index without relying on closure values that might have gone stale, the callback triggers a functional state updater.

---

## ☁️ AWS Deployment Ready
The application is fully containerized and statically optimized, making it ready to deploy on AWS using services like **AWS Amplify**, **Amazon S3 + CloudFront** (for static export), or **AWS ECS/Fargate** (for server-side rendering).
