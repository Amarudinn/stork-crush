import Swal from 'sweetalert2';

// Custom theme untuk match dengan game theme
const customTheme = {
  background: 'rgba(20, 20, 40, 0.95)',
  color: '#e8f7ff',
  confirmButtonColor: '#22d3ee',
  cancelButtonColor: '#ff4d6d',
  backdrop: 'rgba(2, 6, 23, 0.95)',
};

export const showError = (message) => {
  return Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
    ...customTheme,
    confirmButtonText: 'OK',
  });
};

export const showSuccess = (message) => {
  return Swal.fire({
    icon: 'success',
    title: 'Success!',
    text: message,
    ...customTheme,
    confirmButtonText: 'OK',
    timer: 2000,
  });
};

export const showInfo = (message) => {
  return Swal.fire({
    icon: 'info',
    title: 'Info',
    text: message,
    ...customTheme,
    confirmButtonText: 'OK',
  });
};

export const showWarning = (message) => {
  return Swal.fire({
    icon: 'warning',
    title: 'Warning',
    text: message,
    ...customTheme,
    confirmButtonText: 'OK',
  });
};

export const showConfirm = (title, message) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    ...customTheme,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
  });
};
