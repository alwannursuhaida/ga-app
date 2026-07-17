// made by al with love
import { statusLabel, statusStyle, conditionLabel, conditionStyle } from "@/lib/labels";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-sm px-2 py-1 font-mono text-[11px] ${statusStyle[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span className={`rounded-sm px-2 py-1 font-mono text-[11px] ${conditionStyle[condition]}`}>
      {conditionLabel[condition]}
    </span>
  );
}
