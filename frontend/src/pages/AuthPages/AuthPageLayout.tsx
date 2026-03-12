import React from "react";

import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}

        {/* Right Panel: Centered Content */}
        <div className="hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:flex items-center justify-center">
          <div className="relative z-1">


            <div className="flex flex-col items-center text-center max-w-xs mx-auto">
              <Link to="/" className="block mb-6">
                <img
                  width={270}
                  height={60}
                  src="/images/logo/auth-logo.svg"
                  alt="Logo"
                />
              </Link>

              <h2 className="text-2xl font-semibold tracking-wide text-white">
                Build. Deploy. Code.
              </h2>

              <p className="mt-4 text-white text-sm leading-relaxed">
                CloudIDE powered by Kodebox — <br />
                Secure, scalable and developer-first environment.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}