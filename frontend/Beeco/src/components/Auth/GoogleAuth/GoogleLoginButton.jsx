import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const onSuccess = async (credentialResponse) => {
    console.log('Google Response:', credentialResponse);
    console.log('JWT Token:', credentialResponse.credential);
    try {
      const response = await axios.post('http://localhost:8000/api/google-login/', {
        token: credentialResponse.credential,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Server Response:', response.data);
      const { user, tokens, created } = response.data;

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);


      if (created) {
        navigate('/login');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Ошибка входа:', error.response?.data, error.message);
      alert('Ошибка входа. Подробности в консоли.');
    }
  };

  const onError = (error) => {
    console.error('Ошибка входа через Google:', error);
    alert('Ошибка входа через Google. Подробности в консоли.');
  };

  return (
    <GoogleOAuthProvider clientId="604621430295-16qjcu4fjjbda1uc13kc5ufpjinr3ai4.apps.googleusercontent.com">
      <div className="google-login-wrapper">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          text="signin_with"
          useOneTap={false}
          auto_select={false}
          context="signin"
          type="standard"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;