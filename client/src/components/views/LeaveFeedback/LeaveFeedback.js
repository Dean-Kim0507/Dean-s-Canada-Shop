import React, { useState, useEffect } from 'react';
import { Input, Rate, Button, message } from 'antd';
import axios from 'axios'
import Product_In_Feedback from './Sections/Product_In_Feedback';
const { TextArea } = Input;

function LeaveFeedback(props) {

	const [TextValue, setTextValue] = useState('');
	const [Product, setProduct] = useState();
	const [Stars, setStars] = useState(5);

	useEffect(() => {
		if (props.match.params.productId) {
			axios.get(`/api/product/products_by_id?id=${props.match.params.productId}&type=feedback&userid=${null}`)
				.then(response => {
					setProduct(response.data[0])
				})
				.catch(err => alert(err))
		}
	}, [])

	const onChange = e => {
		setTextValue(e.target.value);
	};

	const RateHandleChange = (stars) => {
		setStars(stars);
	}

	const onSubmit = (event) => {
		event.preventDefault();

		if (!TextValue.length === 0) {
			return message.error('No blank is allowed');
		}

		let body = {
			productId: Product._id,
			stars: Stars,
			feedback: TextValue,
			type: 'Feedback'
		};

		axios.post('/api/product', body)
			.then(response => {
				if (response.data.success) {
					message.success('Upload success');
					props.history.push('/my_page')
				} else {
					message.error('Upload Fail');
				}
			})
	}


	return (
		<form onSubmit={() => onSubmit}>
			<div style={{ width: '70%', margin: 'auto' }} >
				<Product_In_Feedback product={Product} />
			</div>
			<br />
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				Rate This Product
			</div>
			<br />
			<div style={{ display: 'flex', justifyContent: 'center' }} >
				<Rate onChange={RateHandleChange} value={Stars} />
			</div>
			<br />
			<div style={{ display: 'flex', justifyContent: 'center' }} >
				<TextArea
					onChange={onChange}
					allowClear={true}
					onPressEnter={onSubmit}
					maxLength={200}
					style={{ width: '50%' }}
					value={TextValue}
					placeholder='Only 200 Characters'
				/>
			</div>
			<br />
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Button onClick={onSubmit}>Submit</Button>
			</div>
		</form>
	);
}

export default LeaveFeedback;