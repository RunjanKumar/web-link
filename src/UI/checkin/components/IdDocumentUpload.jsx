import { useRef } from 'react';
import { CDN_BASE_URL } from '../../../utils/constant';
import { MAX_ID_DOCUMENTS } from '../../../viewModel/webCheckInViewModel';

/**
 * IdDocumentUpload — 1..3 photos of the guest's ID document. Uploads happen
 * immediately (S3 keys held in the form); thumbnails are removable.
 */
export default function IdDocumentUpload({ documents, uploading, onUpload, onRemove }) {
    const inputRef = useRef(null);

    const handleChange = (event) => {
        const file = event.target.files?.[0];
        if (file) onUpload(file);
        event.target.value = ''; // allow re-picking the same file
    };

    return (
        <div>
            <div className="grid grid-cols-3 gap-3">
                {documents.map((key, index) => (
                    <div key={key} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-800 bg-[#1a1a1a]">
                        <img
                            src={`${CDN_BASE_URL}${key}`}
                            alt={`ID document ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            aria-label="Remove photo"
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs
                                       flex items-center justify-center hover:bg-red-600/80 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {documents.length < MAX_ID_DOCUMENTS && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-[4/3] rounded-lg border border-dashed border-gray-700 bg-[#1a1a1a]
                                   flex flex-col items-center justify-center gap-1 text-gray-500
                                   hover:border-yellow-400/50 hover:text-yellow-400 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 rounded-full border-2 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                <span className="text-[11px]">Add photo</span>
                            </>
                        )}
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleChange}
            />
            <p className="text-gray-600 text-[11px] mt-2">
                Up to {MAX_ID_DOCUMENTS} photos, 5 MB each. Make sure the details are readable.
            </p>
        </div>
    );
}
