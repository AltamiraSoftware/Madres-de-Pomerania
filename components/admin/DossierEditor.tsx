"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateDossierAction } from "@/app/admin/actions";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin/action-state";
import type { ContentItem } from "@/lib/content/types";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-black/15 px-4 py-2 text-sm text-black transition-colors hover:bg-black hover:text-[#F6F0E8] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar dossier"}
    </button>
  );
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
  const [state, formAction] = useActionState(action, initialAdminActionState);

  return (
    <form action={formAction} className="space-y-4">
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
            type="file"
            name="pdf_file"
            accept="application/pdf,.pdf"
            className="block w-full rounded-2xl border border-black/10 bg-[#F6F0E8] px-4 py-3 text-sm text-black file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-3 file:py-2 file:text-sm file:text-[#F6F0E8]"
          />
        </label>

        <div className="rounded-2xl bg-[#F6F0E8] px-4 py-3 text-sm text-black/65">
          {dossier.asset_path ?? "Sin PDF subido"}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FeedbackMessage state={state} />
        <SubmitButton />
      </div>
    </form>
  );
}
