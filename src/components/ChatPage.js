import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { useParams } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { storage } from './firebase';

const ChatPage = () => {
  const { email } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderLoginId, setSenderLoginId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastReceivedMessageId, setLastReceivedMessageId] = useState(null);
  const [receivedMessageIds, setReceivedMessageIds] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        // Retrieve current authenticated user
        const currentUser = await getCurrentUser();
        setSenderLoginId(currentUser.signInDetails.loginId);

        // Retrieve user session
        const session = await fetchAuthSession();

        // Configure AWS SDK with Amplify credentials
        AWS.config.update({
          region: 'us-east-1',
          credentials: {
            accessKeyId: session.credentials.accessKeyId,
            secretAccessKey: session.credentials.secretAccessKey,
            sessionToken: session.credentials.sessionToken,
          },
        });

        // Fetch messages from the shared queue with long polling
        const sqs = new AWS.SQS();
        const queueUrl = 'https://sqs.us-east-1.amazonaws.com/851725339316/awschat';
        const params = {
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 5, // Wait for up to 20 seconds for messages to become available
        };

        if (lastReceivedMessageId) {
          params.VisibilityTimeout = 0; // Do not change the visibility timeout for subsequent requests
        }

        const messagesData = await sqs.receiveMessage(params).promise();

        if (!messagesData.Messages) {
          setErrorMessage('No messages received from the queue.');
          return;
        }

        const newMessages = messagesData.Messages.filter(
          (message) =>
            (message.Body.startsWith(`${senderLoginId}:`) &&
              message.Body.includes(`| to: ${email}`)) ||
            (message.Body.startsWith(`${email}:`) &&
              message.Body.includes(`| to: ${senderLoginId}`))
        );

        const parsedMessages = newMessages.map((message) => {
          const [senderAndContent, recipient] = message.Body.split(' | to: ');
          const [sender, ...rest] = senderAndContent.split(':');
          const text = rest.join(':').trim(); // Join back the rest of the split parts and trim

          const imageUrl = text.startsWith('https://') ? text : ''; // Assuming the text is the image URL if it starts with 'https://'

          return {
            MessageId: message.MessageId,
            Sender: sender,
            Text: imageUrl ? '' : text,
            ImageUrl: imageUrl,
          };
        });

        const uniqueMessages = parsedMessages.filter((message) => {
          return !messages.some(
            (existingMessage) =>
              existingMessage.MessageId === message.MessageId &&
              existingMessage.Text === message.Text &&
              existingMessage.ImageUrl === message.ImageUrl
          );
        });

        setReceivedMessageIds((prevIds) => {
          const newIds = new Set([...prevIds]);
          uniqueMessages.forEach((message) => newIds.add(message.MessageId));
          return newIds;
        });

        setMessages((prevMessages) => [...prevMessages, ...uniqueMessages]);
        setErrorMessage('');
      } catch (error) {
        console.error('Error fetching user and messages:', error);
        setErrorMessage('An error occurred while fetching messages.');
      }
    };

    const interval = setInterval(fetchUserAndMessages, 7000);
    return () => clearInterval(interval);
  }, [email, lastReceivedMessageId, senderLoginId, receivedMessageIds]);

  const sendMessage = async () => {
    try {
      const queueUrl = 'https://sqs.us-east-1.amazonaws.com/851725339316/awschat';
      const sqs = new AWS.SQS();

      let messageBody = `${senderLoginId}: ${newMessage} | to: ${email}`;

      // Send message to the shared queue
      const sendResult = await sqs
        .sendMessage({
          QueueUrl: queueUrl,
          MessageBody: messageBody,
        })
        .promise();

      if (!sendResult.MessageId) {
        setErrorMessage('Failed to send the message to the queue.');
        return;
      }

      if (messages.some((message) => message.MessageId === sendResult.MessageId)) {
        // If the message already exists, return without adding it again
        return;
      }

      // Add the sent message to the state immediately
      const sentMessage = {
        MessageId: sendResult.MessageId,
        Sender: senderLoginId,
        Text: newMessage,
        ImageUrl: '',
      };
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      receivedMessageIds.add(sendResult.MessageId);

      setNewMessage('');
      setSelectedImage(null);
      setErrorMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('An error occurred while sending the message.');
    }
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const sendImage = async () => {
    try {
      const queueUrl = 'https://sqs.us-east-1.amazonaws.com/851725339316/awschat';
      const sqs = new AWS.SQS();

      if (!selectedImage) {
        setErrorMessage('Please select an image to send.');
        return;
      }

      const storageRef = storage.ref();
      const imageRef = storageRef.child(`images/${senderLoginId}-${Date.now()}`);
      await imageRef.put(selectedImage);

      const imageUrl = await imageRef.getDownloadURL();
      const messageBody = `${senderLoginId}: ${imageUrl} | to: ${email}`;

      // Send message to the shared queue
      const sendResult = await sqs
        .sendMessage({
          QueueUrl: queueUrl,
          MessageBody: messageBody,
        })
        .promise();

      if (!sendResult.MessageId) {
        setErrorMessage('Failed to send the message to the queue.');
        return;
      }

      if (messages.some((message) => message.MessageId === sendResult.MessageId)) {
        // If the message already exists, return without adding it again
        return;
      }

      // Add the sent message to the state immediately
      const sentMessage = {
        MessageId: sendResult.MessageId,
        Sender: senderLoginId,
        Text: '', // No text for image messages
        ImageUrl: imageUrl,
      };
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      receivedMessageIds.add(sendResult.MessageId);

      setNewMessage('');
      setSelectedImage(null);
      setErrorMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('An error occurred while sending the message.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-32 p-4 bg-white rounded shadow-md">
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
      <h2 className="text-xl font-bold mb-4">Chat with {email}</h2>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.Sender === senderLoginId ? 'text-right' : 'text-left'}`}
          >
            {message.Sender === senderLoginId ? (
              <div>
                <span className="font-bold">You:</span> {message.Text}
                {message.ImageUrl && <img src={message.ImageUrl} alt="Sent Image" className="mt-2" />}
              </div>
            ) : (
              <div>
                <span className="font-bold">{message.Sender}:</span> {message.Text}
                {message.ImageUrl && <img src={message.ImageUrl} alt="Sent Image" className="mt-2" />}
              </div>
            )}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-md py-2 px-4 mb-4"
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white py-2 px-4 rounded-md mr-2">Send</button>
      <input type="file" onChange={handleImageChange} className="hidden" />
      <label htmlFor="imageUpload" className="bg-blue-500 text-white py-2 px-4 rounded-md cursor-pointer">Send Image</label>
      <input id="imageUpload" type="file" onChange={handleImageChange} className="hidden" />
    </div>
  );
};

export default ChatPage;
