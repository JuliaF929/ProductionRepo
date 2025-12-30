import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Reusable Bootstrap multi-select with chips (LinkedIn-like).
 *
 * Props:
 *  - options: string[]                 (all available values)
 *  - value: string[]                   (selected values)
 *  - onChange: (newValue: string[]) => void
 *  - placeholder?: string
 *  - disabled?: boolean
 */
export default function MultiSelectChips({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (options || []).filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  function addItem(item) {
    if (disabled) return;
    if (!value.includes(item)) onChange([...value, item]);
    setQuery("");
    setIsOpen(true);
    if (inputRef.current) inputRef.current.focus();
  }

  function removeItem(item) {
    if (disabled) return;
    onChange(value.filter((x) => x !== item));
    if (inputRef.current) inputRef.current.focus();
  }

  function handleKeyDown(e) {
    if (disabled) return;

    if (e.key === "Backspace" && query === "" && value.length > 0) {
      removeItem(value[value.length - 1]);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const q = query.trim().toLowerCase();
      if (!q) return;

      const exact = filtered.find((o) => o.toLowerCase() === q);
      if (exact) addItem(exact);
      else if (filtered.length === 1) addItem(filtered[0]);
    }

    if (e.key === "Escape") setIsOpen(false);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current || !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="position-relative" ref={wrapRef}>
      <div
        className={"form-control d-flex flex-wrap gap-2 align-items-center" + (disabled ? " bg-light" : "")}
        style={{ minHeight: 44, cursor: disabled ? "not-allowed" : "text" }}
        onMouseDown={(e) => {
          e.preventDefault();
          if (disabled) return;
          if (inputRef.current) inputRef.current.focus();
          setIsOpen(true);
        }}
      >
        {value.map((item) => (
          <span
            key={item}
            className="badge rounded-pill text-bg-primary d-inline-flex align-items-center"
            style={{ gap: 6 }}
          >
            {item}
            {!disabled && (
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label={"Remove " + item}
                style={{ width: 10, height: 10 }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => removeItem(item)}
              />
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          className="border-0 flex-grow-1"
          style={{ outline: "none", minWidth: 140, background: "transparent" }}
          value={query}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          onFocus={() => !disabled && setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {!disabled && isOpen && (
        <div className="dropdown-menu show w-100 mt-1" style={{ maxHeight: 220, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div className="dropdown-item-text text-muted">No matches</div>
          ) : (
            filtered.map((item) => {
              const selected = value.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={
                    "dropdown-item d-flex justify-content-between align-items-center" +
                    (selected ? " disabled" : "")
                  }
                  onClick={() => !selected && addItem(item)}
                >
                  <span>{item}</span>
                  {selected && <span className="badge text-bg-secondary">Selected</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
