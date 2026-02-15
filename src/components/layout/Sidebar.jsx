import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  HomeIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { name: "Dashboard", path: "/", icon: HomeIcon, roles: ["owner", "staff"] },
  { name: "Tables", path: "/tables", icon: ChartPieIcon, roles: ["owner", "staff"] },
  { name: "Stats", path: "/stats", icon: ChartPieIcon, roles: ["owner"] }, // faqat owner
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { role, loading } = useAuth();

  if (loading) return null;

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile */}
      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-900/80" />

        <div className="fixed inset-0 flex">
          <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <XMarkIcon className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
              <nav className="flex flex-1 flex-col mt-6">
                <ul className="space-y-2">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={classNames(
                          location.pathname === item.path
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:bg-white/10 hover:text-white",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition"
                        )}
                      >
                        <item.icon className="size-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-gray-900 border-r border-white/10">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
          <nav className="flex flex-1 flex-col mt-6">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={classNames(
                      location.pathname === item.path
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/10 hover:text-white",
                      "group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition"
                    )}
                  >
                    <item.icon className="size-6 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
