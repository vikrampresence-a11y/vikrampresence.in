/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("productType");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new SelectField({
    name: "productType",
    required: true,
    values: ["ebook", "course"],
    maxSelect: 0
  }));
  return app.save(collection);
})
