/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  
  collection.fields.add(new TextField({
    name: "googleDriveLink",
    required: true
  }));
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("googleDriveLink");
  return app.save(collection);
})
