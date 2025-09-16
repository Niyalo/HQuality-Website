"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook to detect the current page

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // Get the current URL path

  // This effect closes the mobile menu if the user resizes the window to be larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint in Tailwind
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { href: "/properties", label: "Properties" },
    { href: "/clients", label: "Clients" },
    { href: "/agents", label: "Agents" }, // Or "/users" if that's the correct path
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link className="block text-teal-600 dark:text-teal-300" href="/">
              <span className="sr-only">Home</span>
              <div className="text-2xl font-bold">Agent Dashboard</div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Global" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className={`transition hover:text-gray-500/75 dark:hover:text-white/75 ${
                      pathname === link.href
                        ? "text-teal-600 dark:text-teal-400 font-semibold"
                        : "text-gray-500 dark:text-white"
                    }`}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Logout Button (Visible on all screen sizes) */}
            <div className="hidden sm:flex">
                <button
                  type="button"
                  // Add your logout logic to onClick
                  onClick={() => alert('Logout clicked!')}
                  className="rounded-md bg-blue-600 px-5 py-2.5 ml-5 text-sm font-medium text-white shadow transition hover:bg-red-700"
                >
                  Logout
                </button>
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <div className="block md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75 dark:bg-gray-800 dark:text-white dark:hover:text-white/75"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Toggle menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <nav aria-label="Mobile Global" className="p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                className={`block rounded-lg px-4 py-2 text-base transition ${
                  pathname === link.href
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile Logout Button */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => alert('Logout clicked!')}
                  className="w-full rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-red-700"
                >
                  Logout
                </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;