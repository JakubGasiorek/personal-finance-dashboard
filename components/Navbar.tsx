"use client";

import { FC } from "react";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <nav className="flex-between p-4 bg-green-500">
      <h1 className="text-2xl font-bold">FinTrack</h1>
      <button className="text-white" onClick={toggleSidebar}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </nav>
  );
};

export default Navbar;
