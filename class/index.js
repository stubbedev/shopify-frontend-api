class clerk_shopify_api {
    constructor(
        refresh_interval=43200
    ){
        this.refresh_interval = 43200
        if(!window.clerk_api_data){
            window.clerk_api_data = {}
        }
    }

    static get_storage_method = () => {
        if(window.navigator.cookieEnabled){
            return 'cookie'
        } else {
            return 'window'
        }
    }

    static validate_data = (storage_location) => {
        if(storage_location == 'cookie'){
            if(
                window.localStorage['clerk_api_data'] &&
                Object.keys(JSON.parse(window.localStorage['clerk_api_data']).length > 0) &&
                window.localStorage['clerk_api_timestamp'] &&
                parseInt(window.localStorage['clerk_api_timestamp']) + this.refresh_interval < this.get_time_now()
            ){
                return 'stored'
            }
        }
        if(storage_location == 'window'){
            if(Object.keys(window.clerk_api_data).length > 0) {
                return 'stored'
            }
        }
        return 'not stored'
    }

    static send_event = () => {
        const custom_event = new Event('clerk_shopify_api')
        window.dispatchEvent(custom_event)
    }
    static get_time_now = () => { return Date.now() };
    static get_api_route = () => {
        return `${window.location.origin}${Shopify.routes.root}collections/clerk-api?view=json`
    }
    static get_page_param = (page = null) => {
        if(!page) { page = 1 }
        return `&page=${page}`
    }
    static fetch_data = async (page) => {
        try {
            const rsp = await fetch(`${this.get_api_route()}${this.get_page_param(page)}`)
            const json = await rsp.json()
            return json
        } catch (error) {
            console.error(error)
        }
    }

    static get_data = async () => {
        if(
            this.get_storage_method() == 'cookie' &&
            this.validate_data() == 'stored'
        ) {
            window.clerk_api_data = JSON.parse(window.localStorage['clerk_api_data'])
            this.send_event()
        } else {
            let continue_sync = true
            let page = 1
            let product_count = 0
            let total_product_count = 0
            while(continue_sync){
                const rsp = await this.fetch_data(page)
                console.log(`Fetched page ${page} of product data with page size 1000`)
                if(rsp.count && rsp.total){
                    page += 1
                    product_count += rsp.count
                    total_product_count = rsp.total
                }
                if(rsp.products){
                    this.set_data(rsp.products)
                }
                if(product_count == total_product_count){
                    continue_sync = false
                    break
                }
            }
            if(!continue_sync){
                if(this.get_storage_method() == 'cookie') {
                    window.localStorage['clerk_api_data'] = JSON.stringify(window.clerk_api_data)
                    window.localStorage['clerk_api_timestamp'] = this.get_time_now()
                }
                this.send_event()
            }
        }
    }

    static set_data = (data) => {
        window.clerk_api_data = Object.assign({}, window.clerk_api_data, data)
    }

    static init = () => {
        this.get_data()
        window.addEventListener('clerk_shopify_api', (e) => {
            console.log('Clerk API frontend data built')
        })
    }
}