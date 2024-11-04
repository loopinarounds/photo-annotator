export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <svg
        className="animate-spin h-5 w-5 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.001 8.001 0 0112 4V0C6.486 0 2 4.486 2 10h4zm2 5.291h4v4c5.373 0 10-4.627 10-10h-4c0 3.86-3.14 7-7 7v-1.709z"
        ></path>
      </svg>
    </div>
  );
}
