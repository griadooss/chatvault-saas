import { SignUp } from '@clerk/nextjs';
import Head from 'next/head';

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up - ChatVault</title>
        <meta name="description" content="Create your ChatVault account" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">CV</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ChatVault
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create your account to get started
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                  card: 'shadow-none',
                  headerTitle: 'text-gray-900',
                  headerSubtitle: 'text-gray-600',
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
} 