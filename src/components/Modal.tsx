import { ReactNode, useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { cc } from "../utils/cc";
export type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};
// Whenever we call the onClose, we do not want to close the modal. We want to set it up to start closing and then wait for the animation to finish
export function Modal({ children, isOpen, onClose }: ModalProps) {
  // for onclosing whan it is true we want to set onClosing is true, wait for it to finish closing and then we can actually remove our modal
  const [isClosing, setIsClosing] = useState(false);
  const prevIsOpen = useRef<boolean>();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);

    return () => {
      document.addEventListener("keydown", handler);
    };
  }, [onClose]);
  // This must go into effect before the component re-renders because it would hide the component
  // We are using a useLayout effect instead of a normal effect, because if we did not, it would not check the conditional first and set the is closing to the proper value
  useLayoutEffect(() => {
    // the user went from isOpen to to not isOpen or closed
    if (!isOpen && prevIsOpen.current) {
      // if the conditional is met, then set isClosing to true
      // only when the user goes from open to close are we going to set isClosing to true
      // we want to set our prveviousIsOpen.current to isOpen
      setIsClosing(true);
    }
    //
    prevIsOpen.current = isOpen;
  }, [isOpen]);
  // If the modal is not open or we are in the process of showing the isClosing animation, then we do not want to remove it from the actual DOM
  if (!isOpen && !isClosing) return null;

  return createPortal(
    <div
      onAnimationEnd={() => setIsClosing(false)}
      className={cc("modal", isClosing && "closing")}
    >
      <div className="overlay" onClick={onClose} />
      <div className="modal-body">{children}</div>
    </div>,
    document.querySelector("#modal-container") as HTMLElement
  );
}
