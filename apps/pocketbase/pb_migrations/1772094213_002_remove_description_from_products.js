/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("description");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new TextField({
    name: "description",
    required: false
  }));
  return app.save(collection);
})
