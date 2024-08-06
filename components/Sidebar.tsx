"use client";

import { SidebarProps } from "@/types";
import { FC } from "react";

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar, logout }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-dark-500 transition-transform transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } w-56 z-50 md:w-72`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 text-white"
      >
        X
      </button>

      <ul className="p-4 space-y-2 mt-12 text-white">
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li>
          <a href="/dashboard/goals">Goals</a>
        </li>
        <li>
          <button onClick={logout}>Logout</button>
        </li>
      </ul>
      <p className="absolute bottom-0 text-white p-4 copyright">
        © 2024 FinTrack
      </p>
    </div>
  );
};

export default Sidebar;
