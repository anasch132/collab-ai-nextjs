"use client";
import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";

function SideBarOption({ href, id }: { href: string; id: string }) {
  const [data, loading, error] = useDocumentData(doc(db, "documents", id));
  const pathnName = usePathname();
  const isActive = href.includes(pathnName) && pathnName !== "/";

  if (!data) return null;

  return (
    <Link
      href={href}
      className={`relative border p-2 rounded-md w-full ${
        isActive
          ? "bg-gray-500 text-white text-center font-bold border-black"
          : "bg-gray-100 text-center"
      }`}
    >
      <span className="turncate"> {data?.title}</span>
    </Link>
  );
}

export default SideBarOption;
