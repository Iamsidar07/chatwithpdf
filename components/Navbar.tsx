"use client";
import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="border-b w-full sticky top-0 z-10 bg-white/75 backdrop-blur-lg">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="font-bold">
          Chat With PDF
        </Link>
        <div className="flex items-center gap-2">
          <SignedIn>
            <Link href="/dashboard">Dashboard</Link>
            <UserButton />
          </SignedIn>
          {/* avatar */}
          <SignedOut>
            <Link href="/sign-in">Login</Link>
            <Link href="/sign-up">Get Started</Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
