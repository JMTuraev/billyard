import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Header({ setSidebarOpen }) {
  const { user, userData } = useAuth();

  const roleStyles = {
    owner: "bg-red-500/20 text-red-400",
    staff: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-gray-900 px-6">

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-gray-400"
      >
        <Bars3Icon className="size-6" />
      </button>

      <div className="flex items-center gap-6 ml-auto">

        <BellIcon className="size-6 text-gray-400 hover:text-white cursor-pointer" />

        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-4 focus:outline-none">

            <div className="size-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold ring-2 ring-indigo-500 text-lg">
              {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-white">
                {user?.displayName || "User"}
              </span>

              <span
                className={`mt-1 px-3 py-0.5 text-xs font-medium rounded-full capitalize ${
                  roleStyles[userData?.role] || "bg-gray-700 text-gray-300"
                }`}
              >
                {userData?.role}
              </span>
            </div>

            <ChevronDownIcon className="size-4 text-gray-400" />
          </MenuButton>

          <MenuItems className="absolute right-0 mt-3 w-56 rounded-xl bg-gray-800 py-2 shadow-lg ring-1 ring-white/10">

            {/* SETTINGS PAGE */}
            <MenuItem>
              {({ active }) => (
                <Link
                  to="/settings"
                  className={`flex items-center gap-3 w-full px-4 py-2 text-sm ${
                    active ? "bg-white/10" : ""
                  } text-white`}
                >
                  <Cog6ToothIcon className="size-5" />
                  Settings
                </Link>
              )}
            </MenuItem>

            {/* LOGOUT */}
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => signOut(auth)}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-sm ${
                    active ? "bg-red-500/20" : ""
                  } text-red-400`}
                >
                  <ArrowRightOnRectangleIcon className="size-5" />
                  Sign out
                </button>
              )}
            </MenuItem>

          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
