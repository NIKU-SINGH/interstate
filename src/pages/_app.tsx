import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import "~/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider, useUser } from "../components/UserContext";
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { mainnet } from 'viem/chains';
import LoginModal from '../components/LoginModal';
import { env } from '../env';
import { QuickBuyProvider } from '../components/QuickBuyContext';
import { WatchlistProvider } from '../components/WatchlistContext';
import { FilterProvider } from '../components/FilterContext';

const config = getDefaultConfig({
  appName: "Meme Dashboard",
  projectId: "YOUR_PROJECT_ID", // TODO: Replace with your WalletConnect projectId
  chains: [mainnet],
  ssr: true,
});

const geist = Geist({
  subsets: ["latin"],
});

const queryClient = new QueryClient();

function TokenHandler() {
  const { refreshUser } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
      Cookies.set('token', token, { expires: 7, path: '/' });
      refreshUser().then(() => {
        toast.success('Logged in successfully!');
        // Remove token from URL
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      });
    }
  }, []);
  return null;
}

function GlobalLoginModalManager({ enforceLogin }: { enforceLogin: boolean }) {
  const { user, loading: userLoading } = useUser();
  const [loginOpen, setLoginOpen] = useState(false);
  useEffect(() => {
    if (enforceLogin && !userLoading && !user) {
      setLoginOpen(true);
    }
    if (user && loginOpen) {
      setLoginOpen(false);
    }
  }, [user, userLoading, enforceLogin]);
  // Prevent closing if not logged in
  const handleLoginClose = () => {
    if (user) setLoginOpen(false);
  };
  if (!enforceLogin) return null;
  return (
    <LoginModal open={loginOpen} onClose={handleLoginClose} forceLogin={!user && !userLoading} />
  );
}

function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 500);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show nothing during SSR/initial load to prevent hydration issues
  if (!isClient) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-24 h-24 mx-auto mb-6 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">We're Coming Soon on Mobile!</h1>
          <p className="text-gray-400 mb-4">
            Our mobile experience is currently in development.
          </p>
          <p className="text-sm text-gray-500">
            Please visit us on desktop for the full experience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={geist.className}>
      <MobileBlocker>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme({ accentColor: "#10b981" })}>
              <UserProvider>
                <TokenHandler />
                <QuickBuyProvider>
                  <WatchlistProvider>
                    <FilterProvider>
                      <Component {...pageProps} />
                    </FilterProvider>
                  </WatchlistProvider>
                </QuickBuyProvider>
                <GlobalLoginModalManager enforceLogin={!!env.NEXT_PUBLIC_IS_BACKEND_DEPLOYED} />
              </UserProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <Toaster position="top-right" />
      </MobileBlocker>
    </div>
  );
};

export default MyApp;
