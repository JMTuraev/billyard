import { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function Header({ setSidebarOpen }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u) {
        const unsubRole = onSnapshot(doc(db, "users", u.uid), (snap) => {
          if (snap.exists()) {
            setRole(snap.data().role);
          }
          setLoadingRole(false);
        });

        return () => unsubRole();
      }
    });

    return () => unsubAuth();
  }, []);

  const roleStyles = {
    owner:
      "bg-red-500/20 text-red-400",
    staff:
      "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-gray-900 px-6">

      {/* Sidebar Button */}
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

            {/* Avatar */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="user"
                  className="size-10 rounded-full object-cover ring-2 ring-indigo-500"
                />
              ) : (
                <div className="size-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold ring-2 ring-indigo-500 text-lg">
                  {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Name + Role */}
            <div className="flex flex-col items-start leading-tight">

              <span className="text-sm font-semibold text-white">
                {user?.displayName || "User"}
              </span>

              {/* Badge yoki Loading */}
              {loadingRole ? (
                <div className="mt-1 h-5 w-16 rounded-full bg-gray-700 animate-pulse" />
              ) : (
                <span
                  className={`mt-1 px-3 py-0.5 text-xs font-medium rounded-full capitalize ${
                    roleStyles[role] || "bg-gray-700 text-gray-300"
                  }`}
                >
                  {role}
                </span>
              )}
            </div>

            <ChevronDownIcon className="size-4 text-gray-400" />
          </MenuButton>

          <MenuItems className="absolute right-0 mt-3 w-40 rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-white/10">

            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => signOut(auth)}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    active ? "bg-white/10" : ""
                  } text-white`}
                >
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
