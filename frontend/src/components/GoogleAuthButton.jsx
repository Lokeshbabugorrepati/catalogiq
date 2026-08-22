import { useEffect, useRef } from "react";
import api from "../api/axios";

// Loads the Google Identity Services script once and renders the official Google button.
// On success, sends the ID token to our backend which verifies it and logs the user in.
export default function GoogleAuthButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set - Google sign-in button will not render.");
      return;
    }

    const renderButton = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const { data } = await api.post("/auth/google", { credential: response.credential });
            onSuccess(data);
          } catch (err) {
            onError(err.response?.data?.message || "Google sign-in failed");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "rectangular",
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = renderButton;
      document.body.appendChild(script);
    }
  }, [onSuccess, onError]);

  return <div ref={buttonRef} className="flex justify-center" />;
}
