import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="px-6 py-24 text-center">
      <p className="text-6xl font-bold text-[#315c43]">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[#24352b]">Page not found</h1>
      <p className="mt-2 text-sm text-[#747970]">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-full bg-[#315c43] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#264a35]"
      >
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;