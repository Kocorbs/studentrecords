import Swal from 'sweetalert2';

// Custom themed SweetAlert instance
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

// Success alert
export const showSuccess = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
    });
};

// Error alert
export const showError = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#ef4444'
    });
};

// Warning alert
export const showWarning = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        confirmButtonColor: '#f59e0b'
    });
};

// Info alert
export const showInfo = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        confirmButtonColor: '#3b82f6'
    });
};

// Confirmation dialog
export const showConfirm = (title: string, text: string, confirmButtonText = 'Yes', cancelButtonText = 'Cancel') => {
    return Swal.fire({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText,
        cancelButtonText
    });
};

// Delete confirmation (with danger styling)
export const showDeleteConfirm = (itemName: string) => {
    return Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete ${itemName}. This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });
};

// Toast notifications
export const showToast = {
    success: (title: string) => Toast.fire({ icon: 'success', title }),
    error: (title: string) => Toast.fire({ icon: 'error', title }),
    warning: (title: string) => Toast.fire({ icon: 'warning', title }),
    info: (title: string) => Toast.fire({ icon: 'info', title })
};

// Loading indicator
export const showLoading = (title = 'Loading...') => {
    Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

// Close any open alert
export const closeAlert = () => {
    Swal.close();
};

// Export the base Swal for custom usage
export { Swal };
export default Swal;
