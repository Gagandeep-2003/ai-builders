"use client";

import { motion, useInView } from "framer-motion";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function AnimatedItem({
  children,
  index,
  onMouseEnter,
  onClick,
}: {
  children: ReactNode;
  index: number;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList<T>({
  items,
  renderItem,
  getItemKey,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className,
  listClassName,
  initialSelectedIndex = -1,
  selectedItemAttribute,
}: {
  items: T[];
  renderItem: (item: T, index: number, selected: boolean) => ReactNode;
  getItemKey: (item: T) => string;
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  listClassName?: string;
  initialSelectedIndex?: number;
  selectedItemAttribute?: (item: T) => boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableArrowNavigation) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((previous) => Math.min(previous + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((previous) => Math.max(previous - 1, 0));
    } else if (event.key === "Enter" && selectedIndex >= 0 && selectedIndex < items.length) {
      event.preventDefault();
      onItemSelect?.(items[selectedIndex], selectedIndex);
    } else if (event.key === "Tab" && !event.shiftKey && selectedIndex < items.length - 1) {
      event.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((previous) => Math.min(Math.max(previous, -1) + 1, items.length - 1));
    } else if (event.key === "Tab" && event.shiftKey && selectedIndex > 0) {
      event.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((previous) => Math.max(previous - 1, 0));
    }
  }, [enableArrowNavigation, items, onItemSelect, selectedIndex]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const selectedItem = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    selectedItem?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setKeyboardNav(false);
  }, [keyboardNav, selectedIndex]);

  useEffect(() => {
    const currentIndex = selectedItemAttribute ? items.findIndex(selectedItemAttribute) : -1;
    if (currentIndex < 0) return;
    const frame = requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-index="${currentIndex}"]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [items, selectedItemAttribute]);

  return (
    <div className={cn("scroll-list-container", className)}>
      <div
        ref={listRef}
        role="listbox"
        tabIndex={0}
        aria-label="AI Builders League standings"
        aria-activedescendant={selectedIndex >= 0 ? `league-entry-${selectedIndex}` : undefined}
        className={cn("scroll-list scrollbar-soft", listClassName)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={getItemKey(item)}
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              onItemSelect?.(item, index);
            }}
          >
            <div id={`league-entry-${index}`} role="option" aria-selected={selectedIndex === index}>
              {renderItem(item, index, selectedIndex === index)}
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients ? (
        <>
          <div className="scroll-list-gradient scroll-list-gradient-top" style={{ opacity: topGradientOpacity }} />
          <div className="scroll-list-gradient scroll-list-gradient-bottom" style={{ opacity: bottomGradientOpacity }} />
        </>
      ) : null}
    </div>
  );
}
