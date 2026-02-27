migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");

  const record = new Record(collection);
  record.set("email", "vikram@vikrampresence.in");
  record.set("password", "changeme123");
  record.set("emailVisibility", true);
  record.set("verified", true);

  app.save(record);
}, (app) => {
  const collection = app.findCollectionByNameOrId("admins");

  const record = app.findFirstRecordByData("admins", "email", "vikram@vikrampresence.in");
  if (record) {
    app.delete(record);
  }
});