"use client";

import { useEffect } from "react";

export function useTemporaryImageLoadLogger(label: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    const startedAt = performance.now();
    const timerLabel = `${label}ImagesLoad:${Math.round(startedAt)}`;
    const images = Array.from(document.images);
    let pendingCount = images.filter((image) => !image.complete).length;
    let isFinished = false;

    const finish = () => {
      if (isFinished) {
        return;
      }

      isFinished = true;
      console.timeEnd(timerLabel);
    };

    console.time(timerLabel);
    console.info(`${label}ImagesPending`, {
      pending: pendingCount,
      total: images.length,
    });

    if (pendingCount === 0) {
      finish();
      return;
    }

    const handleSettled = (event: Event) => {
      const image = event.currentTarget as HTMLImageElement;

      pendingCount -= 1;
      console.info(`${label}ImageLoad`, {
        elapsedMs: Math.round(performance.now() - startedAt),
        pending: Math.max(0, pendingCount),
        src: image.currentSrc || image.src,
        status: event.type,
      });

      if (pendingCount <= 0) {
        finish();
      }
    };

    images.forEach((image) => {
      if (image.complete) {
        return;
      }

      image.addEventListener("load", handleSettled, { once: true });
      image.addEventListener("error", handleSettled, { once: true });
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener("load", handleSettled);
        image.removeEventListener("error", handleSettled);
      });

      finish();
    };
  }, [label]);
}
