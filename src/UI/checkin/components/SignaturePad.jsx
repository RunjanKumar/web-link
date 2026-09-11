import {
    useCallback, useEffect, useRef, useState,
} from 'react';
import { CDN_BASE_URL } from '../../../utils/constant';

/**
 * SignaturePad — draw a signature with a finger, stylus or mouse.
 *
 * Strokes are kept as points so a resize redraws them. Shortly after each
 * stroke ends the drawing is exported as a PNG (black ink on white — what the
 * registration card prints) and handed to `onExport`; `onPending` fires as
 * soon as a stroke starts so the wizard can hold "Next" until the export lands.
 * When an `imageKey` already exists (a saved signature) the pad shows it with
 * a "Sign again" button instead of a blank canvas.
 */

const EXPORT_WIDTH = 720;
const EXPORT_HEIGHT = 240;
const EXPORT_DELAY_MS = 500;
const INK = '#f5f5f5';
const CANVAS_HEIGHT = 180;

export default function SignaturePad({
    id, imageKey, uploading, disabled, onPending, onExport, onClear,
}) {
    const canvasRef = useRef(null);
    const strokesRef = useRef([]); // [[{x, y}, …], …] in CSS pixels
    const drawingRef = useRef(false);
    const exportTimerRef = useRef(null);
    const [hasStrokes, setHasStrokes] = useState(false);

    /** Redraw every stroke — used after a resize (which wipes the bitmap). */
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const ratio = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(ratio, ratio);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = INK;
        strokesRef.current.forEach((stroke) => {
            if (stroke.length === 0) return;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            if (stroke.length === 1) ctx.lineTo(stroke[0].x + 0.1, stroke[0].y + 0.1);
            stroke.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        });
    }, []);

    // Size the bitmap to the element (× devicePixelRatio) and keep it sized.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            const width = canvas.clientWidth || 300;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(CANVAS_HEIGHT * ratio);
            redraw();
        };
        resize();
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
        if (observer) observer.observe(canvas);
        else window.addEventListener('resize', resize);
        return () => {
            if (observer) observer.disconnect();
            else window.removeEventListener('resize', resize);
            if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
        };
    }, [redraw, imageKey]);

    /** Black-on-white PNG at a fixed size, whatever the on-screen width. */
    const exportPng = useCallback(() => new Promise((resolve) => {
        const source = canvasRef.current;
        const strokes = strokesRef.current;
        if (!source || strokes.length === 0) {
            resolve(null);
            return;
        }
        const out = document.createElement('canvas');
        out.width = EXPORT_WIDTH;
        out.height = EXPORT_HEIGHT;
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
        const scale = Math.min(EXPORT_WIDTH / (source.clientWidth || 300), EXPORT_HEIGHT / CANVAS_HEIGHT);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.2 * scale;
        ctx.strokeStyle = '#111111';
        strokes.forEach((stroke) => {
            if (stroke.length === 0) return;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
            if (stroke.length === 1) ctx.lineTo(stroke[0].x * scale + 0.1, stroke[0].y * scale + 0.1);
            stroke.slice(1).forEach((p) => ctx.lineTo(p.x * scale, p.y * scale));
            ctx.stroke();
        });
        out.toBlob((blob) => resolve(blob), 'image/png');
    }), []);

    const scheduleExport = useCallback(() => {
        if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
        exportTimerRef.current = setTimeout(async () => {
            exportTimerRef.current = null;
            const blob = await exportPng();
            onExport(blob);
        }, EXPORT_DELAY_MS);
    }, [exportPng, onExport]);

    const pointOf = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handlePointerDown = (event) => {
        if (disabled || uploading) return;
        event.preventDefault();
        if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
        drawingRef.current = true;
        strokesRef.current.push([pointOf(event)]);
        canvasRef.current.setPointerCapture?.(event.pointerId);
        setHasStrokes(true);
        onPending();
        redraw();
    };

    const handlePointerMove = (event) => {
        if (!drawingRef.current) return;
        event.preventDefault();
        const stroke = strokesRef.current[strokesRef.current.length - 1];
        const point = pointOf(event);
        const last = stroke[stroke.length - 1];
        stroke.push(point);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    };

    const handlePointerUp = (event) => {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        canvasRef.current.releasePointerCapture?.(event.pointerId);
        scheduleExport();
    };

    const handleClear = () => {
        if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
        exportTimerRef.current = null;
        drawingRef.current = false;
        strokesRef.current = [];
        setHasStrokes(false);
        redraw();
        onClear();
    };

    // A saved signature (from an earlier visit or a resubmit) shows as an image.
    if (imageKey && !hasStrokes) {
        return (
            <div>
                <div className="rounded-xl border border-gray-800 bg-white overflow-hidden">
                    <img
                        src={`${CDN_BASE_URL}${imageKey}`}
                        alt="Your saved signature"
                        className="w-full h-[140px] object-contain"
                    />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-green-400 text-[11px] m-0">Signature saved</p>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={disabled}
                        className="text-yellow-400 text-xs font-medium hover:underline disabled:opacity-50"
                    >
                        Sign again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="relative rounded-xl border border-dashed border-gray-700 bg-[#1a1a1a] overflow-hidden">
                <canvas
                    id={id}
                    ref={canvasRef}
                    role="img"
                    aria-label="Signature pad — draw your signature here"
                    className="block w-full touch-none select-none cursor-crosshair"
                    style={{ height: CANVAS_HEIGHT }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                />
                {!hasStrokes ? (
                    <p className="absolute inset-x-0 bottom-3 text-center text-gray-600 text-xs m-0 pointer-events-none">
                        Sign here with your finger or mouse
                    </p>
                ) : null}
                <div className="absolute left-4 right-4 bottom-8 h-px bg-gray-700/70 pointer-events-none" aria-hidden="true" />
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] m-0 text-gray-600">
                    {uploading ? (
                        <span className="text-yellow-400">Saving signature…</span>
                    ) : hasStrokes ? (
                        imageKey ? <span className="text-green-400">Signature saved</span> : 'Lift your finger to save'
                    ) : 'Optional — your typed name is your signature too'}
                </p>
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={disabled || (!hasStrokes && !imageKey)}
                    className="text-yellow-400 text-xs font-medium hover:underline disabled:opacity-40"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
