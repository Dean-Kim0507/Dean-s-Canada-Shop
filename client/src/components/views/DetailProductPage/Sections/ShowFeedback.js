import React from 'react';
import { Rate, Comment } from 'antd';

function ShowFeedback(props) {

	const renderFeedbacks = () => {
		let feedback = []
		feedback = props.feedback;
		if (feedback.length !== 0) {
			return feedback.map((item, index) => (
				<div key={item.writer._id}>
					<Comment
						author={item.author}
						avatar={item.writer.image}
						content={item.text}
						datetime={String(new Date(item.date))}
					/>
					<Rate disabled defaultValue={item.rating} />
				</div>
			))
		} else {
			return <h4>No Review</h4>
		}
	}

	return (
		<div>
			<div>
				<h2>Review</h2>
			</div>
			{
				props.feedback &&
				renderFeedbacks()
			}
		</div>
	);
}

export default ShowFeedback;