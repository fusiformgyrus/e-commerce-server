
const request = require('supertest')
const app = require('../app.js')

const {sequelize} = require('../models')
const {queryInterface} = sequelize
const {hashPassword} = require('../helpers/bcrypt.js')
const jwt = require('jsonwebtoken')

let accesstoken = ''

beforeAll((done) => {
    console.log('LIFECYCLE PRODUCTS ==> beforeAll')

    let id = 1
    let email = 'admin1@email.com'

    queryInterface.bulkDelete('Users', null, {})
        .then(() => {
            const dummyUser = {
                id: id,
                email: email,
                password: hashPassword('admin1'),
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            }
            return queryInterface.bulkInsert('Users', [dummyUser])
        })
        .then((data) => {
            console.log('QUERY INTERFACE -> PRODUCTS', data)
            const dummyToken = jwt.sign({email, id}, 'ubigoreng')
            accesstoken = dummyToken

            return queryInterface.bulkInsert('Products', [
                {
                    id: 1,
                    name: 'Jeruk',
                    image_url: 'http://www.image.com/1',
                    price: 1000,
                    stock: 20,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 2,
                    name: 'Nanas',
                    image_url: 'http://www.image.com/2',
                    price: 5000,
                    stock: 26,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 3,
                    name: 'Manggis',
                    image_url: 'http://www.image.com/3',
                    price: 500,
                    stock: 19,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ])
        })
        .then(() => {
            done()
        })
})


afterAll((done) => {
    console.log('LIFECYCLE PRODUCTS ==> afterAll')
    queryInterface.bulkDelete('Products', null, {})
        .then(() => {
            return queryInterface.bulkDelete('Users', null, {})
        })
        .then(() => {
            done()
        })
})

beforeEach(() => {})
afterEach(() => {})

// PRODUCTS --> DISPLAY ALL
describe('GET /products/', () => {
    
    it('With valid accesstoken, should display all available products', function(done) {
        request(app)
            .get('/products')
            .set('accesstoken', accesstoken)
            .then((response) => {
                expect(response.status).toBe(200)
                expect(response.body).toHaveProperty('products', expect.any(Array))
                done()
            })
    })

    it('Without valid accesstoken, should not display any product', function(done) {
        request(app)
            .get('/products')
            .set('accesstoken', !accesstoken)
            .then((response) => {
                expect(response.status).toBe(401)
                expect(response.body).toHaveProperty('error', expect.any(Object))
                done()
            })
    })
})

// PRODUCTS --> CREATE NEW PRODUCT
describe.only('POST /products/', () => {
    
    it('With a valid accesstoken AND role is admin, a product can be created', function(done) {
        request(app)
            .post('/products')
            .set('Content-Type', 'application/json')
            .set('accesstoken', accesstoken)
            .send({
                name: 'Durian',
                image_url: 'http://www.image.com/4',
                price: 250000,
                stock: 6,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .then((response) => {
                expect(response.status).toBe(201)
                expect(response.body).toHaveProperty('product', expect.any(Object))
                done()
            })
    })

    it.only('Without a valid accesstoken and/or role is not admin, a product cannot be created', function(done) {
        request(app)
            .post('/products')
            .set('Content-Type', 'application/json')
            .set('accesstoken', !accesstoken)
            .send({
                name: 'Durian',
                image_url: 'http://www.image.com/4',
                price: 250000,
                stock: 6,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .then((response) => {
                expect(response.status).toBe(401)
                expect(response.body).toHaveProperty('error', expect.any(Object))
                done()
            })
    })
})