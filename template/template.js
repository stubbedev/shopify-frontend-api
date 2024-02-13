(function (window, document) {
  function getHost() {
    let h = document.querySelector("#{{ content.id }}");
    if (document.querySelector(h.getAttribute("data-target"))) {
      h = document.querySelector(h.getAttribute("data-target"));
    }
    return h;
  }

  function hydrateContent(h) {
    let els = h.querySelectorAll(".clerk_product_tile_p");
    const len = els.length;
    for (let i = 0; i < len; i++) {
      const el = els[i];
      let key = el.dataset.clerkIdent;
      let price = window.clerk_api_data[key]
          ? window.clerk_api_data[key].price
          : "Not Available for Market",
        list_price = window.clerk_api_data[key]
          ? window.clerk_api_data[key].list_price
          : "",
        price_el = el.querySelector(`[data-price-ident]`),
        list_price_el = el.querySelector(`[data-list-price-ident]`);

      if (price_el && price) {
        price_el.innerHTML = price;
      }
      if (list_price_el && list_price) {
        list_price_el.innerHTML = list_price;
      }
    }
  }

  if (window.clerk_api_data && Object.keys(window.clerk_api_data).length > 0) {
    hydrateContent(getHost());
  }
  window.addEventListener("clerk_shopify_api", function () {
    hydrateContent(getHost());
  });
})(window, document);
