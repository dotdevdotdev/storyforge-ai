import clientPromise from "../lib/db";

export async function saveStory(story, imageUrl) {
  const client = await clientPromise;
  const db = client.db("storyforge");
  const result = await db.collection("stories").insertOne({
    content: story,
    imageUrl: imageUrl,
    createdAt: new Date(),
  });
  return result.insertedId;
}

export async function getStories() {
  const client = await clientPromise;
  const db = client.db("storyforge");
  return await db
    .collection("stories")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}
