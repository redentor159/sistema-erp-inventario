"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      {children}
    </div>
  );
}
