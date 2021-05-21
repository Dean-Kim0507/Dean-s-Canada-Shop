import React from 'react'
import { Button } from 'antd'

function MyPage(props) {

    const laveFeedback = (event) => {
        props.history.push(`/feedback/${event.target.value}`)
    }

    return (
        <div style={{ width: '80%', margin: '3rem auto' }}>
            <div style={{ textAlign: 'center' }}>
                <h1>History</h1>
            </div>
            <br />

            <table key='history_table'>
                <thead>
                    <tr>
                        <th>Payment Id</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Date of Purchase</th>
                        <th>Total Price</th>
                        <th>Leave Feedback</th>
                    </tr>
                </thead>
                <tbody key='history_body'>
                    {props.user.userData && props.user.userData.history &&
                        props.user.userData.history.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{'$' + item.price}</td>
                                <td>{item.quantity}</td>
                                <td>{(String)(new Date(item.dateOfPurchase))}</td>
                                <td>{'$' + item.price * item.quantity}</td>
                                <td><Button type="link" onClick={laveFeedback} value={item.id}>Leave Feedback</Button></td>
                            </tr>
                        ))

                    }
                </tbody>
            </table>
            <br />
        </div>
    )
}

export default MyPage
