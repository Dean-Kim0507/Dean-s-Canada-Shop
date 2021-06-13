import React, { useState } from 'react';
import { Form, Input, Button, message, notification } from 'antd'
import { USER_SERVER } from '../../../components/Config.js';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { SmileOutlined, FrownOutlined } from '@ant-design/icons';

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};
const tailFormItemLayout = {
	wrapperCol: {
		xs: {
			span: 24,
			offset: 0,
		},
		sm: {
			span: 16,
			offset: 8,
		},
	},
};

function ForgotPw(props) {
	const [Validating, setValidating] = useState(false);
	return (
		<div>
			<Formik
				initialValues={{
					email: ''
				}}
				validationSchema={Yup.object().shape({
					email: Yup.string()
						.email('Email is invalid')
						.required('Email is required'),
				})}
				onSubmit={(values, { setSubmitting }) => {
					setValidating(true)
					setTimeout(() => {
						let dataToSubmit = {
							email: values.email,
						};
						axios.post(`${USER_SERVER}/forgot`, dataToSubmit)
							.then(response => {
								console.log(response.data)
								if (response.data.success) {
									notification.open({
										message: 'Password Reset',
										description:
											'We have just sent you a link to rest your password. This link is valid for 1 hour! Please check your Email in the time. ',
										icon: < SmileOutlined style={{ color: '#108ee9' }} />,
									});
									props.history.push("/login");
								} else if (response.data.message) {
									notification.open({
										message: 'Fail',
										description:
											response.data.message,
										icon: <FrownOutlined style={{ color: '#108ee9' }} />,
									});
									setValidating(false)
								}
							})
						setSubmitting(false);
					}, 500);
				}}
			>
				{props => {
					const {
						values,
						touched,
						errors,
						isSubmitting,
						handleChange,
						handleBlur,
						handleSubmit,
					} = props;
					return (
						<div className="app" >
							<h2>Forgot your password?</h2>
							<p>Don't worry! Just fill in your email and we'll send you a link to reset your password.</p>
							<br />
							<Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >

								<Form.Item required label="Email" hasFeedback validateStatus={errors.email && touched.email ? "error" : Validating ? 'validating' : 'success '}>
									<Input
										id="email"
										placeholder="Enter your Email"
										type="email"
										value={values.email}
										onChange={handleChange}
										onBlur={handleBlur}
										className={
											errors.email && touched.email ? 'text-input error' : 'text-input'
										}
									/>
									{errors.email && touched.email && (
										<div className="input-feedback">{errors.email}</div>
									)}
								</Form.Item>

								<Form.Item {...tailFormItemLayout}>
									<Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
										Submit
									</Button>
								</Form.Item>
							</Form>
						</div>
					);
				}}
			</Formik>
		</div >
	)
};

export default ForgotPw;