import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useTranslation, Trans } from 'react-i18next';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

import { ApiRequest } from '../../services/request.jsx';

import DivContainer from '../../styles/reusable/divContainer.jsx'
import Button from '../../styles/reusable/button.jsx'
import Input from '../../styles/reusable/input.jsx'
import Text from '../../styles/reusable/texts.jsx'
import Container from '../../styles/reusable/container.jsx'

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignupFormInner() {
    // ─────────────────────────────────────────────────────────────
    // Navigation, Translation & External Services
    // ─────────────────────────────────────────────────────────────
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const { t } = useTranslation()

    // ─────────────────────────────────────────────────────────────
    // Local State
    // ─────────────────────────────────────────────────────────────
    const [errorMessage, setErrorMessage] = useState('');
    const [userInput, setUserInput] = useState('');
    const [toastNotification, setToastNotification] = useState([])
    const [inputFocus, setInputFocus] = useState('');
    const [inputDescription, setInputDescription] = useState('')

    
    // ─────────────────────────────────────────────────────────────
    // Check Existing Authentication
    // ─────────────────────────────────────────────────────────────
    const hasRefreshTokenQuery = useQuery({
        queryKey: ['signup', 'hasRefreshToken'],
        queryFn: () => ApiRequest('/auth/hasRefreshToken'), 
        retry: false
    })
    useEffect(() => {
        if (hasRefreshTokenQuery?.data?.success) {
            navigate('/dashboard', { replace: true });
        }
    }, [hasRefreshTokenQuery.data, navigate])

    
    
    // ───────────────────────────────────────────────────────────── 
    // Signup Mutation 
    // ─────────────────────────────────────────────────────────────
    const signupMutation = useMutation({
        mutationFn: async ({ username, tag, email, password }) => {
            const token = await executeRecaptcha("signup");
            const verify = await ApiRequest("/auth/ReCaptchaVerify", "POST", undefined, { token : token });
            if (!verify.success || verify.score < 0.3) {
                throw new Error('RECAPTCHA_FAILED')
            }

            const response = await ApiRequest("/auth/signup", "POST", undefined, { username, tag, email, password });

            if (!response.success) {
                throw new Error(response.err || 'LOGIN_FAILED');
            }

            return response;
        },

        onSuccess: () => {
            setToastNotification(prev => (["Auth.Signup.description.note1", !prev[1]]));
            setTimeout(() => {
                navigate('/auth/login');
            }, 3000)
        },

        onError: (error) => {
            if (error.message === 'EMAIL_EXIST') {
                setErrorMessage('Auth.Signup.description.note8')
            } else if (error.message === 'USERNAME_TAG_EXIST') {
                setErrorMessage('Auth.Signup.description.note9')
            } else if (error.message === 'RECAPTCHA_FAILED') {
                setErrorMessage("Auth.Signup.error.RecaptchaFailed")
            } else {
                setErrorMessage("Auth.common.error.500");
            }
        }
    })
    // ───────────────────────────────────────────────────────────── 
    // Signup Form Submission
    // ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userInput.email)) { throw new Error('Auth.Signup.error.EmailReq') };

            if (!userInput.username || !/^[A-Za-z0-9]{7,30}$/.test(userInput.username)) { throw new Error('Auth.Signup.error.UsernameReq') }; 

            if (!/^[0-9]{4}$/.test(userInput.tag)) { throw new Error('Auth.Signup.error.TagReq') };

            if (!/^(?=.*[A-Z])(?=.*[\d\W])[A-Za-z\d\W]{7,20}$/.test(userInput.password)) { throw new Error('Auth.Signup.error.PassReq') };
        } catch (err) {
            setErrorMessage(err.message)
            return;
        }

        if (!executeRecaptcha) {
            return setErrorMessage("Auth.Signup.error.RecaptchaNotReady");
        }

        signupMutation.mutate({ 
            username: userInput.username, 
            tag: userInput.tag, 
            email: userInput.email, 
            password: userInput.password
        })
    };

    // ───────────────────────────────────────────────────────────── 
    // Toast Notification 
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (toastNotification?.[0]) {
            toast.success(t(toastNotification[0]), {
                position: 'top-right',
                autoClose: 3000,
            })
        }
    }, [toastNotification[1], t])

    
    // ───────────────────────────────────────────────────────────── 
    // Input Validate 
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (inputFocus === 'username') {
            setInputDescription('Auth.Signup.description.note4')
            return;
        }

        if (inputFocus === 'tag') {
            setInputDescription('Auth.Signup.description.note6')
            return
        }

        if (inputFocus === 'password') {
            setInputDescription('Auth.Signup.description.note5')
            return;
        }
    }, [inputFocus])

    const loading = signupMutation.isPending

    return (
        <Container option = {`flex justify-center items-center ${loading ? 'cursor-wait' : ''} `}>
            <DivContainer option = 'w-full justify-center items-center'>
                <DivContainer option = 'absolute left-3 top-3 items-center select-none' rows>
                    <img src = '/assets/dashboardRegion/logo.png' className= 'h-17 w-12 filter grayscale-100 brightness-200' alt = 'logo'/>
                    <Text c = {0} s = {1} w = {2} translation = {false}>Biomation</Text>
                </DivContainer>

                <DivContainer option = {`w-[20%] p-5 bg-gray-800 h-max`}>
                    <form>
                        <DivContainer option = 'gap-5 rounded-md'>
                            <DivContainer option = 'items-center gap-1'>
                                <Text c = {0} s = {2} w = {2} i18nKey = 'Auth.Signup.description.note2'/>
                                <Text c = {1} s = {5} w = {0} i18nKey = 'Auth.Signup.description.note3'/>
                            </DivContainer>

                            <DivContainer option = 'gap-4'>
                                <DivContainer option = 'gap-1'>
                                    <Text c = {0} s = {5} w = {2} i18nKey = 'Auth.common.inputHeading.EmailColon'/>
                                    <Input autoComplete = 'none' type = 'email' option = 'h-[3.5vh] !text-xs' onChange = {(e) => setUserInput((prev) => ({ ...prev, email: e.target.value }))} placeholder = 'Auth.common.inputPlaceholder.Email'/>
                                </DivContainer>
                                
                                <DivContainer option = 'gap-1'>
                                    <DivContainer rows option = 'gap-2'>
                                        <DivContainer option = 'gap-1'>
                                            <Text c = {0} s = {5} w = {2} i18nKey = 'Auth.common.inputHeading.UsernameColon'/>
                                            <Input onFocus = {() => setInputFocus('username')} onBlur = {() => setInputFocus('')} minLength = {7} maxLength = {30} autoComplete = 'off' type = 'text' option = 'h-[3.5vh] !text-xs' onChange = {(e) => setUserInput((prev) => ({ ...prev, username: e.target.value }))} placeholder = 'Auth.common.inputPlaceholder.Username'/>
                                        </DivContainer>

                                        <DivContainer option = 'gap-1'>
                                            <Text c = {0} s = {5} w = {2} i18nKey = 'Auth.common.inputHeading.TagColon'/>
                                            <Input onFocus = {() => setInputFocus('tag')} onBlur = {() => setInputFocus('')} minLength = {4} maxLength = {4} autoComplete = 'off' type = 'text' option = 'h-[3.5vh] !text-xs' onChange = {(e) => setUserInput((prev) => ({ ...prev, tag: e.target.value }))} placeholder = 'Auth.common.inputPlaceholder.Tag'/>
                                        </DivContainer>
                                    </DivContainer>

                                    <DivContainer option = 'w-[90%]'>
                                        { (inputFocus === 'tag' || inputFocus === 'username') && inputDescription && <Text c = {0} option = 'text-[1vh] animate-slide-up select-none'>{ inputDescription }</Text> }
                                    </DivContainer>
                                </DivContainer>

                                <DivContainer option = 'gap-1'>
                                    <Text c = {0} s = {5} w = {2} i18nKey = 'Auth.common.inputHeading.PasswordColon' option = 'animate-slide-up'/>
                                    <Input onFocus = {() => setInputFocus('password')} onBlur = {() => setInputFocus('')} autoComplete = 'off' type = 'password' option = 'outline-none h-[3.5vh] !text-xs' onChange = {(e) => setUserInput((prev) => ({ ...prev, password: e.target.value }))} placeholder = 'Auth.common.inputPlaceholder.Password'/>
                                    { inputFocus === 'password' && inputDescription && <Text c = {0} option = 'text-[1vh] animate-slide-up select-none'>{ inputDescription }</Text> }

                                    <DivContainer option = 'gap-2'>
                                        { errorMessage && <Text s = {5} option = "before:content-['*_'] dark:text-red-400 text-red-400" i18nKey = {`${errorMessage}`}/> }
                                    </DivContainer>
                                </DivContainer>
                            </DivContainer>

                            <DivContainer option = 'gap-3'>
                                <Button option = 'h-[3.5vh] !font-small !text-sm' onClick = {(e) => handleSubmit(e)}>{'Auth.Signup.button.CreateAcc'}</Button>
                            
                                <Text c = {0} option = 'select-none text-[1vh]'>
                                    <Trans 
                                        i18nKey = {'Auth.Signup.description.note7'}
                                        components = {{
                                            A: 
                                            <Link
                                                to="/terms_services"
                                                className="underline text-[#818bf0] cursor-pointer"
                                            />,

                                            B:
                                            <Link
                                                to = '/privacy_policy'
                                                className="underline text-[#818bf0] cursor-pointer"
                                            />
                                        }}
                                    />
                                </Text>

                                <Text s = {5} c = {1} option = 'select-none'>
                                    <Trans 
                                        i18nKey = {'Auth.Signup.inputTools.Signup'}
                                        components = {{
                                            highlight: 
                                            <Link
                                                to="/auth/Login"
                                                className="underline text-[#818bf0] cursor-pointer"
                                            />
                                        }}
                                    />
                                </Text>
                            </DivContainer>
                        </DivContainer>
                    </form>
                </DivContainer>
            </DivContainer>
        </Container>
    );
}

