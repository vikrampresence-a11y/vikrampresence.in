/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  const field = collection.fields.getByName("type");
  field.values = ["ebook", "course"];
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  const field = collection.fields.getByName("type");
  field.values = ["podcast", "ebook", "course"];
  return app.save(collection);
})
