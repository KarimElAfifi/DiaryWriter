export function DeleteConfirmModal({ entry, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Delete entry?</div>
        <p className="modal-text">
          “{entry?.title || "Untitled"}” will be deleted permanently. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="modal-btn" onClick={onCancel}>Cancel</button>
          <button className="modal-btn danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
