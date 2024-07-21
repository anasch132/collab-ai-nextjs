"use client";
import React, { useEffect, useState } from "react";
import NewDocumentButton from "./NewDocumentButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import {
  collectionGroup,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import SideBarOption from "./SideBarOption";

interface RoomDocument extends DocumentData {
  createdAt: string;
  roomId: string;
  userId: string;
  role: "owner" | "editor" | "viewer";
}

function Sidebar() {
  const { user } = useUser();

  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
    viewer: RoomDocument[];
  }>({ owner: [], editor: [], viewer: [] });

  const [data, loading, error] = useCollection(
    user &&
      query(
        collectionGroup(db, "rooms"),
        where("userId", "==", user.emailAddresses[0].toString())
      )
  );
  useEffect(() => {
    if (!data) return;
    const grouped = data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
      viewer: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomData = curr.data() as RoomDocument;
        if (roomData.role === "owner") {
          acc.owner.push({
            id: curr.id,
            ...roomData,
          });
        } else if (roomData.role === "editor") {
          acc.editor.push({
            id: curr.id,
            ...roomData,
          });
        } else {
          acc.viewer.push({
            id: curr.id,
            ...roomData,
          });
        }

        return acc;
      },
      { owner: [], editor: [], viewer: [] }
    );

    setGroupedData(grouped);
  }, [data]);

  const menyuOptions = (
    <>
      {/* add button */}
      <NewDocumentButton />

      {/* document list */}
      <div className="flex py-4 flex-col space-y-4 md:max-w-36">
        {groupedData.owner.length === 0 ? (
          <h2 className="text-gray-500 font-semibold text-sm">
            No document found
          </h2>
        ) : (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              My documents
            </h2>
            {groupedData.owner.map((doc) => (
              <SideBarOption
                key={doc.id}
                id={doc.id}
                href={`/document/${doc.id}`}
              />
            ))}
          </>
        )}
      </div>

      {/* shared with me */}
      <div className="flex py-4 flex-col space-y-4 md:max-w-36">
        {groupedData.editor.length > 0 && (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              Shared with me
            </h2>

            {groupedData.editor.map((doc) => (
              <SideBarOption
                key={doc.id}
                id={doc.id}
                href={`/document/${doc.id}`}
              />
            ))}
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="p-2 md:p-5 bg-gray-300 relative">
      <div className="md:hidden justify-center">
        <Sheet>
          <SheetTrigger>
            <MenuIcon
              className="p-2 hover:opacity-30 rounded-lg"
              size={40}
            ></MenuIcon>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="">
              <SheetTitle>Menu</SheetTitle>
              <div className="text-center">{menyuOptions}</div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <div className=" hidden md:inline">{menyuOptions}</div>
    </div>
  );
}

export default Sidebar;
