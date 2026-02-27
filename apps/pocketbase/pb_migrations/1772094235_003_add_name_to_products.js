/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  
  collection.fields.add(new TextField({
    name: "name",
    required: true
  }));
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("name");
  return app.save(collection);
})
