import { useEffect } from 'react';

function isProtectedImage(target: EventTarget | null): target is HTMLImageElement {
  return target instanceof HTMLImageElement;
}

/** Blocks casual drag, right-click save, and touch-hold save on images. */
export function useImageProtection() {
  useEffect(() => {
    const blockDrag = (event: DragEvent) => {
      if (isProtectedImage(event.target)) {
        event.preventDefault();
      }
    };

    const blockContextMenu = (event: MouseEvent) => {
      if (isProtectedImage(event.target)) {
        event.preventDefault();
      }
    };

    const markImagesUndraggable = (root: ParentNode = document) => {
      root.querySelectorAll('img').forEach((img) => {
        img.draggable = false;
      });
    };

    markImagesUndraggable();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            node.draggable = false;
            return;
          }

          if (node instanceof HTMLElement) {
            markImagesUndraggable(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('dragstart', blockDrag);
    document.addEventListener('contextmenu', blockContextMenu);

    return () => {
      observer.disconnect();
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('contextmenu', blockContextMenu);
    };
  }, []);
}
