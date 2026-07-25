"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface CameraViewProps {
  onScanSuccess: (geofenceId: string) => void;
}

export function CameraView({ onScanSuccess }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (videoRef.current) {
      codeReader
        .decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err) => {
            if (result) {
              const text = result.getText();
              try {
                const json = JSON.parse(text);
                if (json.geofence_id) {
                  onScanSuccess(json.geofence_id);
                  return;
                }
              } catch {
                onScanSuccess(text);
              }
            }
            if (err && !(err.name === "NotFoundException")) {
              console.debug("ZXing scan exception:", err);
            }
          }
        )
        .catch((e: unknown) => {
          setError("Camera permission denied or camera not available.");
          console.error("Camera access error:", e);
        });
    }

    return () => {
      codeReader.reset();
    };
  }, [onScanSuccess]);

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden border-2 border-blue-500/50 shadow-2xl bg-black flex items-center justify-center">
      {error ? (
        <div className="p-6 text-center text-xs text-rose-400 font-medium">{error}</div>
      ) : (
        <>
          <video ref={videoRef} className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-4 border-dashed border-blue-400/70 rounded-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-4 left-4 right-4 text-center">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/70 text-blue-400 border border-blue-500/30 backdrop-blur-md">
              Point Camera at Target QR
            </span>
          </div>
        </>
      )}
    </div>
  );
}
