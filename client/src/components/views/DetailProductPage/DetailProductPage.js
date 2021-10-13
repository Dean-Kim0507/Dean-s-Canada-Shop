import React, { useEffect, useState } from 'react'
import axios from 'axios';
import ProductImage from './Sections/ProductImage';
import ProductInfo from './Sections/ProductInfo';
import { Row, Col } from 'antd';

function DetailProductPage(props) {

    const productId = props.match.params.productId

    const [Product, setProduct] = useState({})

    useEffect(() => {
        if (props.user.userData) {

            axios.get(`/api/product/products_by_id?id=${productId}&type=single&userid=${props.user.userData._id}`)
                .then(response => {
                    setProduct(response.data)
                })
                .catch(err => alert(err))
        }
    }, [props.user])


    return (

        <div style={{ width: '100%', padding: '3rem 4rem' }}>
            { Product &&
                <div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <h1>{Product.title}</h1>
                    </div>

                    <br />

                    <Row gutter={[16, 16]} >
                        <Col lg={12} sm={24}>
                            {/* ProductImage */}
                            <ProductImage detail={Product} />
                        </Col>
                        <Col lg={12} sm={24}>
                            {/* ProductInfo */}
                            <ProductInfo detail={Product} />
                        </Col>
                    </Row>
                </div>
            }

        </div>

    )
}

export default DetailProductPage
