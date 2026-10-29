import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Subscription } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onDeleted: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onDeleted
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!subscription) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteSubscription(subscription.id);
      onDeleted();
    } catch (err: any) {
      setError(err.message || 'Failed to delete subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Subscription" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl text-danger border border-rose-100">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-medium">
            This action cannot be undone. All expense history for this subscription will be permanently removed.
          </p>
        </div>

        {error && (
          <div className="p-2 text-xs rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <p className="text-sm text-text-main">
          Are you sure you want to delete <span className="font-semibold text-text-main">"{subscription.name}"</span>?
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isLoading}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
