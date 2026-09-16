import type { Status } from "@/lib/types";

const STEPS: Status[] = ["Pending", "In Progress", "Resolved"];

export function StatusTimeline({ status }: { status: Status }) {
  const currentIdx = STEPS.indexOf(status);

  return (
    <ol className="flex w-full items-center">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={step} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all duration-500 ${
                  done
                    ? "border-ok bg-ok text-white"
                    : active
                      ? "animate-pulse-ring border-primary bg-primary text-white"
                      : "border-line bg-canvas text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-semibold ${
                  active ? "text-primary-dark" : done ? "text-ok" : "text-muted"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative mx-2 mb-5 h-0.5 flex-1 overflow-hidden rounded bg-line">
                <div
                  className={`absolute inset-y-0 left-0 rounded bg-ok transition-all duration-700 ${
                    done ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
