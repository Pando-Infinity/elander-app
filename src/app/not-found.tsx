import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-y-4 px-4">
      <h2 className="text-xl font-bold text-white">Page not found</h2>
      <p className="text-sm text-[#9CA3AF]">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium text-white bg-[#2A2A2A] border border-white/20 rounded-lg hover:bg-[#3A3A3A]"
      >
        Go home
      </Link>
    </div>
  );
};

export default NotFound;
