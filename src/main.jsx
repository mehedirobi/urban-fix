import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from './routers/router.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Loader from './components/Loader.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#f0f4f8',
            color: '#111',
            padding: '16px',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
          },
          success: {
            style: { background: '#d1fae5', color: '#065f46', border: '1px solid #10b981' },
          },
          error: {
            style: { background: '#fee2e2', color: '#7f1d1d', border: '1px solid #ef4444' },
          },
        }}
      />

      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader /></div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </QueryClientProvider>
)
