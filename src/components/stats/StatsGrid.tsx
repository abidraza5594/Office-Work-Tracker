import { motion } from "framer-motion";
import type { StatCardData } from "@/types";

interface StatsGridProps {
  cards: StatCardData[];
}

export function StatsGrid({ cards }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-lg border border-border-subtle bg-bg-surface p-4"
        >
          <span className="text-2xl">{card.icon}</span>
          <p className="mt-3 text-xs font-bold uppercase text-text-muted">{card.label}</p>
          <p className="mt-1 font-heading text-2xl font-bold text-text-primary">{card.value}</p>
          <p className="mt-1 text-xs text-text-muted">{card.detail}</p>
        </motion.div>
      ))}
    </div>
  );
}
