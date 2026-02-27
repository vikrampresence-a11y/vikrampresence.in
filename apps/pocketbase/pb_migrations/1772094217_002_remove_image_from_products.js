/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("image");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new FileField({
    name: "image",
    required: false,
    maxSelect: 1,
    maxSize: 20971520
  }));
  return app.save(collection);
})
