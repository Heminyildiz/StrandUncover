import React from "react";

function HintModal({ isOpen, hint, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content w-3/4 max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Hint</h2>
        <p className="mb-4">{hint}</p>
        <button
          onClick={onClose}
          className="px-4 py-1 bg-brandAccent rounded hover:bg-brandSecondary hover:text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default HintModal;



