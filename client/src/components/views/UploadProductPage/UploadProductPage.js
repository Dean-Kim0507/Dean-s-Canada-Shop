import React, { useState } from 'react'
import { Form, Input, message, Button } from 'antd';
import FileUpload from '../../utils/FileUpload';
import Axios from 'axios';
const { TextArea } = Input;

const Sorts = [
    { key: 1, value: "Clothes & Shoes" },
    { key: 2, value: "Supplements" },
    { key: 3, value: "Beauty" },
    { key: 4, value: "Baby" },
    { key: 5, value: "Appliances" },
    { key: 6, value: "Home Products" },
    { key: 7, value: "Pet Supplies" }
]

function UploadProductPage(props) {

    const [Title, setTitle] = useState("")
    const [Description, setDescription] = useState("")
    const [Price, setPrice] = useState(0)
    const [Sort, setSort] = useState(1)
    const [Images, setImages] = useState([])

    const titleChangeHandler = (event) => {
        setTitle(event.currentTarget.value)
    }

    const descriptionChangeHandler = (event) => {
        setDescription(event.currentTarget.value)
    }

    const priceChangeHandler = (event) => {
        setPrice(event.currentTarget.value)
    }

    const SortChangeHandler = (event) => {
        setSort(event.currentTarget.value)
    }

    const updateImages = (newImages) => {
        setImages(newImages)
    }

    const submitHandler = (event) => {
        event.preventDefault();

        if (!Title || !Description || !Price || !Sort || Images.length === 0) {
            return message.error('No blank is allowed');
        }

        const body = {
            //user info
            writer: props.user.userData._id,
            title: Title,
            description: Description,
            price: Price,
            images: Images,
            sort: Sort,
            type: 'NewProduct'
        }
        console.log(body)

        Axios.post('/api/product', body)
            .then(response => {
                if (response.data.success) {
                    message.success('Upload success');
                    props.history.push('/')
                } else {
                    message.error('Upload Fail');
                }
            })
    }


    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2> Upload</h2>
            </div>
            <div style={{ textAlign: 'end' }}>
                <p >If you want to delete a picture, just click!</p>
            </div>
            <Form onSubmit={submitHandler}>
                {/* DropZone */}
                <FileUpload refreshFunction={updateImages} />

                <br />
                <br />
                <label>Title</label>
                <Input onChange={titleChangeHandler} value={Title} />
                <br />
                <br />
                <label>Description</label>
                <TextArea onChange={descriptionChangeHandler} value={Description} />
                <br />
                <br />
                <label>Price($)</label>
                <Input type="number" onChange={priceChangeHandler} value={Price} />
                <br />
                <br />
                <label>Type of Product</label>
                <br />
                <select onChange={SortChangeHandler} value={Sort}>
                    {Sorts.map(item => (
                        <option key={item.key} value={item.key}> {item.value}</option>
                    ))}
                </select>
                <br />
                <br />
                <Button onClick={submitHandler} type="submit">
                    Submit
                </Button>
            </Form>


        </div >
    )
}

export default UploadProductPage
