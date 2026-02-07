let ENV = {};

export function loadENV() {
  ENV = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    ENVIRONMENT: import.meta.env.MODE,
  };
}

export function getENV() {
  return ENV;
}