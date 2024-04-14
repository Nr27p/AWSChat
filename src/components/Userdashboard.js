import React, { useEffect, useState } from 'react';
import { CognitoIdentityServiceProvider, config } from 'aws-sdk'; // Import CognitoIdentityServiceProvider and config
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'; // Import getCurrentUser and fetchAuthSession from AWS Amplify

// Specify the AWS region
config.update({ region: 'us-east-1' }); // Replace 'us-east-1' with your desired region

function UserDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    try {
      // Retrieve current authenticated user
      const currentUser = await getCurrentUser();
      setCurrentUserEmail(currentUser.signInDetails.loginId);
      console.log(currentUserEmail)

      // Retrieve user session
      const session = await fetchAuthSession();

      // Use the retrieved user information as needed

      // Configure AWS SDK with Amplify credentials
      config.credentials = {
        accessKeyId: session.credentials.accessKeyId,
        secretAccessKey: session.credentials.secretAccessKey,
        sessionToken: session.credentials.sessionToken
      };

      // Now fetch the user list from Cognito using AWS SDK
      const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
      const params = {
        UserPoolId: 'us-east-1_SuUWsB4gr', // Replace with your User Pool ID
        AttributesToGet: ['email'] // Specify the attributes to get
        // Limit the number of users to retrieve
        // PaginationToken: 'abcd1234EXAMPLE', // Use pagination token if needed
      };
      const data = await cognitoIdentityServiceProvider.listUsers(params).promise(); // Call listUsers method
      setUsers(data.Users);
    } catch (error) {
      console.error('Error fetching user list:', error);
    }
  };

  const handleEmailClick = (email) => {
    // Check if email is in correct format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('Invalid email format:', email);
      return;
    }
  
    // Log the email before navigation
    console.log('Clicked email:', email);
    
    // Redirect to the chat component with the clicked email
    navigate(`/chat/${encodeURIComponent(email)}`);
  };

  return (
    <div className="max-w-lg mx-auto mt-36">
      <h2 className="text-2xl font-bold mb-8 text-center">User Dashboard</h2>
      <p className="text-gray-600 mb-3">Select a user to chat with:</p>
      <ul className='border-4 p-7'>
        {users.map(user => (
          // Exclude current user's email from the list
          user.Attributes.find(attr => attr.Name === 'email')?.Value !== currentUserEmail && (
            <li key={user.Username} className="border-b border-gray-200 py-2 flex items-center justify-between">
              {/* Display email */}
              <span className="text-gray-800">{user.Attributes.find(attr => attr.Name === 'email')?.Value}</span>
              {/* Add chat button */}
              <button onClick={() => handleEmailClick(user.Attributes.find(attr => attr.Name === 'email')?.Value)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Chat</button>
            </li>
          )
        ))}
      </ul>
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
        
    </div>
  );
}

export default UserDashboard;
