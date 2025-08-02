import React, { useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // useAuth 임포트
import '../styles/LoginPage.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('유효한 이메일 주소를 입력해주세요.')
    .required('이메일은 필수입니다.'),
  password: Yup.string()
    .required('비밀번호는 필수입니다.'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // useAuth로 login 함수 가져오기
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

  const handleOAuth2Redirect = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const provider = urlParams.get('state');

    if (code && provider) {
      try {
        const endpoint = provider === 'kakao' ? '/user/kakao/doLogin' : '/login/oauth2/code/google';
        const res = await axios.get(`${API_BASE_URL}${endpoint}?code=${code}`);
        console.log('OAuth2 응답:', res.data);

        localStorage.setItem('jwt', res.data.token);
        if (res.data.user) {
          await login({ identifier: res.data.user.email, password: '' }); // login 함수 호출
        }
        alert(`${provider === 'kakao' ? '카카오' : 'Google'} 로그인 성공!`);
        navigate('/');
      } catch (err) {
        console.error(`${provider} 로그인 실패:`, err.response?.data || err.message);
        alert(`${provider === 'kakao' ? '카카오' : 'Google'} 로그인에 실패했습니다.`);
      }
    }
  }, [API_BASE_URL, navigate, login]);

  useEffect(() => {
    handleOAuth2Redirect();
  }, [handleOAuth2Redirect]);

  return (
    <div className="login-page-container">
      <div className="login-box">
        <Link to="/" className="logo-link">
          <img src="/images/logo.png" alt="FLO 로고" className="logo-image" />
        </Link>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            setSubmitting(true);
            try {
              const success = await login({ identifier: values.email, password: values.password });
              if (success) {
                alert('로그인 성공!');
                navigate('/');
              } else {
                setFieldError('email', '이메일 또는 비밀번호가 올바르지 않습니다.');
                setFieldError('password', ' ');
              }
            } catch (err) {
              console.error('로그인 실패:', err.response?.data || err.message);
              setFieldError('email', err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
              setFieldError('password', ' ');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="login-form">
              <h2 className="form-title">로그인</h2>

              <div className="form-group">
                <Field
                  type="email"
                  name="email"
                  placeholder="이메일"
                  className="form-input"
                />
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <Field
                  type="password"
                  name="password"
                  placeholder="비밀번호"
                  className="form-input"
                />
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <div className="forgot-password-link">
                <Link to="/find-password" className="forgot-password-link">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="form-button"
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </button>

              <div className="form-links">
                <p>
                  계정이 없으신가요?{' '}
                  <Link to="/signup" className="form-link">
                    회원가입
                  </Link>
                </p>
              </div>

              <div className="oauth-login">
                <a
                  href={`${API_BASE_URL}/oauth2/authorization/google`}
                  className="oauth-button google-login-button"
                >
                  Google로 로그인
                </a>
                <a
                  href={`${API_BASE_URL}/oauth2/authorization/kakao`}
                  className="oauth-button kakao-login-button"
                >
                  카카오로 로그인
                </a>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;