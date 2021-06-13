import React, { useEffect } from 'react';
import { Formik } from 'formik'
import moment from "moment";
import * as Yup from 'yup';
import { USER_SERVER } from '../../../components/Config.js';
import { notification, message, Form, Input, Button } from 'antd'
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

const ResetPw = (props) => {
	return (
		<div>
			<Formik
				initialValues={{
					password: '',
					confirmPassword: ''
				}}
				validationSchema={Yup.object().shape({
					password: Yup.string()
						.min(6, 'Password must be at least 6 characters')
						.required('Password is required'),
					confirmPassword: Yup.string()
						.oneOf([Yup.ref('password'), null], 'Passwords must match')
						.required('Confirm Password is required')
				})}
				onSubmit={(values, { setSubmitting }) => {
					setTimeout(() => {
						let dataToSubmit = {
							email: props.match.params.email,
							token: props.match.params.token,
							password: values.password
						};
						console.log(dataToSubmit)
						axios.post(`${USER_SERVER}/resetpw`, dataToSubmit)
							.then(response => {
								console.log(response.data)
								if (response.data.success) {

									notification.open({
										message: 'Password Reset Success',
										description:
											'Password reset success! Please login again.',
										icon: < SmileOutlined style={{ color: '#108ee9' }} />,
									});
									props.history.push("/login");
								} else if (response.data.error) {
									notification.open({
										message: 'Fail',
										description:
											"Token is expired.",
										icon: <FrownOutlined style={{ color: '#108ee9' }} />,
									});
									props.history.push("/login");
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
						<div className="app">
							<h2>Reset Password</h2>
							<Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >
								<Form.Item required label="Password" hasFeedback validateStatus={errors.password && touched.password ? "error" : 'success'}>
									<Input
										id="password"
										placeholder="Enter your password"
										type="password"
										value={values.password}
										onChange={handleChange}
										onBlur={handleBlur}
										className={
											errors.password && touched.password ? 'text-input error' : 'text-input'
										}
									/>
									{errors.password && touched.password && (
										<div className="input-feedback">{errors.password}</div>
									)}
								</Form.Item>

								<Form.Item required label="Confirm" hasFeedback>
									<Input
										id="confirmPassword"
										placeholder="Enter your confirmPassword"
										type="password"
										value={values.confirmPassword}
										onChange={handleChange}
										onBlur={handleBlur}
										className={
											errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input'
										}
									/>
									{errors.confirmPassword && touched.confirmPassword && (
										<div className="input-feedback">{errors.confirmPassword}</div>
									)}
								</Form.Item>
								<Form.Item {...tailFormItemLayout}>
									{
										<Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
											Submit
										</Button>
									}
								</Form.Item>
							</Form>
						</div>
					);
				}}
			</Formik>
		</div>
	);
};

export default ResetPw;