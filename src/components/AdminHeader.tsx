"use client";

import Link from "next/link";

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface AdminHeaderProps {
  title?: string;
  backHref?: string;
  navItems?: NavItem[];
  rightItems?: NavItem[];
}

export default function AdminHeader({ title, backHref, navItems = [], rightItems = [] }: AdminHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {backHref && (
            <Link href={backHref} className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
              Back
            </Link>
          )}
          {navItems.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
                {item.label}
              </Link>
            ) : (
              <button key={item.label} onClick={item.onClick} className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
                {item.label}
              </button>
            )
          )}
          {title && (
            <h1 className="text-base font-semibold text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-6">
          {rightItems.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
                {item.label}
              </Link>
            ) : (
              <button key={item.label} onClick={item.onClick} className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
                {item.label}
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
