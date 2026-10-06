// login.jsx
import style from '../../styles/loginsignupRegion/loginsignupcontent.module.css';

import { useState, useEffect } from "react";
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from "react-router-dom";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { GoogleLogin } from "@react-oauth/google";

import { Trans, useTranslation } from 'react-i18next';

import { ApiRequest } from '../../services/request.jsx';

import DivContainer from '../../styles/reusable/divContainer.jsx'
import Button from '../../styles/reusable/button.jsx'
import Input from '../../styles/reusable/input.jsx'
import Text from '../../styles/reusable/texts.jsx'
import Container from '../../styles/reusable/container.jsx'

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LoginFormInner() {
    // ─────────────────────────────────────────────────────────────
    // Navigation, Translation & External Services
    // ─────────────────────────────────────────────────────────────
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { executeRecaptcha } = useGoogleReCaptcha();

    // ─────────────────────────────────────────────────────────────
    // Local State
    // ─────────────────────────────────────────────────────────────
    const [errorMessage, setErrorNotification] = useState('');
    const [userInput, setUserInput] = useState({});
    const [toastNotification, setToastNotification] = useState([])

    // ─────────────────────────────────────────────────────────────
    // Check Existing Authentication
    // ─────────────────────────────────────────────────────────────
    const hasRefreshTokenQuery = useQuery({
        queryKey: ['login', 'hasRefreshToken'],
        queryFn: () => ApiRequest('/auth/hasRefreshToken'),
        retry: false,
    });
    // Redirect users who already have a valid refresh token.
    useEffect(() => {
        if (hasRefreshTokenQuery?.data?.success) {
            navigate('/dashboard/home', { replace: true });
        }
    }, [hasRefreshTokenQuery.data, navigate]);


    // ───────────────────────────────────────────────────────────── 
    // Login Mutation 
    // ─────────────────────────────────────────────────────────────
    const loginMutation = useMutation({
        mutationFn: async ({ emailPhone, password }) => {
            // Generate a reCAPTCHA token for the login request.
            const token = await executeRecaptcha('login');

            // Verify the reCAPTCHA token with the backend.
            const verify = await ApiRequest('/auth/reCaptchaVerify', 'POST', undefined, { token });

            if (!verify.success || verify.score < 0.3) {
                throw new Error('RECAPTCHA_FAILED');
            }

            // Authenticate the user.
            const login = await ApiRequest('/auth/login', 'POST', undefined, { emailPhone, password });

            if (!login.success) {
                const error = new Error(login.error || 'LOGIN_FAILED');
                error.status = login.status;
                throw error;
            }

            return login;
        },

        // Login succeeded.
        onSuccess: (login) => {
            localStorage.setItem('AccessToken', login.AccessToken);
            navigate('/dashboard/home', { replace: true });
        },

        onError: (error) => {
            // Handle authentication errors.
            if (error.message === 'RECAPTCHA_FAILED') {
                setErrorNotification('Auth.Login.error.RecaptchaFailed');
                return;
            }

            // Server error.
            if (error.status === 500) {
                setErrorNotification('Auth.common.error.500');
                return;
            }

            // Bad request / authentication failure.
            if (error.status === 400) {
                if (error.message === 'RECAPTCHA_LOW') {
                    setErrorNotification('Auth.Login.error.RecaptchaFailed');
                } else {
                    setErrorNotification('Auth.Login.error.IncorrectEmailPass');
                }
                return;
            }

            //Falback error
            setErrorNotification('Auth.common.errorr.500');
        },
    });
    // ───────────────────────────────────────────────────────────── 
    // Login Form Submission
    // ─────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorNotification('');

        // Validate password
        if (!/^(?=.*[A-Z])(?=.*[\d\W])[A-Za-z\d\W]{7,20}$/.test(userInput.password)) {
            return setErrorNotification('Auth.common.error.InvalidPass');
        }

        // Validate email
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userInput.emailPhone)) {
            return setErrorNotification('Auth.common.error.InvalidEmail');
        }

        // Make syre reCAPTCHA has loaded
        if (!executeRecaptcha) {
            return setErrorNotification('Auth.Login.error.RecaptchaNotReady');
        }

        loginMutation.mutate({
            emailPhone: userInput.emailPhone,
            password: userInput.password,
        });
    };


    // ───────────────────────────────────────────────────────────── 
    // Password Reset Form Submission
    // ─────────────────────────────────────────────────────────────
    const handleResetPassword = () => {
        setErrorNotification('');

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userInput.emailPhone)) {
            return setErrorNotification('Auth.common.error.InvalidEmail');
        }

        resetPasswordMutation.mutate({
            email: userInput.emailPhone,
        });
    };


    // ───────────────────────────────────────────────────────────── 
    // Password Reset Mutation 
    // ─────────────────────────────────────────────────────────────
    const resetPasswordMutation = useMutation({
        mutationFn: ({ email }) =>
            ApiRequest(
                '/auth/requestResetPasswords',
                'POST',
                undefined,
                { email }
            ),

        onSuccess: (response) => {
            if (response.success) {
                setToastNotification(prev => [
                    'Auth.Login.description.note1',
                    !prev[1],
                ]);
            } else {
                setErrorNotification(response.error);
            }
        },

        onError: (error) => {
            setErrorNotification(error);
        },
    });

    // ───────────────────────────────────────────────────────────── 
    // Toast Notification 
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (toastNotification?.[0]) {
            toast.success(t(toastNotification[0]), {
                position: 'top-right',
                autoClose: 10000,
            })
        }
    }, [toastNotification[1], t])

    
    // ───────────────────────────────────────────────────────────── 
    // Loading State 
    // ─────────────────────────────────────────────────────────────
    const loading = loginMutation.isPending || resetPasswordMutation.isPending

    return (
        <Container option = {`flex justify-center items-center ${loading ? 'cursor-wait' : ''} `}>
            <DivContainer option = 'absolute left-3 top-3 items-center select-none' rows>
                <img src = '/assets/dashboardRegion/logo.png' className= 'h-17 w-12 filter grayscale-100 brightness-200' alt = 'logo'/>
                <Text c = {0} s = {1} w = {2} translation = {false} >Biomation</Text>
            </DivContainer>

            <DivContainer option = 'h-max w-[20%] p-4 bg-gray-800 rounded-md'>
                <form>
                    <DivContainer option = 'gap-5'>
                        <DivContainer option = 'items-center gap-1'>
                            <Text c = {0} s = {2} w = {2} i18nKey = 'Auth.Login.description.note2'/>
                            <Text c = {1} s = {5} w = {0} i18nKey = 'Auth.Login.description.note3'/>
                        </DivContainer>

                        <DivContainer option = 'gap-4'>
                            <DivContainer option = 'gap-1'>
                                <Text c = {0} s = {5} w = {2} i18nKey = 'Auth.Login.inputHeading.EmailPhone'/>
                                <Input autoComplete = 'email' type = 'email' option = 'outline-none h-[3.5vh] !text-xs' onChange = {(e) => setUserInput((prev) => ({ ...prev, emailPhone: e.target.value }))}/>
                            </DivContainer>

                            <DivContainer option = 'gap-1'>
                                <Text c = {0} s = {5} w = {2} i18nKey = 'Auth.common.inputHeading.PasswordColon'/>
                                <Input autoComplete = 'current-password' type = 'password' option = 'outline-none h-[3.5vh] !text-xs' onChange = {(e) => setUserInput((prev) => ({ ...prev, password: e.target.value }))} placeholder = 'Auth.common.inputPlaceholder.Password'/>

                                <DivContainer rows option = 'gap-2'>
                                    <Text s = {5} option = 'underline text-[#818bf0] dark:text-[#818bf0] cursor-pointer' i18nKey = 'Auth.common.inputTools.ForgotPassword' onClick = {() => handleResetPassword()}/>
                                    { errorMessage && <Text s = {5} option = "before:content-['*_'] dark:text-red-400 text-red-400" i18nKey = {`${errorMessage}`}/> }
                                </DivContainer>
                            </DivContainer>
                        </DivContainer>

                        <DivContainer option = 'gap-1.5'>
                            <Button option = 'h-[3.5vh]' onClick = {(e) => handleSubmit(e)}>{'Auth.Login.button.Login'}</Button>
                            <Text s = {5} c = {1} option = 'select-none'>
                                <Trans 
                                    i18nKey = {'Auth.Login.inputTools.Signup'} 
                                    className = 'text-xs' 
                                    components = {{
                                        highlight: <Link to = '/auth/signup' className = 'underline dark:text-[#818bf0] text-[#818bf0] cursor-pointer'/>
                                    }}
                                />
                            </Text>
                        </DivContainer>
                    </DivContainer>
                </form>
            </DivContainer>
        </Container>
    );
}
\\wsl.localhost\Ubuntu-24.04\home\buckduck\biomation\01_frontend\src\components\loginsignupRegion\login.jsx

export default function LoginForm() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey='6Leq0SEsAAAAAH2jQjYnatQGZraGNeD7gUB6upHZ'>
            <DivContainer option = 'h-[100vh] w-full'>
                <LoginFormInner />
            </DivContainer>
        </GoogleReCaptchaProvider>
    );
}