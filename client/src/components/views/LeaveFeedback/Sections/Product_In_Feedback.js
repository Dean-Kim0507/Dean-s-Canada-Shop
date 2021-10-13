import React from 'react';

function Product_In_Feedback(props) {

	const renderCartImage = (images) => {
		if (images.length > 0) {
			let image = images[0]
			return `${image}`
		}
	}

	return (
		<div>
			{props.product &&
				<div style={{ marginTop: '3rem' }}>
					Product Detail
					<div>
						<br />
						<table >
							<thead >
								<tr>
									<th >Product Image</th>
									<th>Product Title</th>
									<th>Product Price</th>
									<th>Seller</th>
									<th>Seller Email</th>
								</tr>
							</thead>

							<tbody>
								<tr >
									<td>

										<img style={{ width: '100px' }} alt="product"
											src={renderCartImage(props.product.images)} />
									</td>
									<td>
										{props.product.title}
									</td>
									<td>
										$ {props.product.price}
									</td>
									<td>
										{props.product.writer.name}
									</td>
									<td>
										{props.product.writer.email}
									</td>

								</tr>
							</tbody>
						</table>
					</div>
				</div>
			}
		</div >
	);
}

export default Product_In_Feedback;