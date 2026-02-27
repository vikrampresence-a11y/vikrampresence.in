/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("type");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("products");
  collection.fields.add(new SelectField({
    name: "type",
    required: true,
    values: ["ebook", "course"],
    maxSelect: 1
  }));
  return app.save(collection);
})
