import type { ReactNode, Key } from "react";
import { useRef, useLayoutEffect, useState } from "react";
// This will return something that will wrap our normal events section and determine what the size of the container is and if the elements inside of it are overflowing it, and it's going to allow you to do different things based on that.
type OverflowContainerProps<T> = {
  items: T[];
  renderItem: (item: T) => ReactNode;
  renderOverflow: (overflowAmount: number) => ReactNode;
  getKey: (item: T) => Key;
  className?: string;
};

export function OverflowContainer<T>({
  // items are a bunch of diffeent events that we want to render out to the screen
  items,
  getKey,
  // this will be a function that takes in an item and returns a new actual piece of DOM that we can render out
  renderItem,
  // this function will show us what our overflow will look like
  renderOverflow,
  // Custom class name of events
  className,
}: OverflowContainerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflowAmount, setOverflowAmount] = useState(0);
  // We want to loop through all the children to determine which one is the first to cross the border threhold where the container ends
  // we have to determine which event crosses the threshold for the container
  // we want the useLayoutEffect to run before the DOM gets painted to the screen because if we have an overflow we want to show the button and not the overflow item
  useLayoutEffect(() => {
    if (containerRef.current == null) return;

    const observer = new ResizeObserver((entries) => {
      const containerElement = entries[0]?.target;
      if (containerElement == null) return;
      const children =
        containerElement.querySelectorAll<HTMLElement>("[data-item]");
      const overflowElement =
        containerElement.parentElement?.querySelector<HTMLElement>(
          "[data-overflow]"
        );
      // Make sure the overflow part is hidden and all of the children are visible
      if (overflowElement != null) overflowElement.style.display = "none";
      children.forEach((child) => child.style.removeProperty("display"));
      // Then we check if any of the children are overflowing
      let amount = 0;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        // if the scrollheight is larger than the client height
        if (containerElement.scrollHeight <= containerElement.clientHeight) {
          // we do not need to scroll or hide the content of any events in this case
          break;
        }
        // this is the amount of things that are overflowing
        // so if you have 10 items and then when you get to the sixth one the containerElement scrollHeight is > greater than the containerLement client height then we have 4 items that are overflowing
        amount = children.length - i;
        child.style.display = "none";
        overflowElement?.style.removeProperty("display");
      }
      setOverflowAmount(amount);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [items]);

  return (
    <>
      <div className={className} ref={containerRef}>
        {items.map((item) => (
          <div data-item key={getKey(item)}>
            {renderItem(item)}{" "}
          </div>
        ))}
      </div>
      <div data-overflow>{renderOverflow(overflowAmount)}</div>
    </>
  );
}
