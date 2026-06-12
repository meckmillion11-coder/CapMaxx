import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {icon && (
          <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
          >
            Sign Up for Early Access
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