// Production key 6LcFvRMsAAAAAHWQbvk5t-uY-pOImM6qCMNdcwN0
export default function SignUpForm() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey= '6Leq0SEsAAAAAH2jQjYnatQGZraGNeD7gUB6upHZ'>
            <DivContainer option = 'h-[100vh] w-full'>
                <SignupFormInner />
            </DivContainer>
        </GoogleReCaptchaProvider>
    )
}


/*

useEffect(() => {
        (async () => {
            const hasRefreshToken = await ApiRequest('/auth/hasRefreshToken');
            if (hasRefreshToken.success) {
                navigate('/dashboard', { replace: true });
            }
        })()
    }, []);

<div className = {loading ? styles.loading : null}>
            <div className={styles.Overlay}>
                <div className={styles.LogInSignUpBox}>

                    <div className={styles.LeftBox}>
                        <img src="/assets/loginsignupRegion/logo.png" alt="logo" />
                        <h1 className={styles.Name}>Biomation</h1>
                        <h1 className={styles.Slogan}>
                            The Best Agricultural Tools That Ensure<br /> Food Security And Efficiency
                        </h1>
                    </div>

                    <div className={styles.RightBox}>

                        <div>
                            <h1 className={styles.Heading}>Welcome!</h1>
                            <h1 className={styles.SubHeading}>
                                <br />Sign Up Now To Access <br />Features And Notifications!
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className={`${styles.row} ${styles.NameInput}`}>

                                <div className={styles.NameSection}>
                                    <h1 className={styles.Label}>First Name:</h1>
                                    <input
                                        className={styles.NameInputBox}
                                        type="text"
                                        maxLength="30"
                                        value={Name.first}
                                        onChange={(e) => setName(prev => ({ ...prev, first: HandleName(e) }))}
                                        required
                                    />
                                </div>

                                <div className={styles.NameSection}>
                                    <h1 className={styles.Label}>
                                        Middle Name: <span style={{ color: 'grey', fontSize: '0.5rem' }}>(Optional)</span>
                                    </h1>
                                    <input
                                        className={styles.NameInputBox}
                                        type="text"
                                        maxLength="100"
                                        value={Name.middle}
                                        onChange={(e) => setName(prev => ({ ...prev, middle: HandleName(e) }))}
                                    />
                                </div>

                                <div className={styles.NameSection}>
                                    <h1 className={styles.Label}>Last Name:</h1>
                                    <input
                                        className={styles.NameInputBox}
                                        type="text"
                                        maxLength="30"
                                        value={Name.last}
                                        onChange={(e) => setName(prev => ({ ...prev, last: HandleName(e) }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={`${styles.UserNameInput} ${styles.row}`}>

                                <div className={styles.UserName}>
                                    <h1 className={styles.Label}>Username:</h1>
                                    <input
                                        className={styles.UserNameInputBox}
                                        type="text"
                                        minLength="7"
                                        maxLength="30"
                                        value={username}
                                        onChange={(e) => setUsername(HandleUserName(e))}
                                        required
                                    />
                                </div>

                                <div className={styles.tag}>
                                    <h1 className={styles.Label}>
                                        Tag: <span style={{ color: 'grey', fontSize: '0.5rem' }}>(4 Digits)</span>
                                    </h1>
                                    <input
                                        className={styles.TagInputBox}
                                        type="text"
                                        minLength="4"
                                        maxLength="4"
                                        value={digit}
                                        onChange={(e) => setDigit(handleDigit(e))}
                                        required
                                    />
                                </div>

                            </div>

                            <div className={styles.row}>

                                <div className={styles.EmailInput}>
                                    <div className={styles.Email}>
                                        <h1 className={styles.Label}>Email:</h1>
                                        <input
                                            className={styles.EmailInputBox}
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(handleEmail(e))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.PhoneInput}>
                                    <div className={styles.Phone}>
                                        <h1 className={styles.Label}>Phone Number:</h1>
                                        <input
                                            className={styles.PhoneInputBox}
                                            type="tel"
                                            maxLength="12"
                                            value={phone}
                                            onChange={(e) => setPhone(handlePhone(e))}
                                            autoComplete='tel'
                                            required
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className={styles.PasswordInput}>
                                <h1 className={styles.Label}>Password:</h1>
                                <input
                                    className={styles.PasswordInputBox}
                                    type="password"
                                    minLength="7"
                                    maxLength="20"
                                    value={password}
                                    onChange={(e) => setPassword(handlePassword(e))}
                                    autoComplete="new-password"
                                    required
                                />
                                <p style={{ color: 'grey', fontSize: '0.7rem', width: '45%' }}>
                                    Password must include an uppercase letter, a digit or symbol, and be 7–20 characters.
                                </p>
                            </div>

                            <div className={styles.FormActions}>
                                
                                <div className = {styles.column}>
                                    <button className={styles.SignUpButton} disabled = {!recaptchaReady || loading}>CREATE ACCOUNT</button>
                                    <h1 className = {styles.errorMessage}>{errorMessage}</h1>
                                </div>

                                <div className={`${styles.RedirectSection} ${styles.row}`}>
                                    <Link to='/auth/org-signup'>
                                        <p className={styles.ToOrganization}>Signup As Organization?</p>
                                    </Link>

                                    <Link to='/auth/login'>
                                        <p className={styles.ToLogInUser}>Log In?</p>
                                    </Link>
                                </div>
                            </div>

                            <div className={styles.other}>
                                <label htmlFor="TOS">
                                    By ticking the box you agree to our Terms of Service.
                                </label>
                                <input
                                    id="TOS"
                                    type="checkbox"
                                    checked={TOS}
                                    onChange={(e) => setTOS(handleTOS(e))}
                                    style={{ marginRight: '1vh' }}
                                />
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>

*/