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
import { deleteDocument, InviteUserToDocument } from "@/actions/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

function InviteUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");
  const pathname = usePathname();

  const handInvite = async (e: FormEvent) => {
    e.preventDefault();

    const roomId = pathname.split("/").pop();
    if (!roomId) {
      return;
    }

    startTransition(async () => {
      const { success } = await InviteUserToDocument(roomId, email);

      if (success) {
        setIsOpen(false);
        setEmail("");
        toast.success("User was Invited successfully");
      } else {
        toast.error("Failed to add user to the room");
      }
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>Invite</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite the User to collaborate</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to invite to collaborate on
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handInvite} className="flex  gap-2 ">
          <Input
            placeholder="Email"
            type="email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={!email || isPending}>
            {isPending ? "Inviting..." : "Invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteUser;
