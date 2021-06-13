import React from 'react'
import { Button, Descriptions, notification, Rate } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../_actions/user_actions';
import ShowFeedback from './ShowFeedback';
import { SmileOutlined } from '@ant-design/icons';

function ProductInfo(props) {
    const dispatch = useDispatch();

    const success = () => {
        notification.open({
            message: 'Added to Cart',
            icon: <SmileOutlined style={{ color: '#108ee9' }} />,
        });
    };

    const clickHandler = () => {
        //필요한 정보를 Cart 필드에다가 넣어 준다.
        dispatch(addToCart(props.detail._id))
        success()
    }

    const rating = () => {
        let rating = 0;
        const feedback = props.detail.feedback;
        console.log(feedback)
        feedback.forEach((item) => (

            rating += item.rating
        ))

        return rating / feedback.length;

    }

    return (
        <div>
            {props.detail.feedback &&
                <div>
                    <Descriptions title="Product Info" size={'middle'}>
                        <Descriptions.Item label="Price">{'$' + props.detail.price}</Descriptions.Item>
                        <Descriptions.Item label="Sold">{props.detail.sold}</Descriptions.Item>
                        <Descriptions.Item label="View">{props.detail.views}</Descriptions.Item>
                        <Descriptions.Item label="Description">{props.detail.description}</Descriptions.Item>
                    </Descriptions>
                    <strong>Rating: </strong><Rate disabled defaultValue={rating()} />
                </div>
            }
            <br />
            <br />
            <br />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button size="large" shape="round" type="danger" onClick={clickHandler}>
                    Add to Cart
                </Button>
            </div>
            <br />
            <br />
            <ShowFeedback feedback={props.detail.feedback} />


        </div >
    )
}

export default ProductInfo
