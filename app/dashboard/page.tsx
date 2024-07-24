"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/unauthorized"); // Redirect to unauthorized page if not authenticated
      } else {
        setLoading(false); // User is authenticated, stop loading
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const logout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-300">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        logout={logout}
      />
      <div className="flex-1">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="text-white mt-10 pt-12">
          <h1 className="flex-center text-3xl">Welcome to your dashboard</h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
