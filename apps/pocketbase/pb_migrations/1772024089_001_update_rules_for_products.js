/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.collectionName = \"admins\"";
  collection.updateRule = "@request.auth.collectionName = \"admins\"";
  collection.deleteRule = "@request.auth.collectionName = \"admins\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.collectionName = \"admins\"";
  collection.updateRule = "@request.auth.collectionName = \"admins\"";
  collection.deleteRule = "@request.auth.collectionName = \"admins\"";
  return app.save(collection);
})
