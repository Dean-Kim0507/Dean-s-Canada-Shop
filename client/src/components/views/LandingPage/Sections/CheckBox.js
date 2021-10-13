import React, { useState } from 'react'
import { Collapse, Checkbox } from 'antd';

const { Panel } = Collapse;

function CheckBox(props) {

    const [Checked, setChecked] = useState([])

    const handleToggle = (value) => {
        //Get clicked index
        const currentIndex = Checked.indexOf(value)
        // if check box exists in checked states
        const newChecked = [...Checked]

        // Put in state. 
        if (currentIndex === -1) {
            newChecked.push(value)
            // Put out
        } else {
            newChecked.splice(currentIndex, 1)
        }
        setChecked(newChecked)
        props.handleFilters(newChecked)
    }


    // Rendering check box list
    const renderCheckboxLists = () => props.list && props.list.map((value, index) => (
        <React.Fragment key={index} >
            <Checkbox onChange={() => handleToggle(value._id)}
                checked={Checked.indexOf(value._id) === -1 ? false : true}
                style={{ marginLeft: '1rem' }}
            />
            <span style={{ marginLeft: '0.5rem' }}>{value.name}</span>
            <br />
        </React.Fragment>
    ))

    return (
        <div>
            <Collapse defaultActiveKey={['0']} >
                <Panel header="Continents" key="1">

                    {renderCheckboxLists()}

                </Panel>
            </Collapse>
        </div>
    )
}

export default CheckBox
