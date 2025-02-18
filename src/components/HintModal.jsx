import React from "react";

function HintModal({ isOpen, hint, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content w-3/4 max-w-md">
        <h2 className="text-lg font-bold mb-2">Hint</h2>
        <p className="mb-4">{hint}</p>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-pastel-400 hover:bg-pastel-500 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default HintModal;
