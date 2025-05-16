// ❌ УДАЛИ ЭТО:
// import { GoogleOAuthProvider } from '@react-oauth/google';

import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleLoginButton = () => {
  const onSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:8000/api/google-login/', {
        token: credentialResponse.credential,
      });

      const { user, tokens } = response.data;
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      alert(`Welcome, ${user.first_name || user.email}!`);
    } catch (error) {
      alert('Google login failed.');
    }
  };

  const onError = () => {
    alert('Google login failed.');
  };

  return (
    <div className="google-login-wrapper">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        text="signin_with"
      />
    </div>
  );
};

export default GoogleLoginButton;
