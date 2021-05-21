import React from 'react';
import { Col, Row } from 'antd';
import { GithubOutlined, LinkedinOutlined } from '@ant-design/icons';

function Links(props) {
	return (
		<div >
			<Row>
				<Col span={23}>
					<a href='https://github.com/Dean-Kim0507/Dean-s-Canada-Shop'><GithubOutlined style={{ fontSize: '25px' }} /></a>
				</Col>
				<Col span={1}>
					<a href='https://www.linkedin.com/in/donghyunkimdean'><LinkedinOutlined style={{ fontSize: '25px' }} /></a>
				</Col>
			</Row>
		</div>
	);
}

export default Links;