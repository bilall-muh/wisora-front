"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="w-full bg-white border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors"
        >
          <Image src={"/wisora.png"} width={150} height={120} alt="Wisora" />
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <div className="flex gap-3">
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};
