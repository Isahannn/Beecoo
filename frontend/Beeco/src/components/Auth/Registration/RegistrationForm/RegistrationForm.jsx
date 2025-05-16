    import React, {useState} from 'react';
    import axios from 'axios';
    import {validationSchema} from '../../../../Validation/validation.jsx';
    import {Link} from 'react-router-dom';
    import TextInput from '../TextInput';
    import PasswordInput from '../PasswordInput';
    import GoogleLoginButton from '../../GoogleAuth/GoogleLoginButton.jsx';
    import './RegistrationForm.css';
    import { useNavigate } from 'react-router-dom';


    const RegistrationForm = () => {
      const navigate = useNavigate();
        const [formData, setFormData] = useState({
            email: '',
            password: '',
            confirm_password: '',
            first_name: '',
            last_name: '',
        });

        const [errors, setErrors] = useState({});
        const [message, setMessage] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [isSuccess, setIsSuccess] = useState(false);

        const handleChange = (e) => {
            setFormData({...formData, [e.target.name]: e.target.value});
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setErrors({});
            setMessage('');
            setIsLoading(true);
            setIsSuccess(false);

            try {
                const validationResult = await validationSchema.safeParseAsync(formData);

                if (!validationResult.success) {
                    const validationErrors = {};
                    validationResult.error.errors.forEach(err => {
                        validationErrors[err.path[0]] = err.message;
                    });
                    setErrors(validationErrors);
                    setMessage('Please correct the errors in the form.');
                    return;
                }

                const response = await axios.post('http://localhost:8000/registration/', {
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                });
                console.log('User created with ID:', response.data.id);
                localStorage.setItem('userId', response.data.id);

                setMessage('Registration successful! Redirecting...');
                setIsSuccess(true);

                setFormData({
                    email: '',
                    password: '',
                    confirm_password: '',
                    first_name: '',
                    last_name: '',
                });

                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } catch (error) {
                console.log('Full error:', error);
                if (error.name === 'ZodError') {
                    const validationErrors = {};
                    error.errors.forEach(err => {
                        validationErrors[err.path[0]] = err.message;
                    });
                    setErrors(validationErrors);
                    setMessage('Please correct the errors in the form.');
                } else if (error.response?.status === 400 && error.response?.data) {
                    console.log('Error response data:', error.response.data);
                    if (error.response.data.email) {
                        setErrors({email: error.response.data.email});
                        setMessage('This email is already registered.');
                    } else {
                        setErrors(error.response.data);
                        setMessage('Registration failed. Please try again.');
                    }
                } else {
                    setMessage('An unexpected error occurred. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div className="registration-form-container">
                <form onSubmit={handleSubmit} className="registration-form">
                    <h2>Регистрация</h2>

                    {message && (
                        <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <TextInput
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({...formData, email: e.target.value});
                            setErrors({...errors, email: ''});
                            setMessage('');
                        }}
                        error={errors.email}
                        required
                        autoComplete="email"
                    />
                    {errors.email && <div className="error">{errors.email}</div>}


                    <TextInput
                        id="first_name"
                        name="first_name"
                        label="Имы"
                        value={formData.first_name}
                        onChange={handleChange}
                        error={errors.first_name}
                        required
                        autoComplete="given-name"
                    />

                    <TextInput
                        id="last_name"
                        name="last_name"
                        label="Фамилия"
                        value={formData.last_name}
                        onChange={handleChange}
                        error={errors.last_name}
                        required
                        autoComplete="family-name"
                    />

                    <PasswordInput
                        name="password"
                        label="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                        autoComplete="new-password"
                    />

                    <PasswordInput
                        name="confirm_password"
                        label="Подтверждение пароля"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        error={errors.confirm_password}
                        required
                        autoComplete="new-password"
                    />
                    <GoogleLoginButton/>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={isLoading ? 'loading' : ''}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span> Регестрируем...
                            </>
                        ) : 'Зарегестрироваться'}
                    </button>

                    <div className="login-link">
                        Есть аккаунт? <Link to="/login">Войти</Link>
                    </div>
                </form>
            </div>
        );
    };

    export default RegistrationForm;
