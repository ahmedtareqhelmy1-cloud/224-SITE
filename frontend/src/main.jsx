import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './app/store'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

// Load Clerk only if it's available. Use a runtime dynamic import inside a component
// to avoid introducing top-level await during the build step.
const ClerkProviderComponent = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const [ClerkProvider, setClerkProvider] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    if (!publishableKey) return;
    import('@clerk/clerk-react')
      .then((mod) => {
        if (mounted && mod && mod.ClerkProvider) setClerkProvider(() => mod.ClerkProvider);
      })
      .catch(() => {
        // keep Clerk optional — swallow failures so app still runs
      });
    return () => {
      mounted = false;
    };
  }, [publishableKey]);

  if (!publishableKey) return <>{children}</>;
  if (!ClerkProvider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const ProviderComp = ClerkProvider;
  return <ProviderComp publishableKey={publishableKey}>{children}</ProviderComp>;
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <ClerkProviderComponent>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <ToastProvider>
                <App />
              </ToastProvider>
            </BrowserRouter>
          </ClerkProviderComponent>
        </Suspense>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
