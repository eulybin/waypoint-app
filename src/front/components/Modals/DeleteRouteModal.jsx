import { useState } from 'react';
import { AlertTriangle } from "lucide-react";

const DeleteRouteModal = ({
  show,
  onClose,
  onConfirm,
  routeName,
  isDeleting,
}) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: "block",
          zIndex: 1050,
        }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteRouteModalLabel"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5
                className="modal-title d-flex align-items-center gap-2"
                id="deleteRouteModalLabel"
              >
                <AlertTriangle size={24} className="text-danger" />
                Confirmar Eliminación
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isDeleting}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-3">
                ¿Estás seguro de que quieres eliminar la ruta{" "}
                <strong>"{routeName}"</strong>?
              </p>
              <div
                className="alert alert-warning d-flex align-items-start gap-2"
                role="alert"
              >
                <AlertTriangle size={20} className="mt-1 flex-shrink-0" />
                <div>
                  <strong>Esta acción no se puede deshacer.</strong>
                  <br />
                  <small>
                    Se eliminarán todos los datos asociados a esta ruta,
                    incluyendo valoraciones y comentarios.
                  </small>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar Ruta"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteRouteModal;
