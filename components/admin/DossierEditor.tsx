"use client";

import { startTransition, useActionState, useMemo, useRef, useState } from "react";
import { updateDossierAction } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin/action-state";
import type { ContentItem } from "@/lib/content/types";

const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;

interface UploadSession {
  path: string;
  token: string;
}

function FeedbackMessage({ state }: { state: AdminActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`text-sm ${
        state.success ? "text-emerald-700" : "text-red-600"
      }`}
    >
      {state.message}
    </p>
  );
}

export default function DossierEditor({ dossier }: { dossier: ContentItem }) {
  const action = updateDossierAction.bind(null, dossier.id);
  const [state, formAction, isPending] = useActionState(
    action,
    initialAdminActionState
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentAssetPath, setCurrentAssetPath] = useState(dossier.asset_path ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const isBusy = isUploading || isPending;

  async function createUploadSession(file: File): Promise<UploadSession> {
    const response = await fetch("/api/admin/dossiers/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentItemId: dossier.id,
        fileName: file.name,
        contentType: file.type,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | UploadSession
      | { error?: string }
      | null;

    if (!response.ok || !payload || !('path' in payload) || !('token' in payload)) {
      const message =
        payload && 'error' in payload && typeof payload.error === "string"
          ? payload.error
          : "No se pudo preparar la subida del PDF.";
      throw new Error(message);
    }

    return payload;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formRef.current || isBusy) {
      return;
    }

    const formData = new FormData(formRef.current);
    const file = fileInputRef.current?.files?.[0];

    setIsUploading(true);
    setUploadError(null);
    setUploadMessage("");

    try {
      if (file && file.size > 0) {
        const lowerName = file.name.toLowerCase();
        const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");

        if (!isPdf) {
          throw new Error("Solo se permiten archivos PDF.");
        }

        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
          throw new Error("El PDF supera el limite de 100 MB.");
        }

        setUploadMessage("Preparando subida segura...");
        const uploadSession = await createUploadSession(file);

        setUploadMessage("Subiendo PDF a la biblioteca...");
        const { error } = await supabase.storage
          .from("dossiers")
          .uploadToSignedUrl(uploadSession.path, uploadSession.token, file, {
            cacheControl: "3600",
            contentType: "application/pdf",
            upsert: true,
          });

        if (error) {
          throw new Error(`No se pudo subir el PDF: ${error.message}`);
        }

        setCurrentAssetPath(uploadSession.path);
        formData.set("asset_path", uploadSession.path);
        formData.delete("pdf_file");
        setUploadMessage("PDF subido. Guardando cambios...");
      } else {
        formData.delete("pdf_file");
        formData.set("asset_path", currentAssetPath);
        setUploadMessage("Guardando cambios...");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "No se pudo guardar el dossier."
      );
      setUploadMessage("");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="asset_path" value={currentAssetPath} readOnly />

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-black/45">
          <span>{dossier.tier_required}</span>
          <span>mes {dossier.month_index ?? "sin mes"}</span>
          <span>{dossier.content_type}</span>
        </div>

        <label className="inline-flex items-center gap-2 rounded-full bg-[#F6F0E8] px-3 py-2 text-xs uppercase tracking-[0.18em] text-black/65">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={dossier.is_active}
            className="h-4 w-4 accent-black"
          />
          Activo
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.18em] text-black/45">
          Titulo
        </span>
        <input
          type="text"
          name="title"
          defaultValue={dossier.title}
          className="w-full rounded-2xl border border-black/10 bg-[#F6F0E8] px-4 py-3 text-sm text-black outline-none focus:border-black/30"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.18em] text-black/45">
          Descripcion
        </span>
        <textarea
          name="description"
          defaultValue={dossier.description ?? ""}
          rows={5}
          className="w-full rounded-2xl border border-black/10 bg-[#F6F0E8] px-4 py-3 text-sm leading-6 text-black outline-none focus:border-black/30"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-black/45">
            Sustituir PDF
          </span>
          <input
            ref={fileInputRef}
            type="file"
            name="pdf_file"
            accept="application/pdf,.pdf"
            className="block w-full rounded-2xl border border-black/10 bg-[#F6F0E8] px-4 py-3 text-sm text-black file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-3 file:py-2 file:text-sm file:text-[#F6F0E8]"
          />
          <p className="text-xs text-black/45">
            Subida directa a Storage con autorizacion segura. Limite recomendado: 100 MB.
          </p>
        </label>

        <div className="rounded-2xl bg-[#F6F0E8] px-4 py-3 text-sm text-black/65 break-words">
          {currentAssetPath || "Sin PDF subido"}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {uploadMessage ? <p className="text-sm text-black/60">{uploadMessage}</p> : null}
          {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
          <FeedbackMessage state={state} />
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="rounded-full border border-black/15 px-4 py-2 text-sm text-black transition-colors hover:bg-black hover:text-[#F6F0E8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Guardando..." : "Guardar dossier"}
        </button>
      </div>
    </form>
  );
}
