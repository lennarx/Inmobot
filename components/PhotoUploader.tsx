"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhoto } from "@/app/actions";
import { compressImage } from "./compress";

export function PhotoUploader({ apartmentId, kind, label }: { apartmentId: string | null; kind: "living" | "other" | "my_living"; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    try {
      for (let i = 0; i < files.length; i++) {
        setBusy(`Subiendo ${i + 1}/${files.length}…`);
        const blob = await compressImage(files[i]);
        const fd = new FormData();
        fd.set("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        fd.set("kind", kind);
        if (apartmentId) fd.set("apartment_id", apartmentId);
        await uploadPhoto(fd);
      }
      router.refresh();
    } catch (e) {
      alert(`Error subiendo: ${(e as Error).message}`);
    } finally {
      setBusy(null);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => ref.current?.click()}>
        {busy ?? `📷 ${label}`}
      </button>
    </>
  );
}
