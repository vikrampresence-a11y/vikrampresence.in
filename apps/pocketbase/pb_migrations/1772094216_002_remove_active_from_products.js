/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("active");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new BoolField({
    name: "active",
    required: false
  }));
  return app.save(collection);
})
