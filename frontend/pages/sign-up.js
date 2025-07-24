import Head from 'next/head';
import Link from 'next/link';

export default function SignUp() {
  return (
    <>
      <Head>
        <title>Sign Up - ChatVault</title>
        <meta name="description" content="Sign up for ChatVault" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">CV</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign Up for ChatVault
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create your account to start managing your chats
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Authentication is temporarily disabled for testing.
              </p>
              <Link href="/dashboard" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 