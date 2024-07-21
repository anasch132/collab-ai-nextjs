"use client";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import React, { useEffect, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { color } from "framer-motion";
import { stringToHslColor } from "@/lib/stringToHslColor";
import TranslateDoc from "./TranslateDoc";
import ChatToDoc from "./ChatToDoc";

type EditorCollaborativeProps = {
  doc: Y.Doc;
  provider: any;
  darkMode: boolean;
};

function BlocNote({ doc, provider, darkMode }: EditorCollaborativeProps) {
  const userInfo = useSelf((me) => me.info);

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo?.name,
        color: stringToHslColor(userInfo?.email),
      },
    },
  });
  return (
    <div className="relative max-6-xl mx-auto">
      <BlockNoteView
        editor={editor}
        theme={darkMode ? "dark" : "light"}
        className="min-h-screen"
      />
    </div>
  );
}

function EditorCollaborative() {
  const room = useRoom();

  const [darkMode, setDarkMode] = useState(false);
  const [doc, setDoc] = useState<Y.Doc>();

  const [provider, setProvider] = useState<LiveblocksYjsProvider>();

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yProvider.destroy();
      yDoc.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700"
  }`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        {/* translate document */}

        <TranslateDoc doc={doc} />
        {/* chat to document */}

        <ChatToDoc doc={doc} />
        {/* Dark mode */}

        <Button
          className={style}
          onClick={() => {
            setDarkMode(!darkMode);
          }}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>

      {/* BlocNote */}

      <BlocNote doc={doc} provider={provider} darkMode={darkMode} />
    </div>
  );
}

export default EditorCollaborative;
