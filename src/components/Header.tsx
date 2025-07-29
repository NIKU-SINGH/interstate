import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaSearch, FaStar, FaBell } from "react-icons/fa";
import { useUser } from "./UserContext";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import InterstateButton from "./InterstateButton";
import { FiBarChart, FiStar } from "react-icons/fi";
import SearchModal from "./SearchModal";

const navLinks = [
  { name: "Discover", href: "/" },
  { name: "Pulse", href: "/pulse" },
  { name: "Trackers", href: "/trackers" },
  //{ name: "Perpetuals", href: "#" },
  //{ name: "Yield", href: "#" },
  { name: "Portfolio", href: "/portfolio" },
  //{ name: "Rewards", href: "#" },
];

interface HeaderProps {
  search?: string;
  setSearch?: (val: string) => void;
  showSearch?: boolean;
}

const DepositModal = dynamic(() => import("./DepositModal"), {
  ssr: false, // NO SSR PLEASE
});

const WatchlistModal = dynamic(() => import("./WatchlistModal"), {
  ssr: false,
});

const NotificationDropdown = dynamic(() => import("./NotificationDropdown"), {
  ssr: false,
});

export default function Header({
  search = "",
  setSearch,
  showSearch = true,
}: HeaderProps) {
  const router = useRouter();
  const isDiscover = router.pathname === "/";
  const { user, loading: userLoading } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Handles opening the deposit modal
  const handleDepositClick = () => {
    const token = Cookies.get("token");
    if (token && !user && !userLoading) {
      // Optionally, refresh user here if needed
    }
    setDepositOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-20 w-full border-b border-emerald-950 bg-neutral-950 backdrop-blur">
        <div className="w-full bg-green-400 text-center text-black p-0.5 text-sm">
          [ This terminal is still under development and not ready for production,&nbsp;
          <b>use at your own risk!</b> ]
        </div>
        <div className="flex max-w-full items-center justify-between border-b border-emerald-950 px-4 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="flex items-center text-2xl tracking-tight text-white select-none"
              title="Go to homepage"
            >
              <img
                src="/logo.png"
                alt="Interstate logo"
                className="h-auto w-12"
              />
              <span className="mr-1 inline-block rounded-full" />
              Interstate
            </Link>
            <nav className="ml-8 flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-1.5 py-0.5 text-sm font-medium transition-colors ${
                    link.name === "Discover" && isDiscover
                      ? "border-emerald-400 text-emerald-400"
                      : "text-neutral-200 hover:text-emerald-400"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            {showSearch && (
              <div className="relative w-64">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none z-10">
                  <FaSearch size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by token or CA..."
                  value={search}
                  onChange={(e) => setSearch && setSearch(e.target.value)}
                  onFocus={() => setSearchModalOpen(true)}
                  className="w-full rounded-full border border-neutral-700 bg-neutral-950 py-2 pr-3 pl-9 text-sm text-neutral-100 transition placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none hover:border-neutral-600"
                />
              </div>
            )}
            <InterstateButton
              onClick={handleDepositClick}
              variant="primary"
              size="md"
              className="ml-2"
            >
              Deposit
            </InterstateButton>
            <InterstateButton
              onClick={() => setWatchlistOpen(true)}
              variant="secondary"
              size="sm"
              icon={<FaStar className="text-neutral-400" />}
              className="ml-2 h-8"
              title="Watchlist"
            />
            <InterstateButton
              onClick={() => setNotificationOpen(true)}
              variant="secondary"
              size="sm"
              icon={<FaBell className="text-neutral-400" />}
              className="ml-2 h-8"
              title="Notifications"
            />
            {user && !userLoading ? (
              <div className="group relative flex cursor-pointer items-center gap-2">
                {/* Circular profile picture (placeholder) */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white select-none">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="max-w-[100px] truncate text-sm text-white">
                  {user.name}
                </span>
                {/* Dropdown for logout */}
                <div className="absolute top-10 right-0 z-50 min-w-[120px] rounded border border-neutral-800 bg-neutral-900 px-4 py-2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <InterstateButton
                    variant="danger"
                    size="sm"
                    className="h-auto w-full border-none bg-transparent px-0 py-0 text-left text-xs font-semibold shadow-none hover:underline"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        document.cookie = "token=; Max-Age=0; path=/;";
                      }
                      if (
                        typeof window !== "undefined" &&
                        window.localStorage
                      ) {
                        window.localStorage.removeItem("token");
                      }
                      if (typeof window !== "undefined") {
                        window.location.reload();
                      }
                    }}
                  >
                    Logout
                  </InterstateButton>
                </div>
              </div>
            ) : (
              !userLoading && (
                <InterstateButton
                  className="ml-2"
                  variant="primary"
                  size="md"
                  onClick={() => {
                    const event = new CustomEvent("open-login-modal");
                    window.dispatchEvent(event);
                  }}
                >
                  Login
                </InterstateButton>
              )
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 px-4 py-1">
          <button
            onClick={() => setWatchlistOpen(true)}
            className="cursor-pointer rounded p-1 duration-150 ease-in-out hover:bg-emerald-950/90 hover:brightness-110"
          >
            <FiStar />
          </button>
          <button className="cursor-pointer rounded p-1 duration-150 ease-in-out hover:bg-emerald-950/90 hover:brightness-110">
            <FiBarChart />
          </button>
          <div className="h-5 border-r border-emerald-950"> </div>
        </div>
      </header>
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
      <WatchlistModal open={watchlistOpen} onClose={() => setWatchlistOpen(false)} />
      <NotificationDropdown open={notificationOpen} onClose={() => setNotificationOpen(false)} />
      {/* Search Modal */}
      <SearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSubmit={(q) => {
          const trimmed = q.trim();
          // If it's likely a token address navigate directly to trade page
          if (trimmed.length >= 10) {
            router.push(`/trade/${trimmed}`);
            setSearch?.("");
            return;
          }

          // Otherwise treat as name search and stay on Discover
          if (setSearch) setSearch(trimmed);
          if (router.pathname !== "/") {
            router.push({ pathname: "/", query: { search: trimmed } });
          } else {
            router.replace({ pathname: "/", query: { search: trimmed } }, undefined, { shallow: true });
          }
        }}
        onQueryChange={(q) => {
          const trimmed = q.trim();

          // Skip routing updates for short queries (<3 chars)
          if (trimmed.length < 3) {
            if (router.pathname === "/" && Object.keys(router.query).includes("search")) {
              router.replace({ pathname: "/" }, undefined, { shallow: true });
            }
            if (setSearch) setSearch(trimmed);
            return;
          }

          // Live updates for longer queries
          if (router.pathname !== "/") {
            router.push({ pathname: "/", query: { search: trimmed } }, undefined, { shallow: true });
          } else {
            router.replace({ pathname: "/", query: { search: trimmed } }, undefined, { shallow: true });
          }
          if (setSearch) setSearch(trimmed);
        }}
      />
    </>
  );
}
