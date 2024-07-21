'use server'

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";

export async function CreateNewDocument() {

    auth().protect();

    const { sessionClaims } = await auth();


    const docCollectionRef = adminDb.collection("documents");

    const docRef = await docCollectionRef.add({
        title: "New Doc",
    })

    await adminDb
        .collection("users")
        .doc(sessionClaims?.email!)
        .collection("rooms")
        .doc(docRef.id)
        .set({
            userId: sessionClaims?.email!,
            role: "owner",
            createdAt: new Date(),
            roomId: docRef.id,
        })

    return {
        docId: docRef.id,
    }
}

export const deleteDocument = async (docId: string) => {
    auth().protect();

    const { sessionClaims } = await auth();
    try {

        await adminDb
            .collection("documents")
            .doc(docId)
            .delete()

        const query = await adminDb.collectionGroup("rooms").where("roomId", "==", docId).get()

        const batch = adminDb.batch()

        query.docs.forEach((doc) => {
            batch.delete(doc.ref)
        })

        await batch.commit()

        await liveblocks.deleteRoom(docId)

        return {
            message: "Document deleted",
            success: true,
        }
    } catch (error) {
        return {
            message: "Failed to delete document",
            success: false,
        }
    }
}


export const InviteUserToDocument = async (roomId: string, email: string) => {
    auth().protect();

    try {
        await adminDb
            .collection("users")
            .doc(email)
            .collection("rooms")
            .doc(roomId)
            .set({
                userId: email,
                role: "editor",
                createdAt: new Date(),
                roomId,
            })

        return {
            message: "User invited successfully",
            success: true,
        }
    } catch (error) {
        console.log(error)
        return {
            message: "Failed to invite user",
            success: false,
        }
    }


}

export const RemoveUserFromDocument = async (roomId: string, email: string) => {
    auth().protect();

    try {
        await adminDb
            .collection("users")
            .doc(email)
            .collection("rooms")
            .doc(roomId)
            .delete()

        return {
            message: "User removed successfully",
            success: true,
        }
    } catch (error) {
        return {
            message: "Failed to remove user",
            success: false,
        }
    }
}