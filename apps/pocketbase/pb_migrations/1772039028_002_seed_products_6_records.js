/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("title", "Web Development Fundamentals");
    record0.set("description", "Learn the basics of HTML, CSS, and JavaScript");
    record0.set("price", 499);
    record0.set("type", "ebook");
    record0.set("productType", "ebook");
    record0.set("active", true);
    record0.set("benefits", "Lifetime access, PDF download, Email support");
    record0.set("whatYouLearn", "HTML basics, CSS styling, JavaScript fundamentals, Responsive design");
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
    record1.set("title", "Python Programming Guide");
    record1.set("description", "Complete guide to Python programming for beginners");
    record1.set("price", 599);
    record1.set("type", "ebook");
    record1.set("productType", "ebook");
    record1.set("active", true);
    record1.set("benefits", "Lifetime access, PDF download, Code examples, Email support");
    record1.set("whatYouLearn", "Python syntax, Data structures, Functions, Object-oriented programming, File handling");
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
    record2.set("title", "Digital Marketing Essentials");
    record2.set("description", "Master the fundamentals of digital marketing");
    record2.set("price", 699);
    record2.set("type", "ebook");
    record2.set("productType", "ebook");
    record2.set("active", true);
    record2.set("benefits", "Lifetime access, PDF download, Templates, Email support");
    record2.set("whatYouLearn", "SEO basics, Social media marketing, Email marketing, Content strategy, Analytics");
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
    record3.set("title", "Advanced React Development");
    record3.set("description", "Master React.js with real-world projects");
    record3.set("price", 2999);
    record3.set("type", "course");
    record3.set("productType", "course");
    record3.set("duration", "8 weeks");
    record3.set("active", true);
    record3.set("benefits", "Lifetime access, Video lectures, Project files, Certificate, Community support, 1-on-1 mentoring");
    record3.set("whatYouLearn", "React hooks, State management, Redux, Context API, Performance optimization, Testing, Deployment");
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
    record4.set("title", "Full Stack Web Development Bootcamp");
    record4.set("description", "Complete bootcamp covering frontend and backend development");
    record4.set("price", 4999);
    record4.set("type", "course");
    record4.set("productType", "course");
    record4.set("duration", "12 weeks");
    record4.set("active", true);
    record4.set("benefits", "Lifetime access, Video lectures, Live sessions, Project files, Certificate, Job assistance, Community support");
    record4.set("whatYouLearn", "HTML/CSS/JavaScript, React, Node.js, Express, MongoDB, REST APIs, Authentication, Deployment, DevOps basics");
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
    record5.set("title", "Data Science & Machine Learning Masterclass");
    record5.set("description", "Learn data science and machine learning from scratch");
    record5.set("price", 3999);
    record5.set("type", "course");
    record5.set("productType", "course");
    record5.set("duration", "10 weeks");
    record5.set("active", true);
    record5.set("benefits", "Lifetime access, Video lectures, Jupyter notebooks, Real datasets, Certificate, Community support, Career guidance");
    record5.set("whatYouLearn", "Python for data science, Pandas, NumPy, Matplotlib, Scikit-learn, Machine learning algorithms, Deep learning basics, Data visualization");
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
