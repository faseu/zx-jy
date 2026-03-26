import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { FormattedMessage, Helmet, useIntl } from '@umijs/max';
import { Alert, App, Button, Form, Input, Radio } from 'antd';
import React, { useState } from 'react';
import { login } from '@/services/ant-design-pro/api';
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
  const { message } = App.useApp();
  const intl = useIntl();

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
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        window.location.href = '/region';
        return;
      }
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className="login-page">
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
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
              <h2 className="login-welcome">Salam, Welcome to</h2>
              <div className="login-system-name">Jamming Managment System</div>
            </div>
            <div className="login-logo-wrap">
              <img alt="system-logo" src="/logo.png" />
            </div>
          </div>
          <div className="login-right">
            <h2 className="login-title">Log In</h2>
            <Form<API.LoginParams>
              form={form}
              className="login-form"
              initialValues={{
                username: 'admin',
                password: '123456',
              }}
              onFinish={handleSubmit}
            >
              {status === 'error' && loginType === 'account' && (
                <LoginMessage
                  content={intl.formatMessage({
                    id: 'pages.login.accountLogin.errorMessage',
                    defaultMessage: '账户或密码错误 (admin/ant.design)',
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
                        defaultMessage="请输入用户名!"
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
                        defaultMessage="请输入密码！"
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
              <div className="login-language-row">
                <Radio.Group value={lang} onChange={(e) => setLang(e.target.value)}>
                  <Radio value="arabic">Arabic</Radio>
                  <Radio value="english">English</Radio>
                  <Radio value="chinese">Chinese</Radio>
                </Radio.Group>
              </div>
              <Button className="login-submit" type="primary" htmlType="submit">
                log in
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
