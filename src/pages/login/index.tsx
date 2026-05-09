import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { FormattedMessage, Helmet, history, useIntl } from '@umijs/max';
import { Alert, App, Button, Form, Input, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import { getCaptcha, login } from '@/services/ant-design-pro/api';
import './index.less';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return <Alert className="login-error" message={content} type="error" showIcon />;
};

const Login: React.FC = () => {
  const [form] = Form.useForm<API.LoginParams>();
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type] = useState<string>('account');
  const [lang, setLang] = useState<string>('arabic');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(false);
  const { message } = App.useApp();
  const intl = useIntl();

  const refreshCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      const msg = await getCaptcha();
      const captchaKey = msg?.data?.captchaKey;
      const captchaBase64 = msg?.data?.captchaBase64;

      form.setFieldValue('captchaCode', undefined);
      form.setFieldValue('captchaKey', captchaKey);
      setCaptchaImage(
        captchaBase64
          ? captchaBase64.startsWith('data:image')
            ? captchaBase64
            : `data:image/png;base64,${captchaBase64}`
          : ''
      );
    } catch (error) {
      console.log(error);
      setCaptchaImage('');
      form.setFieldValue('captchaKey', undefined);
      message.error(
        intl.formatMessage({
          id: 'pages.login.captcha.failure',
          defaultMessage: 'Get captcha failed, please retry.',
        })
      );
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    void refreshCaptcha();
  }, []);

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const msg = await login({ ...values, type });
      if (msg.code === '00000') {
        const token = msg?.data?.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
        }
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: 'Login successful!',
        });
        message.success(defaultLoginSuccessMessage);
        history.push(`/region`);
        return;
      }
      setUserLoginState(msg);
      void refreshCaptcha();
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: 'Login failed, please retry!',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
      void refreshCaptcha();
    }
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className="login-page">
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: 'Login',
          })}
        </title>
      </Helmet>
      <div className="login-brand">
        <img alt="logo" src="/logo.png" />
        <span>SRILL LIMITED</span>
      </div>
      <div className="login-panel">
        <div className="login-content">
          <div className="login-left">
            <div>
              <h2 className="login-welcome">
                {intl.formatMessage({
                  id: 'pages.login.welcome',
                  defaultMessage: 'Salam, Welcome to',
                })}
              </h2>
              <div className="login-system-name">
                {intl.formatMessage({
                  id: 'pages.login.systemName',
                  defaultMessage: 'Jamming Management System',
                })}
              </div>
            </div>
            <div className="login-logo-wrap">
              <img alt="system-logo" src="/logo.png" />
            </div>
          </div>
          <div className="login-right">
            <h2 className="login-title">
              {intl.formatMessage({
                id: 'pages.login.title',
                defaultMessage: 'Log In',
              })}
            </h2>
            <Form<API.LoginParams>
              form={form}
              className="login-form"
              initialValues={{
                username: 'admin',
                password: '123456',
              }}
              onFinish={handleSubmit}
            >
              <Form.Item name="captchaKey" hidden>
                <Input />
              </Form.Item>
              {status === 'error' && loginType === 'account' && (
                <LoginMessage
                  content={intl.formatMessage({
                    id: 'pages.login.accountLogin.errorMessage',
                    defaultMessage: 'Incorrect username or password.',
                  })}
                />
              )}
              <Form.Item
                className="login-field"
                name="username"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="Please input username!"
                      />
                    ),
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder={intl.formatMessage({
                    id: 'pages.login.username.placeholder',
                    defaultMessage: 'User Name',
                  })}
                />
              </Form.Item>
              <Form.Item
                className="login-field"
                name="password"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="Please input password!"
                      />
                    ),
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder={intl.formatMessage({
                    id: 'pages.login.password.placeholder',
                    defaultMessage: 'Password',
                  })}
                />
              </Form.Item>
              <div className="login-captcha-row">
                <Form.Item
                  className="login-field login-captcha-input"
                  name="captchaCode"
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.login.captcha.required"
                          defaultMessage="Please input verification code!"
                        />
                      ),
                    },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined />}
                    placeholder={intl.formatMessage({
                      id: 'pages.login.captcha.placeholder',
                      defaultMessage: 'Verification Code',
                    })}
                  />
                </Form.Item>
                <button
                  type="button"
                  className="login-captcha-trigger"
                  onClick={() => void refreshCaptcha()}
                  aria-label="Refresh captcha"
                >
                  {captchaImage ? (
                    <img className="login-captcha-image" src={captchaImage} alt="captcha" />
                  ) : (
                    <span className="login-captcha-placeholder">
                      {captchaLoading
                        ? intl.formatMessage({
                            id: 'pages.login.captcha.loading',
                            defaultMessage: 'Loading...',
                          })
                        : intl.formatMessage({
                            id: 'pages.login.captcha.reload',
                            defaultMessage: 'Reload',
                          })}
                    </span>
                  )}
                </button>
              </div>
              <div className="login-language-row">
                <Radio.Group value={lang} onChange={(e) => setLang(e.target.value)}>
                  <Radio value="arabic">
                    {intl.formatMessage({
                      id: 'pages.login.language.arabic',
                      defaultMessage: 'Arabic',
                    })}
                  </Radio>
                  <Radio value="english">
                    {intl.formatMessage({
                      id: 'pages.login.language.english',
                      defaultMessage: 'English',
                    })}
                  </Radio>
                  <Radio value="chinese">
                    {intl.formatMessage({
                      id: 'pages.login.language.chinese',
                      defaultMessage: 'Chinese',
                    })}
                  </Radio>
                </Radio.Group>
              </div>
              <Button className="login-submit" type="primary" htmlType="submit">
                {intl.formatMessage({
                  id: 'pages.login.submit',
                  defaultMessage: 'Log In',
                })}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
