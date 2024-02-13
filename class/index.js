class clerk_shopify_api {
  static init = (use_storage = true) => {
    if (!window.clerk_api_data) {
      window.clerk_api_data = {};
    }
    this.get_data(use_storage);
    // Add event listener for ASYNC hydration
    window.addEventListener("clerk_shopify_api", (e) => {
      console.log("Clerk API frontend data built");
    });
  };

  static store_locally = () => {
    if (window.navigator.cookieEnabled) {
      return true;
    } else {
      return false;
    }
  };

  static validate_data = () => {
    if (this.store_locally()) {
      const local_data = window.localStorage["clerk_api_data"]
        ? JSON.parse(window.localStorage["clerk_api_data"])
        : false;
      const local_time = window.localStorage["clerk_api_timestamp"]
        ? parseInt(window.localStorage["clerk_api_timestamp"]) + 43200
        : false;
      const local_curr = window.localStorage["clerk_api_currency"]
        ? window.localStorage["clerk_api_currency"]
        : false;
      if (local_curr && local_curr != "{{ cart.currency.iso_code }}") {
        return false;
      }
      if (local_data && local_time && local_time < this.get_time_now()) {
        return true;
      }
    } else {
      if (Object.keys(window.clerk_api_data).length > 0) {
        return true;
      }
    }
    return false;
  };

  static send_event = () => {
    const custom_event = new Event("clerk_shopify_api");
    window.dispatchEvent(custom_event);
  };
  static get_time_now = () => {
    return Date.now();
  };
  static get_api_route = () => {
    return `${window.location.origin}${Shopify.routes.root}collections/clerk-api?view=json`;
  };
  static get_page_param = (page = null) => {
    if (!page) {
      page = 1;
    }
    return `&page=${page}`;
  };
  static fetch_data = async (page) => {
    try {
      const rsp = await fetch(
        `${this.get_api_route()}${this.get_page_param(page)}`,
      );
      const json = await rsp.json();
      return json;
    } catch (error) {
      console.error(error);
    }
  };

  static get_data = async (use_storage) => {
    if (use_storage && this.store_locally() && this.validate_data()) {
      window.clerk_api_data = JSON.parse(window.localStorage["clerk_api_data"]);
      this.send_event();
      return;
    }
    let continue_sync = true;
    let page = 1;
    let product_count = 0;
    let total_product_count = 0;
    while (continue_sync) {
      const rsp = await this.fetch_data(page);
      console.log(`Fetched page ${page} of product data with page size 1000`);
      if (rsp.count && rsp.total) {
        page += 1;
        product_count += rsp.count;
        total_product_count = rsp.total;
      }
      if (rsp.products) {
        this.set_data(rsp.products);
      }
      if (product_count == total_product_count) {
        continue_sync = false;
        break;
      }
    }
    if (!continue_sync) {
      if (use_storage && this.store_locally()) {
        window.localStorage["clerk_api_data"] = JSON.stringify(
          window.clerk_api_data,
        );
        window.localStorage["clerk_api_timestamp"] = this.get_time_now();
        if (Shopify) {
          window.localStorage["clerk_api_currency"] =
            "{{ cart.currency.iso_code }}";
        }
      }
      this.send_event();
      return;
    }
  };

  static set_data = (data) => {
    window.clerk_api_data = Object.assign({}, window.clerk_api_data, data);
  };
}
