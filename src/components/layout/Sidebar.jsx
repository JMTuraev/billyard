import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import {
  XMarkIcon,
  HomeIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Dashboard", path: "/", icon: HomeIcon, roles: ["owner", "staff"] },
  { name: "Tables", path: "/tables", icon: ChartPieIcon, roles: ["owner", "staff"] },
  { name: "Stats", path: "/stats", icon: ChartPieIcon, roles: ["owner"] },
  { name: "Sessions", path: "/sessions", icon: ChartPieIcon, roles: ["owner"] },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { userData, loading, user } = useAuth();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "clubs", user.uid), (snap) => {
      if (snap.exists()) {
        setCompanyName(snap.data().name);
      }
    });

    return () => unsub();
  }, [user]);

  if (loading) return null;

  const role = userData?.role;

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {/* ================= MOBILE ================= */}
      {sidebarOpen && (
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop className="fixed inset-0 bg-gray-900/80" />

          <div className="fixed inset-0 flex">
            <DialogPanel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900 border-r border-white/10">

              {/* CLOSE */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2"
              >
                <XMarkIcon className="size-6 text-white" />
              </button>

              {/* BRAND — HEADER HEIGHT BILAN MOS */}
              <div className="h-16 flex items-center justify-center border-b border-white/10">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
                  {companyName || "Billiard Club"}
                </h1>
              </div>

              {/* NAV */}
              <div className="px-6 pt-6 flex-1">
                <nav>
                  <ul className="space-y-2">
                    {filteredNavigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:bg-white/10 hover:text-white"
                            }`
                          }
                        >
                          <item.icon className="size-6 shrink-0" />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-gray-900 border-r border-white/10">

        <div className="flex flex-col grow">

          {/* BRAND — HEADER HEIGHT BILAN BIR XIL */}
          <div className="h-16 flex items-center justify-center border-b border-white/10">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
              {companyName || "Billiard Club"}
            </h1>
          </div>

          {/* NAVIGATION */}
          <div className="px-6 pt-6 flex-1 overflow-y-auto">
            <nav>
              <ul className="space-y-2">
                {filteredNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="size-6 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </>
  );
}
