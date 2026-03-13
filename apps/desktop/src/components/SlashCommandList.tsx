import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export type SlashCommandItem = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
};

type SlashCommandListProps = {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
};

export type SlashCommandListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

export const SlashCommandList = forwardRef<SlashCommandListHandle, SlashCommandListProps>(
  function SlashCommandList({ items, onSelect }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];

      if (item) {
        onSelect(item);
      }
    };

    const moveUp = () => {
      if (items.length === 0) {
        return;
      }
      setSelectedIndex((index) => (index + items.length - 1) % items.length);
    };

    const moveDown = () => {
      if (items.length === 0) {
        return;
      }
      setSelectedIndex((index) => (index + 1) % items.length);
    };

    const enter = () => {
      selectItem(selectedIndex);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          moveUp();
          return true;
        }

        if (event.key === "ArrowDown") {
          moveDown();
          return true;
        }

        if (event.key === "Enter") {
          enter();
          return true;
        }

        return false;
      }
    }), [items.length, selectedIndex]);

    if (items.length === 0) {
      return (
        <div className="slash-menu">
          <p className="slash-menu-empty">No markdown commands found.</p>
        </div>
      );
    }

    return (
      <div className="slash-menu" role="listbox" aria-label="Markdown commands">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`slash-menu-item ${index === selectedIndex ? "is-active" : ""}`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className="slash-menu-title">{item.title}</span>
            <span className="slash-menu-description">{item.description}</span>
          </button>
        ))}
      </div>
    );
  }
);
