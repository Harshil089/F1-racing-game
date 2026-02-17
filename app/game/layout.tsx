import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race | F1 Reflex Racing",
  description: "Racing in progress",
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}
