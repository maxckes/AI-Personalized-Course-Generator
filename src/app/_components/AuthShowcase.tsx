// A simple component to manage authentication status

import { signIn, signOut, useSession } from "next-auth/react";

export const AuthShowcase = () => {
  const { data: sessionData } = useSession();

  return (
    <div>
      <p>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
        style={{
          borderRadius: '5px',
          padding: '8px 16px',
          backgroundColor: sessionData ? '#ff4d4d' : '#4dff4d',
          color: 'white',
          border: 'none',
        }}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}