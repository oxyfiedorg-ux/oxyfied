import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenId
}) => {
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-sm hover:border-slate-300 transition-colors"
          >
            {/* Header Click Area */}
            <button
              onClick={() => handleToggle(item.id)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-medium text-slate-800 hover:text-slate-900 transition-colors focus:outline-none focus:bg-slate-50/50"
            >
              <div className="flex-1 pr-4">
                <span className="font-display font-semibold text-slate-900 sm:text-base text-sm block">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-xs text-slate-500 font-normal mt-0.5 block">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400 flex-shrink-0"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>

            {/* Collapsible Content Area */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/30 text-sm text-slate-600 leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
