"use client";
import React, { FormEvent, startTransition, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  deleteDocument,
  InviteUserToDocument,
  RemoveUserFromDocument,
} from "@/actions/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useCollection } from "react-firebase-hooks/firestore";
import useOwner from "@/lib/useOwner";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react/suspense";
import { collectionGroup, query, where } from "firebase/firestore";
import { db } from "@/firebase";

function ManageUsers() {
  const { user } = useUser();
  const isOwner = useOwner();

  const room = useRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [usersInRoom] = useCollection(
    user && query(collectionGroup(db, "rooms"), where("roomId", "==", room.id))
  );

  const handDeleteUser = (userId: string) => {
    setIsPending(true);
    startTransition(async () => {
      if (!user) return;
      const { success } = await RemoveUserFromDocument(room.id, userId);

      if (success) {
        setIsPending(false);
        toast.success("User was removed successfully");
      } else {
        setIsPending(false);
        toast.error("Failed to remove user from the room");
      }
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>Users ({usersInRoom?.docs.length})</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with Access</DialogTitle>
          <DialogDescription>
            Below is the list of users who have access to this document
          </DialogDescription>
        </DialogHeader>

        <hr className="my-2" />

        <div className="flex flex-col space-y-2">
          {usersInRoom?.docs.map((doc) => (
            <div
              key={doc.data().userId}
              className="flex items-center justify-between"
            >
              <p className="font-light">
                {doc.data().userId === user?.emailAddresses[0].toString()
                  ? `You (${doc.data().userId})`
                  : doc.data().userId}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline">{doc.data().role}</Button>

                {isOwner &&
                  doc.data().userId !==
                    user?.emailAddresses?.[0]?.toString() && (
                    <Button
                      variant="destructive"
                      onClick={() => handDeleteUser(doc.data().userId)}
                      disabled={isPending}
                      size="sm"
                    >
                      {isPending ? "Deleting..." : "X"}
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;
