import React, { useState } from 'react'
import { Collapse, Radio } from 'antd';

const { Panel } = Collapse;

//Radio box
function RadioBox(props) {

    const [Value, setValue] = useState(0)

    const renderRadioBox = () => (
        props.list && props.list.map(value => (
            <div>
                <Radio key={value._id} value={value._id}> {value.name} </Radio>
            </div>
        ))
    )

    const handleChange = (event) => {
        setValue(event.target.value)
        props.handleFilters(event.target.value)
    }

    return (
        <div>
            <Collapse defaultActiveKey={['0']} >
                <Panel header="Price" key="1">

                    <Radio.Group onChange={handleChange} value={Value}>
                        {renderRadioBox()}
                    </Radio.Group>

                </Panel>
            </Collapse>
        </div>
    )
}

export default RadioBox
