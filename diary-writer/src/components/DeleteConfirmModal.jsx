export function DeleteConfirmModal({ entry, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Eintrag löschen?</div>
        <p className="modal-text">
          „{entry?.title || "Kein Titel"}" will be deleted permanently. This action cannot be reversed!
        </p>
        <div className="modal-actions">
          <button className="modal-btn" onClick={onCancel}>Abbrechen</button>
          <button className="modal-btn danger" onClick={onConfirm}>Löschen</button>
        </div>
      </div>
    </div>
  );
}
