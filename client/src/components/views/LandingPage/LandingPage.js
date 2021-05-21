import React, { useEffect, useState } from 'react'
import axios from "axios";
import { Icon, Col, Card, Row } from 'antd';
import Meta from 'antd/lib/card/Meta';
import ImageSlider from '../../utils/ImageSlider';
import Checkbox from './Sections/CheckBox';
import Radiobox from './Sections/RadioBox';
import SearchFeature from './Sections/SearchFeature';
import { continents, price } from './Sections/Datas';
import Links from './Sections/Links'

function LandingPage(props) {

    const [RecentProducts, setRecentProducts] = useState([])
    const [Skip, setSkip] = useState(0)
    const [Limit, setLimit] = useState(8)
    const [PostSize, setPostSize] = useState(0)
    const [Filters, setFilters] = useState({
        continents: [],
        price: []
    })
    const [SearchTerm, setSearchTerm] = useState("")
    const [ShowFilters, setShowFilters] = useState(false);
    const [RecentViewedProducts, setRecentViewedProducts] = useState([])

    useEffect(() => {
        if (props.user.userData) {
            let body = {
                skip: Skip,
                limit: Limit,
                viewed: true,
                user: props.user.userData
            }
            getProducts(body)
        }
    }, [props.user.userData])

    const getProducts = (body) => {
        axios.post('/api/product/products', body)
            .then(response => {
                if (response.data.success) {
                    if (response.data.recentProductInfo) {
                        setRecentViewedProducts(response.data.recentProductInfo)
                    }
                    if (body.loadMore) {
                        setRecentProducts([...RecentProducts, ...response.data.productInfo])
                    } else {
                        setRecentProducts(response.data.productInfo)
                    }
                    setPostSize(response.data.postSize)
                    console.log(response.data.productInfo)
                } else {
                    alert(" Fail to get Recently Posts")
                }
            })
    }

    const loadMoreHanlder = () => {

        let skip = Skip + Limit
        let body = {
            skip: skip,
            limit: Limit,
            loadMore: true,
            filters: Filters,
            viewed: true,
            user: props.user.userData
        }

        getProducts(body)
        setSkip(skip)
    }


    const renderRecentlyPosted = RecentProducts.map((product, index) => {

        return <Col lg={6} md={8} xs={24} key={index}>
            <Card
                cover={<a href={`/product/${product._id}`} ><ImageSlider images={product.images} /></a>}
            >
                <Meta
                    title={product.title}
                    description={`$${product.price}`}
                />
            </Card>
        </Col>
    })

    const renderRecentlyViewed = RecentViewedProducts.map((product, index) => {

        return <Col lg={6} md={8} xs={24} key={index}>
            <Card
                cover={<a href={`/product/${product._id}`} ><ImageSlider images={product.images} /></a>}
            >
                <Meta
                    title={product.title}
                    description={`$${product.price}`}
                />
            </Card>
        </Col>
    })

    const showFilteredResults = (filters) => {

        let body = {
            skip: 0,
            limit: Limit,
            filters: filters,
            viewed: false
        }
        getProducts(body)
        setSkip(0)
    }


    const handlePrice = (value) => {
        const data = price;
        let array = [];

        for (let key in data) {
            if (data[key]._id === parseInt(value, 10)) {
                array = data[key].array;
            }
        }
        return array;
    }

    const handleFilters = (filters, category) => {

        const newFilters = { ...Filters }

        newFilters[category] = filters

        console.log('filters', filters)

        if (category === "price") {
            let priceValues = handlePrice(filters)
            newFilters[category] = priceValues
        }
        showFilteredResults(newFilters)
        setFilters(newFilters)
    }

    const updateSearchTerm = (newSearchTerm) => {

        let body = {
            skip: 0,
            limit: Limit,
            filters: Filters,
            searchTerm: newSearchTerm,
            viewed: false
        }

        setSkip(0) //if user clicked more button, skip is not 0 
        setSearchTerm(newSearchTerm)
        getProducts(body)
        if (newSearchTerm.length > 0) setShowFilters(true);
        else setShowFilters(false)
    }

    console.log('window.location.href: ', window.location.href)

    return (
        <div style={{ width: '75%', margin: '3rem auto' }}>

            {/* Search */}
            < Row align={'top'}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Links />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img style={{ minWidth: '100px', width: '100px', height: '80px', paddingBottom: '1.5rem', }}
                        src={`${window.location.href}uploads/icon/dh_icon.gif`} />
                    <h1 style={{ marginLeft: '-1rem' }}>11Dean's Canada Shop</h1>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem auto' }}>
                    <SearchFeature
                        refreshFunction={updateSearchTerm}
                    />
                </div>
            </Row>

            {/* Filter */}
            < Row gutter={[16, 16]}>

                <Col lg={12} xs={24}>
                    {/* CheckBox */}
                    {
                        ShowFilters &&
                        <Checkbox list={continents} handleFilters={filters => handleFilters(filters, "continents")} />
                    }
                </Col>
                <Col lg={12} xs={24}>
                    {/* RadioBox */}
                    {
                        ShowFilters &&
                        <Radiobox list={price} handleFilters={filters => handleFilters(filters, "price")} />
                    }
                </Col>
            </Row>

            {/** Recently viewed posts */}
            {RecentViewedProducts.length > 0 ?
                <div>
                    <div style={{ textAlign: 'left' }}>
                        <h2>Recently Viewed Posts <Icon type="time" /> </h2>
                    </div>
                    <Row gutter={[16, 16]} >
                        {renderRecentlyViewed}
                    </Row>
                </div>
                :
                null
            }
            {/* Recently Posted */}
            <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                <h2>Recently Posted <Icon type="time" /> </h2>
            </div>
            <Row gutter={[16, 16]} >
                {renderRecentlyPosted}
            </Row>
            <br />
            {
                PostSize >= Limit &&
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={loadMoreHanlder}>More</button>
                </div>
            }

        </div >
    )
}

export default LandingPage
