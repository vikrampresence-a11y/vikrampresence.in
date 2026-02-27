/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("name", "Clarity Blueprint");
    record0.set("type", "EBOOK");
    record0.set("price", 299);
    record0.set("description", "Master mental clarity and decision-making skills");
    record0.set("isActive", true);
    record0.set("googleDriveLink", "https://drive.google.com/placeholder");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("name", "Discipline Bootcamp");
    record1.set("type", "COURSE");
    record1.set("price", 499);
    record1.set("description", "Build unbreakable discipline and consistency habits");
    record1.set("isActive", true);
    record1.set("googleDriveLink", "https://drive.google.com/placeholder");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("name", "Confidence Accelerator");
    record2.set("type", "COURSE");
    record2.set("price", 399);
    record2.set("description", "Transform self-doubt into unstoppable confidence");
    record2.set("isActive", true);
    record2.set("googleDriveLink", "https://drive.google.com/placeholder");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("name", "Mindset Mastery");
    record3.set("type", "EBOOK");
    record3.set("price", 199);
    record3.set("description", "Reprogram your mind for success and abundance");
    record3.set("isActive", true);
    record3.set("googleDriveLink", "https://drive.google.com/placeholder");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("name", "Success Secrets");
    record4.set("type", "EBOOK");
    record4.set("price", 249);
    record4.set("description", "Proven strategies from high achievers revealed");
    record4.set("isActive", true);
    record4.set("googleDriveLink", "https://drive.google.com/placeholder");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("name", "Growth Hacking");
    record5.set("type", "COURSE");
    record5.set("price", 599);
    record5.set("description", "Accelerate personal growth with proven frameworks");
    record5.set("isActive", true);
    record5.set("googleDriveLink", "https://drive.google.com/placeholder");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
