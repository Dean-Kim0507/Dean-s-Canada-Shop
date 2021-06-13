/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { auth } from '../_actions/user_actions';
import { useSelector, useDispatch } from "react-redux";
import { notification } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

export default function (SpecificComponent, option, adminRoute = null) { //put in a admin page route 
    function AuthenticationCheck(props) {

        let user = useSelector(state => state.user);
        const dispatch = useDispatch();

        useEffect(() => {
            //To know my current status, send Auth request 
            dispatch(auth()).then(response => {
                //Not Loggined in Status 
                if (!response.payload.isAuth) {
                    if (option) { //option -> This can be accessed only admin?
                        notification.open({
                            message: 'Token is expired',
                            description:
                                'Token is expired, Please login again',
                            icon: <FrownOutlined style={{ color: '#108ee9' }} />,
                        });
                        props.history.push('/login')
                    }
                    //Loggined in Status 
                } else {
                    //supposed to be Admin page, but not admin person wants to go inside
                    if (adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    }
                    //Logged in Status, but Try to go into log in page 
                    else {
                        if (option === false) {
                            notification.open({
                                message: 'Error',
                                description:
                                    'You can not access here. Please log out first.',
                                icon: <FrownOutlined style={{ color: '#108ee9' }} />,
                            });
                            props.history.push('/')
                        }
                    }
                }
            })

        }, [])

        return (
            <SpecificComponent {...props} user={user} />
        )
    }
    return AuthenticationCheck
}


