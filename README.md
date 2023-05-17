# shopify-frontend-api

## Getting Contextual DATA JIT

This is a design document covering how to get a contextual data in real time for showing within content returned from the Clerk.io API.

The design patterns is composed of the following parts:

1. A collection containing all products.
2. An alternate layout for rendering collection information as JSON.
3. A JS Class which collects the data made available in the collection.
4. A JS Snippet which consumes the data for the relevant product ids in a given result and places them within a div in the template.

## 1. The Collection

In order to ensure you have a collection with all possible products, I recommend to create a collection with a condition met by all product. The collection should be named `Clerk api`, as this will result in it receiving the route `/collection/clerk-api` frontend.

The condition for the collection should be something like `price > -1000000`. 

## 2. The Alternate Layout for Collections

Second we need to create an alternate layout for showing our data using the collection.

In order to do this, we first edit the theme code for the theme we wish to use. Under the templates section in the left hand side, press `Add new Template`.

In the popup select `collection` for the resource type.

Select `liquid` for the file type.

Write `json` in the bottom most field, so that the name of the created template is `collection.json.liquid`.

The contents of this file should be the `collection.json.liquid` file found in the `liquid` folder for this project.

You are welcome to add field to the product in this template as required.

## 3. The JS Class handling data from our newly created endpoint.

In order to grab the data from our collection and prepare it so it can be used, we need to place the entire contents of `index.js` in our `class` folder in this project, inside the script tag containing `Clerk.js` which you have placed in `theme.liquid`.

It should look something like this:

<script>
// Clerk.js Injection Code
// Clerk Config with Key and Formatters
// Class from this project
clerk_shopify_api.init() // Finally init() for the class to make sure it runs when the page loads.
</script>

This class will invalidate data based on timestamps and currencies, without you needing to change the code.

The time before invalidation is 12 hours since last building data.

Any change in currency context also invalidates the data.

## 4. The JS function which loads the relevant data into the template.

Lastly you should include the `template.js` in the design template used. The function grabs the data when available and places it in specific child elements within each product tile.

The example include the `list_price` and `price` fields.

## Things of Note

If you need to use fields which are different from the `price` and `list_price`, you would add them in `collection.json.liquid` and then edit the `template.html` and `template.js` to also consume those fields.

You should never need to edit the Class described in step 3.