import React from 'react';
import { Rate, Comment } from 'antd';
import moment from 'moment'

function ShowFeedback(props) {

	const renderFeedbacks = () => {
		let feedback = []
		feedback = props.feedback;
		if (feedback.length !== 0) {
			return feedback.map((item, index) => (
				<div key={item.writer._id}>
					<Comment
						author={item.writer.name}
						avatar={item.writer.image}
						content={item.text}
						datetime={String(moment(new Date(item.date)))}
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