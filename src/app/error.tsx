"use client";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-y-4 px-4">
      <h2 className="text-xl font-bold text-white">Something went wrong</h2>
      <p className="text-sm text-[#9CA3AF] text-center max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-[#2A2A2A] border border-white/20 rounded-lg hover:bg-[#3A3A3A] cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
};

export default Error;
