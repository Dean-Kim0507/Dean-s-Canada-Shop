import React, { useState } from 'react'
import { Input, message } from 'antd';

const { Search } = Input;

function SearchFeature(props) {

    const [SearchTerm, setSearchTerm] = useState("")
    const [ShowAlert, setShowAlert] = useState(false)

    const onChangeHandler = (event) => {
        setSearchTerm(event.currentTarget.value)
    }

    const searchHandler = () => {
        if (SearchTerm.length > 0) {
            props.refreshFunction(SearchTerm)

        }
        else {
            error()
        }
    }
    const error = () => {
        return message.warning('Blank Cannot be accepted');
    };

    return (
        <div style={{ width: '80%' }}>
            <Search
                placeholder="What you want to get?"
                onChange={onChangeHandler}
                onSearch={searchHandler}
                onPressEnter={searchHandler}
                value={SearchTerm}
                size={'large'}


            />

        </div>
    )
}

export default SearchFeature
