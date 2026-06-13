"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type PlaylistDropdownOption = {
  disabled?: boolean;
  label: string;
  swatchClassName?: string;
  value: string;
};

type PlaylistDropdownProps = {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: PlaylistDropdownOption[];
  placeholder?: string;
  value: string;
  variant?: "compact" | "form";
};

function getNextEnabledOptionIndex(options: PlaylistDropdownOption[], currentIndex: number, direction: 1 | -1) {
  if (options.length === 0) {
    return -1;
  }

  for (let step = 1; step <= options.length; step += 1) {
    const nextIndex = (currentIndex + step * direction + options.length) % options.length;

    if (!options[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return -1;
}

function getBoundaryEnabledOptionIndex(options: PlaylistDropdownOption[], direction: 1 | -1) {
  const startIndex = direction === 1 ? 0 : options.length - 1;

  for (let index = startIndex; index >= 0 && index < options.length; index += direction) {
    if (!options[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

export function PlaylistDropdown({ disabled = false, label, onChange, options, placeholder = "请选择", value, variant = "form" }: PlaylistDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const labelId = useId();
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const selectedOption = options.find((option) => option.value === value);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);
  const hasEnabledOptions = options.some((option) => !option.disabled);
  const isDisabled = disabled || !hasEnabledOptions;
  const displayLabel = selectedOption?.label ?? placeholder;
  const activeOptionId = isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined;
  const triggerClassName = useMemo(() => {
    const baseClassName = "group inline-flex items-center justify-between gap-2 border-2 border-stone-700/60 font-black text-[#4f2525] outline-none transition focus-visible:ring-2 focus-visible:ring-[#a54454]/35 disabled:cursor-not-allowed disabled:opacity-50";
    const stateClassName = isOpen ? "bg-[#ffeef1] shadow-[0_4px_0_rgba(112,84,84,0.12)]" : "bg-white/80 hover:-translate-y-0.5 hover:bg-[#fff4d8]";

    if (variant === "compact") {
      return `${baseClassName} ${stateClassName} min-w-[11rem] rounded-full px-3 py-1.5 text-sm`;
    }

    return `${baseClassName} ${stateClassName} mt-2 w-full rounded-[1rem] px-3 py-2 text-sm`;
  }, [isOpen, variant]);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const compactWidth = Math.max(rect.width, 288);

    setMenuStyle({
      left: rect.left,
      top: rect.bottom + 8,
      width: variant === "compact" ? compactWidth : rect.width,
    });
  }, [variant]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    const handleViewportChange = () => updateMenuPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : getBoundaryEnabledOptionIndex(options, 1));
    }
  }, [isOpen, options, selectedIndex]);

  const selectOption = (option: PlaylistDropdownOption) => {
    if (option.disabled) {
      return;
    }

    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((currentIndex) => getNextEnabledOptionIndex(options, currentIndex, event.key === "ArrowDown" ? 1 : -1));
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(getBoundaryEnabledOptionIndex(options, event.key === "Home" ? 1 : -1));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      const highlightedOption = options[highlightedIndex];

      if (highlightedOption) {
        selectOption(highlightedOption);
      }
    }
  };

  const menu = isOpen
    ? createPortal(
        <div className="fixed z-[80] overflow-hidden rounded-[1rem] border-2 border-stone-700/70 bg-[#fffaf3] p-1 shadow-[0_14px_28px_rgba(79,37,37,0.2)]" ref={menuRef} style={menuStyle}>
          <ul aria-labelledby={labelId} className="album-page-scrollbar max-h-64 overflow-y-auto" id={listboxId} role="listbox">
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              const optionStateClassName = option.disabled
                ? "cursor-not-allowed text-stone-500 opacity-50"
                : isSelected
                  ? "bg-[#f8cfd5] text-[#4f2525] hover:bg-[#f8cfd5]"
                  : isHighlighted
                    ? "bg-[#ffeef1] text-[#4f2525] hover:bg-[#ffeef1]"
                    : "text-stone-700 hover:bg-[#ffeef1]";

              return (
                <li
                  aria-disabled={option.disabled || undefined}
                  aria-selected={isSelected}
                  className={`flex cursor-pointer items-center gap-2 rounded-[0.8rem] px-3 py-2 text-sm font-black transition ${optionStateClassName}`}
                  id={`${listboxId}-option-${index}`}
                  key={option.value}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#edc2c6] bg-white/70">
                    {isSelected ? <Check aria-hidden="true" className="h-3.5 w-3.5 text-[#a54454]" /> : null}
                  </span>
                  {option.swatchClassName ? <span aria-hidden="true" className={`h-4 w-4 shrink-0 rounded-full border border-stone-700/40 ${option.swatchClassName}`} /> : null}
                  <span className="truncate">{option.label}</span>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={variant === "compact" ? "inline-flex items-center gap-2" : "relative block"} ref={rootRef}>
      <span className={variant === "compact" ? "text-xs font-black uppercase tracking-[0.12em] text-[#8d4b55]" : "block text-sm font-black text-[#4f2525]"} id={labelId}>
        {label}
      </span>
      <div className="relative min-w-0">
        <button
          aria-activedescendant={activeOptionId}
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={labelId}
          className={triggerClassName}
          disabled={isDisabled}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleKeyDown}
          ref={triggerRef}
          role="combobox"
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption?.swatchClassName ? <span aria-hidden="true" className={`h-4 w-4 shrink-0 rounded-full border border-stone-700/40 ${selectedOption.swatchClassName}`} /> : null}
            <span className="truncate">{displayLabel}</span>
          </span>
          <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {menu}
      </div>
    </div>
  );
}
