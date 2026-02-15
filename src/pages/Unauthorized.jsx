import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Unauthorized({ role }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-10 text-center max-w-md w-full shadow-2xl">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-red-500/10">
            <ExclamationTriangleIcon className="size-10 text-red-400" />
          </div>
        </div>

        {/* Code */}
        <h1 className="text-4xl font-bold mb-2">403</h1>

        <p className="text-gray-400 mb-6">
          You don’t have permission to access this page.
        </p>

        {role && (
          <div className="mb-6">
            <span className="text-sm text-gray-500">Your role:</span>
            <div className="mt-2 inline-block px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium capitalize">
              {role}
            </div>
          </div>
        )}

        <Link
          to="/"
          className="inline-block px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-sm font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
