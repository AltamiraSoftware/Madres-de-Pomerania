"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateEmailSequenceAction } from "@/app/admin/actions";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/admin/action-state";
import type { AdminEmailSequence } from "@/lib/admin/email-sequences";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-[#251b12] bg-[#251b12] px-4 py-2 text-sm text-[#f7efe3] transition-colors hover:bg-[#3a2c1f] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f5ecdf] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#7b6a58]">
      {children}
    </span>
  );
}

export default function EmailSequenceEditor({
  sequence,
}: {
  sequence: AdminEmailSequence;
}) {
  const action = updateEmailSequenceAction.bind(null, sequence.id);
  const [state, formAction] = useActionState(action, initialAdminActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{sequence.tier_required}</Badge>
            <Badge>dia {sequence.day_offset}</Badge>
            <Badge>{sequence.template_key}</Badge>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d7a67]">
              Asunto
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5e5145]">
              Ajusta el contenido editorial que leeran las usuarias en este hito.
            </p>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 rounded-full border border-[#dccfbe] bg-white px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#5d5044]">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={sequence.is_active}
            className="h-4 w-4 accent-black"
          />
          Activa
        </label>
      </div>

      <input
        type="text"
        name="subject"
        defaultValue={sequence.subject}
        className="w-full rounded-[22px] border border-[#e3d6c7] bg-[#fcf8f3] px-4 py-3 text-sm text-[#251b12] outline-none transition-colors focus:border-[#9a8268]"
        required
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#8d7a67]">
            Heading
          </span>
          <textarea
            name="heading"
            defaultValue={sequence.heading ?? ""}
            rows={3}
            className="w-full rounded-[22px] border border-[#e3d6c7] bg-[#fcf8f3] px-4 py-3 text-sm text-[#251b12] outline-none transition-colors focus:border-[#9a8268]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#8d7a67]">
            CTA label
          </span>
          <input
            type="text"
            name="cta_label"
            defaultValue={sequence.cta_label ?? ""}
            className="w-full rounded-[22px] border border-[#e3d6c7] bg-[#fcf8f3] px-4 py-3 text-sm text-[#251b12] outline-none transition-colors focus:border-[#9a8268]"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#8d7a67]">
          Body
        </span>
        <textarea
          name="body"
          defaultValue={sequence.body ?? ""}
          rows={8}
          className="w-full rounded-[22px] border border-[#e3d6c7] bg-[#fcf8f3] px-4 py-3 text-sm leading-6 text-[#251b12] outline-none transition-colors focus:border-[#9a8268]"
        />
      </label>

      <label className="space-y-2">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#8d7a67]">
          CTA URL
        </span>
        <input
          type="text"
          name="cta_url"
          defaultValue={sequence.cta_url ?? ""}
          className="w-full rounded-[22px] border border-[#e3d6c7] bg-[#fcf8f3] px-4 py-3 text-sm text-[#251b12] outline-none transition-colors focus:border-[#9a8268]"
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-[#efe4d6] pt-4 md:flex-row md:items-center md:justify-between">
        <FeedbackMessage state={state} />
        <SubmitButton />
      </div>
    </form>
  );
}
