import React, { useState } from 'react';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false); // State to show/hide email verification section

  const handleSignup = async () => {
    try {
      const { user } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: false // Disable auto sign-in after signup
        }
      });
      console.log('User signed up:', user);
      setShowVerification(true); // Show email verification section
    } catch (error) {
      console.error('Error signing up:', error);
      // Handle error
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode
      });
      console.log('Email verified successfully');
      // Trigger backend user creation after email verification
      await createUserBackend();
      toast.success("Register successfully!");
      navigate('/login'); // Navigate to login page after email verification
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error("An error occurred during register. Please try again.");
      // Handle error
    }
  };

  const createUserBackend = async () => {
    try {
      // Send a request to your backend to create the user
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      if (response.ok) {
        console.log('User created in backend successfully');
      } else {
        console.error('Error creating user in backend:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating user in backend:', error);
    }
  };

  return (
    <div>
      {/* <h2>Sign Up</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Sign Up</button> */}

      {/* Email verification section */}
      

      <div className="bg-white">
  <div className="relative isolate px-6 pt-14 lg:px-8">
    <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
    </div>

    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-14 lg:px-8 mt-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Register for an account
      </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

          <div>
            <div className="flex items-center justify-between ">
              <label htmlFor="email" className=" mt-3 block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
            </div>
            <div className="mt-3">
              <input
                name="email"
                type="email"
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between ">
              <label htmlFor="password" className=" mt-3 block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
            </div>
            <div className="mt-3">
              <input
                name="password"
                type="password"
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className=" mt-6 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleSignup}>
              Register
            </button>
          </div>

          {showVerification && (
        <div>
        <div>
            <div className="flex items-center justify-between ">
              <label htmlFor="password" className=" mt-3 block text-sm font-medium leading-6 text-gray-900">
                Confirm your Email
              </label>
            </div>
            <div className="mt-3">
              <input
                name="password"
                type="text"
                placeholder="Confirmation Code" 
                required
                value={confirmationCode}  
                onChange={(e) => setConfirmationCode(e.target.value)} 
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className=" mt-6 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleVerifyEmail}>
              Verify Email
            </button>
          </div>
          
        </div>
      )}
        
      </div>
    </div>
  </div>
</div>



    </div>
  );
}

export default SignupPage;
