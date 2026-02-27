/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("whatYouLearn");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new TextField({
    name: "whatYouLearn",
    required: false
  }));
  return app.save(collection);
})
