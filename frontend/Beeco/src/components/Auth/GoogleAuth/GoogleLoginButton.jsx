import React from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = '24435880348-4u6jpkv2dpvcriql0kd440910smlk10f.apps.googleusercontent.com';

const GoogleLoginButton = () => {

    const onSuccess = async (credentialResponse) => {
        console.log('Google login success, credentialResponse:', credentialResponse);
        try {
            const response = await axios.post('http://localhost:8000', {
                token: credentialResponse.credential,
            });

            console.log('Backend response:', response.data);

            const { user, tokens } = response.data;
            console.log('User:', user);
            console.log('Tokens:', tokens);

            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);

            alert(`Welcome, ${user.first_name || user.email}!`);

        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            alert('Google login failed.');
        }
    };

    const onError = (error) => {
        console.error('Google login encountered an error:', error);
        alert('Google login failed');
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                type="standard"
                theme="outline"
                size="large"
                text="signin_with"
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginButton;
