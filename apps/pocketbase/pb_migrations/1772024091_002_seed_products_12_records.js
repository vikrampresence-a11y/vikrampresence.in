/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("title", "Clarity Blueprint");
    record0.set("description", "Learn to cut through confusion and find your true direction. Simple exercises for instant clarity.");
    record0.set("price", 199);
    record0.set("type", "ebook");
    record0.set("active", true);
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
    record1.set("title", "Discipline Mastery");
    record1.set("description", "Build unbreakable habits that stick. Practical framework used by high performers.");
    record1.set("price", 249);
    record1.set("type", "ebook");
    record1.set("active", true);
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
    record2.set("title", "Confidence Code");
    record2.set("description", "Unlock your inner strength. Real techniques to feel confident in any situation.");
    record2.set("price", 299);
    record2.set("type", "ebook");
    record2.set("active", true);
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
    record3.set("title", "Focus Formula");
    record3.set("description", "Master deep work and eliminate distractions. Proven system for laser focus.");
    record3.set("price", 349);
    record3.set("type", "ebook");
    record3.set("active", true);
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
    record4.set("title", "Success Mindset");
    record4.set("description", "Think like a winner. Mental shifts that change everything.");
    record4.set("price", 399);
    record4.set("type", "ebook");
    record4.set("active", true);
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
    record5.set("title", "Life Transformation");
    record5.set("description", "Complete guide to redesigning your life. Step-by-step blueprint for lasting change.");
    record5.set("price", 499);
    record5.set("type", "ebook");
    record5.set("active", true);
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("title", "30-Day Clarity Challenge");
    record6.set("description", "Daily lessons and exercises to find clarity. Structured 30-day program with community support.");
    record6.set("price", 499);
    record6.set("type", "course");
    record6.set("active", true);
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("title", "Discipline Bootcamp");
    record7.set("description", "Intensive training to build iron discipline. Video lessons, worksheets, accountability system.");
    record7.set("price", 699);
    record7.set("type", "course");
    record7.set("active", true);
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("title", "Confidence Accelerator");
    record8.set("description", "Fast-track your confidence growth. Live sessions, group coaching, practical assignments.");
    record8.set("price", 799);
    record8.set("type", "course");
    record8.set("active", true);
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("title", "Focus Mastery Program");
    record9.set("description", "Advanced techniques for deep focus. Video modules, daily practices, progress tracking.");
    record9.set("price", 899);
    record9.set("type", "course");
    record9.set("active", true);
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    record10.set("title", "Success Blueprint Course");
    record10.set("description", "Complete system for success. Comprehensive curriculum with lifetime access.");
    record10.set("price", 999);
    record10.set("type", "course");
    record10.set("active", true);
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    record11.set("title", "Complete Life Transformation");
    record11.set("description", "Full transformation program. All modules, coaching, community, lifetime updates.");
    record11.set("price", 1299);
    record11.set("type", "course");
    record11.set("active", true);
  try {
    app.save(record11);
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
